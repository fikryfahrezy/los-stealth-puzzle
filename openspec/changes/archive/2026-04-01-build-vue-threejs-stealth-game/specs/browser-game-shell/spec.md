## ADDED Requirements

### Requirement: Browser game boot flow
The system SHALL start the game locally in a browser and present a playable 3D scene within an application shell that includes player-facing instructions.

#### Scenario: Initial load shows playable game shell
- **WHEN** the player opens the application
- **THEN** the system initializes the game runtime, renders the 3D level view, and displays basic instructions for movement and objective awareness

### Requirement: Run state feedback and restart controls
The system SHALL surface the current run state so the player can understand whether the level is active, failed, or completed, and it MUST provide a way to restart after failure or success.

#### Scenario: Player is detected
- **WHEN** a guard detects the player
- **THEN** the system displays a failure state message and offers a restart action that resets the level

#### Scenario: Player completes the level
- **WHEN** the player reaches the level goal without being detected
- **THEN** the system displays a success state message and offers a restart action for replay