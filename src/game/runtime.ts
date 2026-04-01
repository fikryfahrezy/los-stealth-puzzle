import * as THREE from 'three'
import {
  advanceCampaignLevel,
  createCampaignState,
  createRuntimeSnapshot,
  getCurrentLevel,
  replayCampaign,
  restartCurrentLevel,
  updateCampaignState
} from './campaign'
import { campaignLevels } from './level'
import type { ControlState, GuardConfig, GuardState, ObstacleConfig, RuntimeSnapshot } from './types'

export interface GameRuntimeHandle {
  restartLevel: () => void
  advanceLevel: () => void
  replayCampaign: () => void
  dispose: () => void
}

interface GuardVisual {
  root: THREE.Group
  body: THREE.Group
  vision: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>
}

const keyBindings: Record<string, keyof ControlState> = {
  ArrowUp: 'up',
  KeyW: 'up',
  ArrowDown: 'down',
  KeyS: 'down',
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right'
}

export function createGameRuntime(
  mountTarget: HTMLDivElement,
  onStateChange: (snapshot: RuntimeSnapshot) => void
): GameRuntimeHandle {
  let campaignState = createCampaignState(campaignLevels)
  const controls: ControlState = { up: false, down: false, left: false, right: false }

  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#081418')
  scene.fog = new THREE.Fog('#081418', 18, 34)

  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100)
  camera.position.set(11, 17, 22)
  camera.lookAt(new THREE.Vector3(11, 0, 9))

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  mountTarget.appendChild(renderer.domElement)

  const ambientLight = new THREE.AmbientLight('#d3f6ff', 0.8)
  const directionalLight = new THREE.DirectionalLight('#ffffff', 1.45)
  directionalLight.position.set(10, 18, 8)
  scene.add(ambientLight, directionalLight)

  const levelRoot = new THREE.Group()
  scene.add(levelRoot)

  const playerMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 24, 24),
    new THREE.MeshStandardMaterial({ color: '#7ae582', roughness: 0.45, metalness: 0.2 })
  )
  scene.add(playerMesh)

  const guardVisuals = new Map<string, GuardVisual>()

  let animationFrame = 0
  let lastFrameTime = performance.now()

  const resize = () => {
    const width = Math.max(mountTarget.clientWidth, 320)
    const height = Math.max(mountTarget.clientHeight, 320)
    renderer.setSize(width, height)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }

  const emitState = () => {
    onStateChange(createRuntimeSnapshot(campaignState))
  }

  const clearControls = () => {
    for (const key of Object.keys(controls) as Array<keyof ControlState>) {
      controls[key] = false
    }
  }

  const rebuildLevel = () => {
    clearLevelRoot(levelRoot)
    guardVisuals.clear()

    const level = getCurrentLevel(campaignState)
    const floorWidth = level.bounds.maxX - level.bounds.minX
    const floorDepth = level.bounds.maxZ - level.bounds.minZ
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(floorWidth, floorDepth, 12, 12),
      new THREE.MeshStandardMaterial({ color: '#0d2d26', metalness: 0.1, roughness: 0.8 })
    )
    floor.rotation.x = -Math.PI / 2
    floor.position.set(
      (level.bounds.minX + level.bounds.maxX) / 2,
      0,
      (level.bounds.minZ + level.bounds.maxZ) / 2
    )
    levelRoot.add(floor)

    const grid = new THREE.GridHelper(Math.max(floorWidth, floorDepth), 22, '#255c50', '#14352e')
    grid.position.y = 0.01
    levelRoot.add(grid)

    for (const obstacle of level.obstacles) {
      levelRoot.add(createObstacleMesh(obstacle))
    }

    const goalMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(level.goal.size.x, level.goal.size.z),
      new THREE.MeshBasicMaterial({ color: '#f6bd60', transparent: true, opacity: 0.65 })
    )
    goalMesh.rotation.x = -Math.PI / 2
    goalMesh.position.set(level.goal.position.x, 0.03, level.goal.position.z)
    levelRoot.add(goalMesh)

    for (const guard of level.guards) {
      const visual = createGuardVisual(guard)
      guardVisuals.set(guard.id, visual)
      levelRoot.add(visual.root)
    }
  }

  const syncScene = () => {
    const level = getCurrentLevel(campaignState)
    const state = campaignState.gameState

    playerMesh.position.set(state.player.position.x, state.player.radius, state.player.position.z)

    for (const guardState of state.guards) {
      const guardConfig = level.guards.find((guard) => guard.id === guardState.id)
      const visual = guardVisuals.get(guardState.id)
      if (!guardConfig || !visual) {
        continue
      }

      syncGuardVisual(guardState, guardConfig, visual, state)
    }
  }

  const frame = (timestamp: number) => {
    const deltaSeconds = Math.min((timestamp - lastFrameTime) / 1000, 0.05)
    lastFrameTime = timestamp
    campaignState = updateCampaignState(campaignState, controls, deltaSeconds)
    syncScene()
    emitState()
    renderer.render(scene, camera)
    animationFrame = window.requestAnimationFrame(frame)
  }

  const onKeyChange = (pressed: boolean) => (event: KeyboardEvent) => {
    const binding = keyBindings[event.code]
    if (!binding) {
      return
    }
    controls[binding] = pressed
    event.preventDefault()
  }

  const keyDownHandler = onKeyChange(true)
  const keyUpHandler = onKeyChange(false)

  window.addEventListener('resize', resize)
  window.addEventListener('keydown', keyDownHandler)
  window.addEventListener('keyup', keyUpHandler)

  rebuildLevel()
  resize()
  syncScene()
  emitState()
  animationFrame = window.requestAnimationFrame(frame)

  return {
    restartLevel: () => {
      clearControls()
      campaignState = restartCurrentLevel(campaignState)
      lastFrameTime = performance.now()
      syncScene()
      emitState()
    },
    advanceLevel: () => {
      if (createRuntimeSnapshot(campaignState).canAdvance) {
        clearControls()
        campaignState = advanceCampaignLevel(campaignState)
        lastFrameTime = performance.now()
        rebuildLevel()
        syncScene()
        emitState()
      }
    },
    replayCampaign: () => {
      clearControls()
      const shouldRebuild = campaignState.currentLevelIndex !== 0
      campaignState = replayCampaign(campaignState)
      lastFrameTime = performance.now()
      if (shouldRebuild) {
        rebuildLevel()
      }
      syncScene()
      emitState()
    },
    dispose: () => {
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('keydown', keyDownHandler)
      window.removeEventListener('keyup', keyUpHandler)
      clearLevelRoot(levelRoot)
      renderer.dispose()
      mountTarget.removeChild(renderer.domElement)
    }
  }
}

