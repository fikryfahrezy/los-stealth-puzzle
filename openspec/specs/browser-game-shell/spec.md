# browser-game-shell

## Purpose
Define the browser application shell requirements for loading, progressing through, and replaying the stealth game.

## Requirements

### Requirement: Level progression status is visible
The system SHALL show which level the player is currently attempting and MUST communicate when the full sequence has been completed.

#### Scenario: Active level is in progress
- **WHEN** the player is playing any level in the sequence
- **THEN** the system shows the current level number within the ordered progression

#### Scenario: Final level is completed
- **WHEN** the player completes the hardest level in the sequence without detection
- **THEN** the system shows that the overall run is complete rather than offering another next level

### Requirement: Browser game boot flow
The system SHALL start the game locally in a browser and present a playable 3D scene within an application shell that includes player-facing instructions and the current level context within the ordered progression.

#### Scenario: Initial load shows playable game shell
- **WHEN** the player opens the application
- **THEN** the system initializes the game runtime, loads the first level in the progression, renders the 3D level view, and displays basic instructions for movement and objective awareness

### Requirement: Run state feedback and restart controls
The system SHALL surface the current run state so the player can understand whether the current level is active, failed, completed and ready to advance, or the full sequence is complete, and it MUST provide a way to restart the current level after failure or success.

#### Scenario: Player is detected
- **WHEN** a guard detects the player
- **THEN** the system displays a failure state message for the current level and offers a restart action that resets that level

#### Scenario: Player completes a non-final level
- **WHEN** the player reaches the level goal without being detected and more levels remain
- **THEN** the system displays a success state message and offers an action to continue to the next level

#### Scenario: Player completes the final level
- **WHEN** the player reaches the goal of the hardest level without being detected
- **THEN** the system displays a campaign completion message and offers a replay action starting from the first level