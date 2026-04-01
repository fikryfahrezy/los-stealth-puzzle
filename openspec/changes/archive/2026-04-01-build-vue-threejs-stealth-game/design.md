## Context

This repository currently contains only the product description for a local-only 3D stealth puzzle game. The first implementation needs to establish both a browser application shell and the core stealth simulation in a way that is simple to extend for future levels, additional guards, and richer presentation. The main constraints are that the game must run entirely in the browser, preserve the readability of stealth logic, and avoid introducing backend dependencies.

## Goals / Non-Goals

**Goals:**
- Deliver a playable first level that can be started, failed, restarted, and completed in a browser.
- Use Vue to manage application bootstrapping and overlay UI while delegating 3D rendering to Three.js.
- Keep gameplay rules deterministic and separated from rendering so stealth logic is testable and easier to evolve.
- Model guards, obstacles, player spawn, and goal data in a level configuration format that supports future content.

**Non-Goals:**
- Building multiple levels, progression systems, save data, or content authoring tools.
- Adding backend services, authentication, cloud saves, or analytics.
- Shipping advanced enemy behaviors such as coordination, searching, or hearing.
- Final art, audio, or mobile-specific controls.

## Decisions

### Use Vue and Vite as the application shell
Vue will host the page layout, canvas container, HUD overlays, and state-dependent messaging. Vite is the simplest way to bootstrap a modern Vue application with a fast local development loop. A pure Three.js app with handwritten DOM overlays was considered, but rejected because even the first slice needs structured UI states such as instructions, detection messaging, and restart or success prompts.

### Keep gameplay state separate from scene objects
The core game loop will maintain authoritative gameplay data for the player, guards, level state, and timing in plain application state. Three.js meshes will render that state instead of owning it. The alternative, mutating gameplay directly on scene objects, would make line-of-sight and level rule testing harder and would couple simulation logic to rendering concerns too early.

### Use a fixed, readable 3D camera with simple geometric level pieces
The first implementation should prioritize spatial readability over cinematic presentation. A fixed elevated camera angle and simple blockout geometry will make guard sightlines and cover easier to understand. A free camera was considered, but it would increase input complexity and undermine puzzle clarity in the initial release.

### Define levels as structured configuration data
The initial level should be described through configuration for map bounds, obstacles, player spawn, goal zone, and guard patrol routes. Hardcoding object placement directly inside render setup was considered, but rejected because it would make future level additions expensive and blend content concerns with engine setup.

### Implement guard detection with field-of-view checks plus line-of-sight occlusion tests
Detection should require both angular visibility and a clear path between guard and player. The implementation should first filter by guard range and facing angle, then test whether obstacle volumes block the segment from guard to player. Using only distance and angle would not satisfy the core stealth promise, while introducing a full physics engine is unnecessary for the initial slice.

## Risks / Trade-offs

- [Rendering and gameplay drift apart] -> Keep a single authoritative game state and update render objects from that state each frame.
- [Line-of-sight calculations become inconsistent with visible geometry] -> Use the same obstacle definitions for rendering and occlusion checks.
- [Vue and Three.js boundaries become unclear] -> Limit Vue to app shell and HUD concerns, and isolate Three.js scene lifecycle in a dedicated runtime module.
- [Initial scope expands into a generic engine] -> Constrain this change to one playable level and only the minimum systems needed to support it.

## Migration Plan

This is a greenfield change, so no production migration is required. Implementation should proceed by scaffolding the frontend app, integrating the 3D runtime, adding the first level configuration, and then wiring restart and completion flows. If implementation needs to be rolled back, the change can be removed without data migration concerns because no persistent state or external integrations are introduced.

## Open Questions

- Whether player movement should snap to a grid or remain continuous along the floor plane in the first version.
- Whether guard vision should be visualized as always-on cones, toggleable debug overlays, or subtler floor indicators.
- Whether the first level should optimize for puzzle purity with fixed patrol timing or allow more dynamic motion smoothing for presentation.