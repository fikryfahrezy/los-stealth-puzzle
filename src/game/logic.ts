import type {
  ControlState,
  GameState,
  GuardConfig,
  GuardState,
  LevelConfig,
  ObstacleConfig,
  PatrolStep,
  Vec2
} from './types'

const EPSILON = 0.0001

export function createInitialGameState(level: LevelConfig): GameState {
  return {
    status: 'active',
    time: 0,
    player: {
      position: { ...level.player.spawn },
      radius: level.player.radius,
      speed: level.player.speed
    },
    guards: level.guards.map((guard) => {
      const start = guard.patrol[0]
      const next = guard.patrol[1] ?? guard.patrol[0]
      return {
        id: guard.id,
        position: { ...start.position },
        patrolIndex: 0,
        waitRemaining: start.dwellSeconds ?? 0,
        forward: getStepFacing(start, next, { x: 0, z: 1 })
      }
    }),
    detectionGuardId: null
  }
}

export function updateGameState(
  previous: GameState,
  level: LevelConfig,
  controls: ControlState,
  deltaSeconds: number
): GameState {
  if (previous.status !== 'active') {
    return previous
  }

  const state: GameState = {
    status: 'active',
    time: previous.time + deltaSeconds,
    player: {
      ...previous.player,
      position: { ...previous.player.position }
    },
    guards: previous.guards.map((guard) => ({
      ...guard,
      position: { ...guard.position },
      forward: { ...guard.forward }
    })),
    detectionGuardId: null
  }

  movePlayer(state, level, controls, deltaSeconds)
  updateGuards(state, level, deltaSeconds)

  const spottedBy = detectPlayer(state, level)
  if (spottedBy) {
    state.status = 'failed'
    state.detectionGuardId = spottedBy
    return state
  }

  if (isPointInsideGoal(state.player.position, level)) {
    state.status = 'success'
  }

  return state
}

export function movePlayer(
  state: GameState,
  level: LevelConfig,
  controls: ControlState,
  deltaSeconds: number
): void {
  const input = {
    x: Number(controls.right) - Number(controls.left),
    z: Number(controls.down) - Number(controls.up)
  }

  if (input.x === 0 && input.z === 0) {
    return
  }

  const direction = normalize(input, { x: 0, z: 0 })
  const step = state.player.speed * deltaSeconds

  const movedX = clampToBounds(
    { x: state.player.position.x + direction.x * step, z: state.player.position.z },
    state.player.radius,
    level
  )
  if (!collidesWithObstacles(movedX, state.player.radius, level.obstacles)) {
    state.player.position = movedX
  }

  const movedZ = clampToBounds(
    { x: state.player.position.x, z: state.player.position.z + direction.z * step },
    state.player.radius,
    level
  )
  if (!collidesWithObstacles(movedZ, state.player.radius, level.obstacles)) {
    state.player.position = movedZ
  }
}

export function updateGuards(state: GameState, level: LevelConfig, deltaSeconds: number): void {
  state.guards = state.guards.map((guardState) => {
    const guardConfig = level.guards.find((guard) => guard.id === guardState.id)
    if (!guardConfig || guardConfig.patrol.length < 2) {
      return guardState
    }

    return advanceGuard(guardState, guardConfig, deltaSeconds)
  })
}

export function advanceGuard(
  guardState: GuardState,
  guardConfig: GuardConfig,
  deltaSeconds: number
): GuardState {
  if (guardConfig.patrol.length === 0) {
    return guardState
  }

  const nextState: GuardState = {
    ...guardState,
    position: { ...guardState.position },
    waitRemaining: guardState.waitRemaining,
    forward: { ...guardState.forward }
  }

  let remainingSeconds = deltaSeconds
  while (remainingSeconds > EPSILON) {
    const currentStep = guardConfig.patrol[nextState.patrolIndex]
    const nextIndex = (nextState.patrolIndex + 1) % guardConfig.patrol.length
    const nextStep = guardConfig.patrol[nextIndex] ?? currentStep

    if (nextState.waitRemaining > EPSILON) {
      const heldSeconds = Math.min(nextState.waitRemaining, remainingSeconds)
      nextState.waitRemaining -= heldSeconds
      remainingSeconds -= heldSeconds
      nextState.forward = getStepFacing(currentStep, nextStep, nextState.forward)
      continue
    }

    if (nextIndex === nextState.patrolIndex || guardConfig.speed <= EPSILON) {
      nextState.forward = getStepFacing(currentStep, nextStep, nextState.forward)
      break
    }

    const toTarget = {
      x: nextStep.position.x - nextState.position.x,
      z: nextStep.position.z - nextState.position.z
    }
    const distance = length(toTarget)

    if (distance <= EPSILON) {
      nextState.position = { ...nextStep.position }
      nextState.patrolIndex = nextIndex
      nextState.waitRemaining = nextStep.dwellSeconds ?? 0
      nextState.forward = getStepFacing(
        nextStep,
        guardConfig.patrol[(nextIndex + 1) % guardConfig.patrol.length] ?? nextStep,
        nextState.forward
      )
      continue
    }

    const direction = normalize(toTarget, nextState.forward)
    const travelDistance = guardConfig.speed * remainingSeconds
    nextState.forward = direction

    if (travelDistance + EPSILON >= distance) {
      nextState.position = { ...nextStep.position }
      nextState.patrolIndex = nextIndex
      nextState.waitRemaining = nextStep.dwellSeconds ?? 0
      remainingSeconds -= distance / guardConfig.speed
      nextState.forward = getStepFacing(
        nextStep,
        guardConfig.patrol[(nextIndex + 1) % guardConfig.patrol.length] ?? nextStep,
        direction
      )
    } else {
      nextState.position = {
        x: nextState.position.x + direction.x * travelDistance,
        z: nextState.position.z + direction.z * travelDistance
      }
      remainingSeconds = 0
    }
  }

  return nextState
}

