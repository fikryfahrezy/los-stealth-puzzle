## 1. Project Setup

- [x] 1.1 Scaffold a Vue application with Vite and add Three.js as a rendering dependency
- [x] 1.2 Establish the base application structure for the app shell, game runtime module, and shared level or gameplay state
- [x] 1.3 Add the root page layout with a canvas host area and UI regions for instructions, run state messages, and restart controls

## 2. Three.js Runtime Foundation

- [x] 2.1 Initialize the Three.js scene, camera, renderer, lighting, and resize handling inside a dedicated runtime module
- [x] 2.2 Create simple level geometry rendering for floor, blocking obstacles, player spawn, guard entities, and goal zone from structured configuration data
- [x] 2.3 Synchronize render objects from authoritative gameplay state on each update tick

## 3. Core Stealth Gameplay

- [x] 3.1 Implement player movement across the level plane with obstacle blocking
- [x] 3.2 Implement guard patrol routes and facing updates based on configured waypoints
- [x] 3.3 Implement guard detection using range, field-of-view, and obstacle-aware line-of-sight checks
- [x] 3.4 Implement run state transitions for active, failed, and completed gameplay states

## 4. Player Experience

- [x] 4.1 Display onboarding instructions for movement controls and the stealth objective in the browser game shell
- [x] 4.2 Show failure feedback and a restart action when the player is detected
- [x] 4.3 Show success feedback and a replay action when the player reaches the goal undetected

## 5. Validation

- [x] 5.1 Verify the initial level is playable end to end in the browser from load through restart and successful completion
- [x] 5.2 Add focused tests or manual verification coverage for movement blocking, patrol progression, and line-of-sight detection behavior