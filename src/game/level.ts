import type { LevelConfig } from './types'

const bounds = {
  minX: 0,
  maxX: 22,
  minZ: 0,
  maxZ: 18
} as const

const player = {
  spawn: { x: 2.3, z: 2.4 },
  radius: 0.4,
  speed: 4.2
} as const

export const campaignLevels: LevelConfig[] = [
  {
    id: 'level-1-corridor-intro',
    name: 'Level 1: First Corridor',
    summary: 'One guard patrols a simple lane and pauses to watch the main crossing.',
    bounds,
    player,
    goal: {
      position: { x: 19.2, z: 15.4 },
      size: { x: 2.4, z: 2.4 }
    },
    obstacles: [
      {
        id: 'central-wall',
        position: { x: 8, z: 8.4 },
        size: { x: 1.6, y: 2.8, z: 10.8 }
      },
      {
        id: 'lower-cover',
        position: { x: 13.4, z: 4.1 },
        size: { x: 4.5, y: 2.8, z: 1.8 }
      },
      {
        id: 'goal-cover',
        position: { x: 18.4, z: 10 },
        size: { x: 1.8, y: 2.8, z: 3.5 }
      }
    ],
    guards: [
      {
        id: 'left-sentry',
        patrol: [
          { position: { x: 5.6, z: 3.6 } },
          {
            position: { x: 5.6, z: 13.6 },
            watchDirection: { x: 1, z: 0 },
            dwellSeconds: 1.2
          }
        ],
        speed: 2.1,
        viewRange: 5.8,
        fovDeg: 68
      }
    ]
  },
  {
    id: 'level-2-split-crossing',
    name: 'Level 2: Split Crossing',
    summary: 'Two guards overlap vision lanes and the right scout turns to inspect the exit route.',
    bounds,
    player,
    goal: {
      position: { x: 19, z: 15.3 },
      size: { x: 2.3, z: 2.3 }
    },
    obstacles: [
      {
        id: 'central-wall',
        position: { x: 8.2, z: 8.7 },
        size: { x: 1.8, y: 2.8, z: 11.4 }
      },
      {
        id: 'lower-cover',
        position: { x: 13.5, z: 4.2 },
        size: { x: 4.2, y: 2.8, z: 2 }
      },
      {
        id: 'upper-cover',
        position: { x: 13.6, z: 13.7 },
        size: { x: 4.2, y: 2.8, z: 2 }
      },
      {
        id: 'goal-pillar',
        position: { x: 17.8, z: 9.6 },
        size: { x: 1.6, y: 2.8, z: 3.6 }
      }
    ],
    guards: [
      {
        id: 'left-sentry',
        patrol: [
          { position: { x: 5.6, z: 3.4 } },
          {
            position: { x: 5.6, z: 13.8 },
            watchDirection: { x: 1, z: 0 },
            dwellSeconds: 1.4
          }
        ],
        speed: 2.2,
        viewRange: 6,
        fovDeg: 70
      },
      {
        id: 'right-scout',
        patrol: [
          {
            position: { x: 13.4, z: 9.2 },
            watchDirection: { x: 0, z: 1 },
            dwellSeconds: 0.8
          },
          { position: { x: 18.3, z: 9.2 } },
          {
            position: { x: 18.3, z: 14.2 },
            watchDirection: { x: -1, z: 0 },
            dwellSeconds: 1
          }
        ],
        speed: 2.5,
        viewRange: 5.6,
        fovDeg: 62
      }
    ]
  },
  {
    id: 'level-3-overwatch-lattice',
    name: 'Level 3: Overwatch Lattice',
    summary: 'Multiple guards layer moving cones and watch phases over the path to the exit.',
    bounds,
    player,
    goal: {
      position: { x: 19, z: 15.2 },
      size: { x: 2.3, z: 2.3 }
    },
    obstacles: [
      {
        id: 'left-wall',
        position: { x: 6.4, z: 8.6 },
        size: { x: 1.8, y: 2.8, z: 10.8 }
      },
      {
        id: 'mid-wall',
        position: { x: 11.8, z: 6.5 },
        size: { x: 1.6, y: 2.8, z: 8.2 }
      },
      {
        id: 'upper-cover',
        position: { x: 13.8, z: 13.8 },
        size: { x: 4.6, y: 2.8, z: 1.8 }
      },
      {
        id: 'lower-cover',
        position: { x: 15.8, z: 4.2 },
        size: { x: 3.6, y: 2.8, z: 2 }
      },
      {
        id: 'goal-column',
        position: { x: 18, z: 10 },
        size: { x: 1.6, y: 2.8, z: 3.8 }
      }
    ],
    guards: [
      {
        id: 'entry-sentry',
        patrol: [
          { position: { x: 4.6, z: 3.4 } },
          {
            position: { x: 4.6, z: 12.8 },
            watchDirection: { x: 1, z: 0 },
            dwellSeconds: 1.3
          }
        ],
        speed: 2.4,
        viewRange: 6.2,
        fovDeg: 70
      },
      {
        id: 'mid-scout',
        patrol: [
          {
            position: { x: 10.4, z: 4.2 },
            watchDirection: { x: 1, z: 0 },
            dwellSeconds: 0.9
          },
          { position: { x: 10.4, z: 13.6 } },
          {
            position: { x: 13.6, z: 13.6 },
            watchDirection: { x: 0, z: -1 },
            dwellSeconds: 1.1
          }
        ],
        speed: 2.55,
        viewRange: 5.8,
        fovDeg: 60
      },
      {
        id: 'exit-overwatch',
        patrol: [
          {
            position: { x: 17.8, z: 7.8 },
            watchDirection: { x: -1, z: 0 },
            dwellSeconds: 1.4
          },
          { position: { x: 17.8, z: 14.4 } },
          {
            position: { x: 19.4, z: 14.4 },
            watchDirection: { x: 0, z: -1 },
            dwellSeconds: 0.8
          }
        ],
        speed: 2.35,
        viewRange: 6,
        fovDeg: 58
      }
    ]
  }
]

export const initialLevel = campaignLevels[0]