function clearLevelRoot(levelRoot: THREE.Group): void {
  const children = [...levelRoot.children]
  for (const child of children) {
    levelRoot.remove(child)
    child.traverse((node) => {
      const mesh = node as THREE.Mesh
      if ('geometry' in mesh && mesh.geometry) {
        mesh.geometry.dispose()
      }
      if ('material' in mesh && mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((material) => material.dispose())
        } else {
          mesh.material.dispose()
        }
      }
    })
  }
}

function createObstacleMesh(obstacle: ObstacleConfig): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(obstacle.size.x, obstacle.size.y, obstacle.size.z),
    new THREE.MeshStandardMaterial({ color: '#476a61', roughness: 0.92, metalness: 0.08 })
  )
  mesh.position.set(obstacle.position.x, obstacle.size.y / 2, obstacle.position.z)
  return mesh
}

function createGuardVisual(guard: GuardConfig): GuardVisual {
  const root = new THREE.Group()
  const body = new THREE.Group()
  root.add(body)

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.34, 0.42, 1.15, 20),
    new THREE.MeshStandardMaterial({ color: '#ff8c69', roughness: 0.5, metalness: 0.12 })
  )
  base.position.y = 0.58
  body.add(base)

  const face = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.18, 0.32),
    new THREE.MeshStandardMaterial({ color: '#ffd7c2' })
  )
  face.position.set(0, 0.78, 0.32)
  body.add(face)

  const visionShape = new THREE.Shape()
  visionShape.moveTo(0, 0)
  const halfAngle = (guard.fovDeg * Math.PI) / 360
  const steps = 28
  for (let step = 0; step <= steps; step += 1) {
    const angle = -halfAngle + (step / steps) * halfAngle * 2
    visionShape.lineTo(Math.sin(angle) * guard.viewRange, Math.cos(angle) * guard.viewRange)
  }
  visionShape.lineTo(0, 0)

  const visionGeometry = new THREE.ShapeGeometry(visionShape)
  visionGeometry.rotateX(-Math.PI / 2)
  visionGeometry.rotateY(Math.PI)

  const vision = new THREE.Mesh(
    visionGeometry,
    new THREE.MeshBasicMaterial({ color: '#ff6b6b', transparent: true, opacity: 0.22, side: THREE.DoubleSide })
  )
  vision.position.y = 0.02
  root.add(vision)

  return { root, body, vision }
}

function syncGuardVisual(
  guardState: GuardState,
  _guardConfig: GuardConfig,
  visual: GuardVisual,
  snapshotState: RuntimeSnapshot['gameState']
): void {
  const heading = Math.atan2(guardState.forward.x, guardState.forward.z)
  visual.root.position.set(guardState.position.x, 0, guardState.position.z)
  visual.root.rotation.y = heading

  visual.vision.position.y = 0.03
  const isDetector = snapshotState.detectionGuardId === guardState.id
  visual.vision.material.opacity = isDetector ? 0.42 : 0.22
  visual.vision.material.color.set(isDetector ? '#ff3b30' : '#ff6b6b')

  const bodyMaterial = (visual.body.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial
  bodyMaterial.color.set(isDetector ? '#ff4d4d' : '#ff8c69')
}