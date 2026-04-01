import { describe, expect, it } from 'vitest'
import {
  advanceCampaignLevel,
  createCampaignState,
  createRuntimeSnapshot,
  replayCampaign,
  restartCurrentLevel,
  updateCampaignState
} from '../campaign'
import type { ControlState, LevelConfig } from '../types'

const emptyControls: ControlState = {
  up: false,
  down: false,
  left: false,
  right: false
}

function createCampaignLevels(): LevelConfig[] {
  return [
    {
      id: 'level-1',
      name: 'Level 1',
      summary: 'Intro',
      bounds: { minX: 0, maxX: 10, minZ: 0, maxZ: 10 },
      player: { spawn: { x: 1, z: 1 }, radius: 0.4, speed: 4 },
      goal: { position: { x: 8, z: 8 }, size: { x: 1.5, z: 1.5 } },
      obstacles: [],
      guards: []
    },
    {
      id: 'level-2',
      name: 'Level 2',
      summary: 'Finale',
      bounds: { minX: 0, maxX: 10, minZ: 0, maxZ: 10 },
      player: { spawn: { x: 2, z: 2 }, radius: 0.4, speed: 4 },
      goal: { position: { x: 8, z: 8 }, size: { x: 1.5, z: 1.5 } },
      obstacles: [],
      guards: []
    }
  ]
}

describe('campaign flow', () => {
  it('advances levels in order and restarts the current level without changing progression', () => {
    const levels = createCampaignLevels()
    const campaign = createCampaignState(levels)
    const clearedLevel = {
      ...campaign,
      gameState: {
        ...campaign.gameState,
        status: 'success' as const
      }
    }

    const advanced = advanceCampaignLevel(clearedLevel)
    expect(advanced.currentLevelIndex).toBe(1)
    expect(advanced.gameState.player.position).toEqual(levels[1].player.spawn)

    const restarted = restartCurrentLevel(advanced)
    expect(restarted.currentLevelIndex).toBe(1)
    expect(restarted.gameState.player.position).toEqual(levels[1].player.spawn)
    expect(restarted.campaignComplete).toBe(false)
  })

  it('marks the campaign complete on final-level success and replays from the first level', () => {
    const levels = createCampaignLevels()
    const campaign = createCampaignState(levels)
    const finalLevelState = {
      ...campaign,
      currentLevelIndex: 1,
      gameState: {
        ...campaign.gameState,
        player: {
          ...campaign.gameState.player,
          position: { x: 8, z: 8 }
        }
      }
    }

    const completed = updateCampaignState(finalLevelState, emptyControls, 0.016)
    const snapshot = createRuntimeSnapshot(completed)

    expect(snapshot.campaignComplete).toBe(true)
    expect(snapshot.canAdvance).toBe(false)

    const replayed = replayCampaign(completed)
    expect(replayed.currentLevelIndex).toBe(0)
    expect(replayed.gameState.player.position).toEqual(levels[0].player.spawn)
    expect(replayed.campaignComplete).toBe(false)
  })
})