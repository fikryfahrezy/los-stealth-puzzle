import { createInitialGameState, updateGameState } from './logic'
import type { CampaignState, ControlState, LevelConfig, RuntimeSnapshot } from './types'

export function createCampaignState(levels: LevelConfig[]): CampaignState {
  if (levels.length === 0) {
    throw new Error('Campaign must contain at least one level.')
  }

  return {
    levels,
    currentLevelIndex: 0,
    gameState: createInitialGameState(levels[0]),
    campaignComplete: false
  }
}

export function getCurrentLevel(state: CampaignState): LevelConfig {
  return state.levels[state.currentLevelIndex]
}

export function canAdvanceCampaign(state: CampaignState): boolean {
  return state.gameState.status === 'success' && state.currentLevelIndex < state.levels.length - 1
}

export function updateCampaignState(
  previous: CampaignState,
  controls: ControlState,
  deltaSeconds: number
): CampaignState {
  if (previous.campaignComplete) {
    return previous
  }

  const level = getCurrentLevel(previous)
  const gameState = updateGameState(previous.gameState, level, controls, deltaSeconds)
  const isFinalLevel = previous.currentLevelIndex === previous.levels.length - 1

  return {
    ...previous,
    gameState,
    campaignComplete: isFinalLevel && gameState.status === 'success'
  }
}

export function restartCurrentLevel(state: CampaignState): CampaignState {
  return {
    ...state,
    gameState: createInitialGameState(getCurrentLevel(state)),
    campaignComplete: false
  }
}

export function advanceCampaignLevel(state: CampaignState): CampaignState {
  if (!canAdvanceCampaign(state)) {
    return state
  }

  const nextLevelIndex = state.currentLevelIndex + 1
  return {
    ...state,
    currentLevelIndex: nextLevelIndex,
    gameState: createInitialGameState(state.levels[nextLevelIndex]),
    campaignComplete: false
  }
}

export function replayCampaign(state: CampaignState): CampaignState {
  return {
    ...state,
    currentLevelIndex: 0,
    gameState: createInitialGameState(state.levels[0]),
    campaignComplete: false
  }
}

export function createRuntimeSnapshot(state: CampaignState): RuntimeSnapshot {
  return {
    currentLevelIndex: state.currentLevelIndex,
    totalLevels: state.levels.length,
    level: getCurrentLevel(state),
    gameState: state.gameState,
    campaignComplete: state.campaignComplete,
    canAdvance: canAdvanceCampaign(state)
  }
}