## Why

The current game slice only supports a single level and guards that mainly face along their patrol travel, which limits the puzzle variety promised in the project description. Expanding the game into a progression of levels from easiest to hardest, while allowing guards to deliberately turn and watch different directions, creates the layered stealth challenge the game concept depends on.

## What Changes

- Expand the playable content from one level to a sequence of levels ordered from easy to hard.
- Add game flow for advancing through levels, replaying the current level, and recognizing overall completion.
- Update guard behavior so patrols can include turning or watching phases that face configured directions, not only the current movement vector.
- Support more demanding visibility puzzles by combining multiple guards, overlapping fields of view, and directional watch behavior in later levels.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `browser-game-shell`: Extend the shell to present current level progress, move into the next level after success, and communicate campaign completion.
- `stealth-gameplay-core`: Extend gameplay rules to support multiple levels with increasing difficulty and guards that can turn to configured watch directions during patrol behavior.

## Impact

- Updates level data and runtime state from a single-level model to a multi-level progression.
- Changes guard patrol logic, facing behavior, and level completion flow.
- Requires new UI feedback for level number, next-level progression, and finishing the final challenge.
- Keeps the game local-only and client-side with no backend changes.