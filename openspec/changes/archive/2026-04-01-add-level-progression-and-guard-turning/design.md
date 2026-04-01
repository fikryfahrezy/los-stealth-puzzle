## Context

The current implementation delivers a single playable stealth level with guards whose facing is derived only from their immediate travel direction. The project description, however, promises escalating puzzle complexity through more guards, overlapping fields of view, and richer patrol behavior. This change expands the runtime from a one-off scenario to a short sequence of levels ordered from easiest to hardest and upgrades patrol definitions so guards can stop, turn, and watch configured directions that create more deliberate stealth puzzles.

## Goals / Non-Goals

**Goals:**
- Represent the campaign as an ordered list of level configurations that can be advanced one by one.
- Surface current level progress and final completion status in the browser shell.
- Extend guard patrol data so a patrol step can encode movement and watch-facing behavior separately.
- Preserve deterministic gameplay logic and keep level content data-driven.

**Non-Goals:**
- Building an unlimited level editor or procedural level generation.
- Adding narrative progression, scoring, timers, or unlock persistence between sessions.
- Introducing new detection systems such as sound, search states, or cooperative guard AI.
- Replacing the existing rendering stack or moving state management out of the current client-side architecture.

## Decisions

### Represent progression as an indexed campaign sequence
The runtime should hold a campaign array and a current level index instead of treating the level as a single constant. Advancing after a successful level will reset the active gameplay state against the next level configuration, while success on the final level will move the game into a campaign-complete shell state. A branching map or menu-based level picker was considered, but rejected because the requested behavior is straightforward ascending difficulty rather than freeform content selection.

### Extend patrol definitions with explicit watch phases
Guard patrol routes should support steps that include a target position, an optional watch direction, and an optional dwell time before moving on. This lets a guard reach a waypoint, turn in place, and observe another lane before continuing. Encoding watch behavior only through extra micro-waypoints was considered, but rejected because it obscures author intent and makes level tuning harder.

### Keep detection logic tied to authoritative facing vectors
Guard visibility should be evaluated from the current facing vector whether that vector comes from movement or a watch phase. This preserves the existing field-of-view plus occlusion model while allowing stationary turning behavior. A separate "watch cone" subsystem was considered, but it would duplicate the same detection rules with no gameplay benefit.

### Separate level completion from campaign completion in the shell
The gameplay core should report level success as a normal state transition, while the shell decides whether that success means "load next level" or "campaign complete". This keeps the core focused on level simulation and avoids mixing campaign flow decisions into low-level collision or detection logic.

## Risks / Trade-offs

- [More level data increases balancing effort] -> Keep the initial campaign short and define each level with clear intended difficulty jumps.
- [Guard watch phases make patrol logic harder to reason about] -> Use explicit patrol step fields for dwell time and facing direction rather than overloading movement data.
- [Campaign flow and level reset logic drift apart] -> Centralize progression transitions in one shell-level controller that always recreates gameplay state from the selected level configuration.
- [Later levels become visually noisy with many guards] -> Increase difficulty primarily through better route composition and directional watch coverage instead of only adding more actors.

## Migration Plan

This is an in-place gameplay enhancement with no persistence layer or backend migration. Implementation should refactor the single-level runtime into campaign-aware state, update level definitions to include multiple stages, extend guard patrol parsing, and then wire shell messaging for level advancement and full completion. If rollback is needed, the previous single-level behavior can be restored by reverting to one level configuration and removing campaign state.

## Open Questions

- How many levels should the first progression include while still keeping implementation focused.
- Whether the shell should auto-advance after success or wait for an explicit next-level action.
- Whether stationary watch phases should interpolate rotation smoothly or snap immediately to the configured facing.