export function detectPlayer(state: GameState, level: LevelConfig): string | null {
  for (const guardState of state.guards) {
    const guardConfig = level.guards.find((guard) => guard.id === guardState.id)
    if (!guardConfig) {
      continue
    }

    const toPlayer = {
      x: state.player.position.x - guardState.position.x,
      z: state.player.position.z - guardState.position.z
    }
    const distance = length(toPlayer)
    if (distance > guardConfig.viewRange || distance <= EPSILON) {
      continue
    }

    const direction = normalize(toPlayer, { x: 0, z: 1 })
    const forward = normalize(guardState.forward, { x: 0, z: 1 })
    const angleThreshold = Math.cos((guardConfig.fovDeg * Math.PI) / 360)
    const facingDot = forward.x * direction.x + forward.z * direction.z
    if (facingDot < angleThreshold) {
      continue
    }

    if (!isLineBlocked(guardState.position, state.player.position, level.obstacles)) {
      return guardState.id
    }
  }

  return null
}

export function isLineBlocked(start: Vec2, end: Vec2, obstacles: ObstacleConfig[]): boolean {
  return obstacles.some((obstacle) => {
    const minX = obstacle.position.x - obstacle.size.x / 2
    const maxX = obstacle.position.x + obstacle.size.x / 2
    const minZ = obstacle.position.z - obstacle.size.z / 2
    const maxZ = obstacle.position.z + obstacle.size.z / 2
    return segmentIntersectsRect(start, end, minX, maxX, minZ, maxZ)
  })
}

export function collidesWithObstacles(
  position: Vec2,
  radius: number,
  obstacles: ObstacleConfig[]
): boolean {
  return obstacles.some((obstacle) => circleIntersectsRect(position, radius, obstacle))
}

export function isPointInsideGoal(position: Vec2, level: LevelConfig): boolean {
  const halfWidth = level.goal.size.x / 2
  const halfDepth = level.goal.size.z / 2
  return (
    position.x >= level.goal.position.x - halfWidth &&
    position.x <= level.goal.position.x + halfWidth &&
    position.z >= level.goal.position.z - halfDepth &&
    position.z <= level.goal.position.z + halfDepth
  )
}

function clampToBounds(position: Vec2, radius: number, level: LevelConfig): Vec2 {
  return {
    x: clamp(position.x, level.bounds.minX + radius, level.bounds.maxX - radius),
    z: clamp(position.z, level.bounds.minZ + radius, level.bounds.maxZ - radius)
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function normalize(vector: Vec2, fallback: Vec2): Vec2 {
  const magnitude = length(vector)
  if (magnitude <= EPSILON) {
    return { ...fallback }
  }

  return {
    x: vector.x / magnitude,
    z: vector.z / magnitude
  }
}

function getStepFacing(step: PatrolStep, nextStep: PatrolStep, fallback: Vec2): Vec2 {
  if (step.watchDirection) {
    return normalize(step.watchDirection, fallback)
  }

  return normalize(
    {
      x: nextStep.position.x - step.position.x,
      z: nextStep.position.z - step.position.z
    },
    fallback
  )
}

function length(vector: Vec2): number {
  return Math.hypot(vector.x, vector.z)
}

function circleIntersectsRect(position: Vec2, radius: number, obstacle: ObstacleConfig): boolean {
  const minX = obstacle.position.x - obstacle.size.x / 2
  const maxX = obstacle.position.x + obstacle.size.x / 2
  const minZ = obstacle.position.z - obstacle.size.z / 2
  const maxZ = obstacle.position.z + obstacle.size.z / 2
  const nearestX = clamp(position.x, minX, maxX)
  const nearestZ = clamp(position.z, minZ, maxZ)
  const dx = position.x - nearestX
  const dz = position.z - nearestZ
  return dx * dx + dz * dz < radius * radius
}

function segmentIntersectsRect(
  start: Vec2,
  end: Vec2,
  minX: number,
  maxX: number,
  minZ: number,
  maxZ: number
): boolean {
  if (pointInsideRect(start, minX, maxX, minZ, maxZ) || pointInsideRect(end, minX, maxX, minZ, maxZ)) {
    return true
  }

  const deltaX = end.x - start.x
  const deltaZ = end.z - start.z
  let tMin = 0
  let tMax = 1

  const clip = (p: number, q: number): boolean => {
    if (Math.abs(p) <= EPSILON) {
      return q >= 0
    }
    const ratio = q / p
    if (p < 0) {
      if (ratio > tMax) {
        return false
      }
      if (ratio > tMin) {
        tMin = ratio
      }
    } else {
      if (ratio < tMin) {
        return false
      }
      if (ratio < tMax) {
        tMax = ratio
      }
    }
    return true
  }

  return (
    clip(-deltaX, start.x - minX) &&
    clip(deltaX, maxX - start.x) &&
    clip(-deltaZ, start.z - minZ) &&
    clip(deltaZ, maxZ - start.z) &&
    tMax >= tMin
  )
}

function pointInsideRect(
  point: Vec2,
  minX: number,
  maxX: number,
  minZ: number,
  maxZ: number
): boolean {
  return point.x >= minX && point.x <= maxX && point.z >= minZ && point.z <= maxZ
}