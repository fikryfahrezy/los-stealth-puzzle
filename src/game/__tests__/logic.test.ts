import { describe, expect, it } from 'vitest'
import { createInitialGameState, detectPlayer, movePlayer, updateGameState } from '../logic'
import type { ControlState, LevelConfig } from '../types'

const emptyControls: ControlState = {
  up: false,
  down: false,
  left: false,
  right: false
}

function createTestLevel(): LevelConfig {
  return {
    id: 'test-level',
    name: 'Test Level',
    summary: 'Level used for gameplay logic unit tests.',
    bounds: { minX: 0, maxX: 12, minZ: 0, maxZ: 12 },
    player: {
      spawn: { x: 2, z: 2 },
      radius: 0.4,
      speed: 4
    },
    goal: {
      position: { x: 10, z: 10 },
      size: { x: 1.5, z: 1.5 }
    },
    obstacles: [
      {
        id: 'blocker',
        position: { x: 5, z: 5 },
        size: { x: 2, y: 2, z: 2 }
      }
    ],
    guards: [
      {
        id: 'guard-1',
        patrol: [
          {
            position: { x: 8, z: 2 },
            watchDirection: { x: -1, z: 0 },
            dwellSeconds: 1
          },
          { position: { x: 8, z: 8 } }
        ],
        speed: 2,
        viewRange: 8,
        fovDeg: 70
      }
    ]
  }
}

describe('stealth logic', () => {
  it('prevents the player from moving through obstacles', () => {
    const level = createTestLevel()
    const state = createInitialGameState(level)
    state.player.position = { x: 3.7, z: 5 }

    movePlayer(
      state,
      level,
      {
        up: false,
        down: false,
        left: false,
        right: true
      },
      0.4
    )

    expect(state.player.position.x).toBeLessThan(4.2)
  })

  it('keeps guards in a watch phase before resuming patrol movement', () => {
    const level = createTestLevel()
    const state = createInitialGameState(level)
    state.player.position = { x: 1, z: 10 }

    const heldState = updateGameState(state, level, emptyControls, 0.5)

    expect(heldState.guards[0].position.z).toBeCloseTo(state.guards[0].position.z)
    expect(heldState.guards[0].waitRemaining).toBeCloseTo(0.5)
    expect(heldState.guards[0].forward.x).toBeLessThan(-0.9)

    const movedState = updateGameState(heldState, level, emptyControls, 0.6)

    expect(movedState.guards[0].position.z).toBeGreaterThan(heldState.guards[0].position.z)
    expect(movedState.guards[0].forward.z).toBeGreaterThan(0.9)
  })

  it('requires a clear line of sight before detection', () => {
    const level = createTestLevel()
    const state = createInitialGameState(level)

    level.obstacles = [
      {
        id: 'sight-blocker',
        position: { x: 5, z: 8 },
        size: { x: 1.8, y: 2, z: 2 }
      }
    ]
    state.player.position = { x: 2, z: 8 }
    state.guards[0].position = { x: 8, z: 8 }
    state.guards[0].forward = { x: -1, z: 0 }
    state.guards[0].waitRemaining = 0.5

    expect(detectPlayer(state, level)).toBeNull()

    level.obstacles = []

    expect(detectPlayer(state, level)).toBe('guard-1')
  })
})