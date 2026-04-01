export interface Vec2 {
  x: number
  z: number
}

export interface BoxSize3D {
  x: number
  y: number
  z: number
}

export interface RectSize2D {
  x: number
  z: number
}

export interface ObstacleConfig {
  id: string
  position: Vec2
  size: BoxSize3D
}

export interface PatrolStep {
  position: Vec2
  watchDirection?: Vec2
  dwellSeconds?: number
}

export interface GuardConfig {
  id: string
  patrol: PatrolStep[]
  speed: number
  viewRange: number
  fovDeg: number
}

export interface GoalConfig {
  position: Vec2
  size: RectSize2D
}

export interface PlayerConfig {
  spawn: Vec2
  radius: number
  speed: number
}

export interface LevelBounds {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

export interface LevelConfig {
  id: string
  name: string
  summary: string
  bounds: LevelBounds
  player: PlayerConfig
  goal: GoalConfig
  obstacles: ObstacleConfig[]
  guards: GuardConfig[]
}

export interface PlayerState {
  position: Vec2
  radius: number
  speed: number
}

export interface GuardState {
  id: string
  position: Vec2
  patrolIndex: number
  waitRemaining: number
  forward: Vec2
}

export type RunStatus = 'active' | 'failed' | 'success'

export interface GameState {
  status: RunStatus
  time: number
  player: PlayerState
  guards: GuardState[]
  detectionGuardId: string | null
}

export interface CampaignState {
  levels: LevelConfig[]
  currentLevelIndex: number
  gameState: GameState
  campaignComplete: boolean
}

export interface RuntimeSnapshot {
  currentLevelIndex: number
  totalLevels: number
  level: LevelConfig
  gameState: GameState
  campaignComplete: boolean
  canAdvance: boolean
}

export interface ControlState {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
}