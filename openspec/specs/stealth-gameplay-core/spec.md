# stealth-gameplay-core

## Purpose
Define the core stealth gameplay rules for movement, patrols, detection, and win or loss resolution.

## Requirements

### Requirement: Levels progress from easiest to hardest
The system SHALL define multiple levels in a fixed order from easiest to hardest and MUST unlock each subsequent level only after the current one is completed.

#### Scenario: Early level completion advances progression
- **WHEN** the player completes a level that is not the final level
- **THEN** the system loads the next harder level in the defined sequence

#### Scenario: Restart does not skip progression order
- **WHEN** the player restarts after failure or success on the current level
- **THEN** the system restarts that same level unless the player has explicitly advanced to the next level

### Requirement: Player navigates the stealth level
The system SHALL allow the player character to move through the playable area while preventing movement through blocking obstacles.

#### Scenario: Valid movement through open space
- **WHEN** the player provides movement input toward a walkable area
- **THEN** the system moves the player through the level in that direction

#### Scenario: Movement blocked by cover
- **WHEN** the player attempts to move into an obstacle volume
- **THEN** the system prevents the player from passing through the obstacle

### Requirement: Guards detect only with visibility and clear line of sight
The system SHALL detect the player only when the player is within a guard's vision range, inside that guard's field of view based on the guard's current facing direction, and not occluded by blocking level geometry.

#### Scenario: Player inside visible cone during watch phase
- **WHEN** the player enters a guard's vision area while that guard is holding a configured watch direction with no obstacle between the guard and player
- **THEN** the system marks the player as detected

#### Scenario: Player hidden behind obstacle
- **WHEN** the player is within a guard's vision range but an obstacle blocks the line between them
- **THEN** the system does not mark the player as detected

### Requirement: Guards follow defined patrol behavior
The system SHALL allow each guard to follow a configured patrol path, including patrol steps that can pause and turn to a configured watch direction, and it SHALL update guard facing consistently with either movement or the active watch phase.

#### Scenario: Guard reaches patrol waypoint and watches another direction
- **WHEN** a guard arrives at a patrol step that defines a watch direction and dwell time
- **THEN** the system keeps the guard at that step, turns the guard to the configured facing direction, and resumes the patrol after the dwell time expires

#### Scenario: Guard reaches patrol waypoint and continues moving
- **WHEN** a guard arrives at the next point in its configured patrol route without a watch phase
- **THEN** the system advances the guard toward the following patrol step and updates its facing to match its new travel direction

### Requirement: Level resolves with fail or success states
The system SHALL end the active level in failure when the player is detected and SHALL end the active level in success when the player reaches the goal without prior detection.

#### Scenario: Detection ends the current level
- **WHEN** any guard detects the player during an active level
- **THEN** the system stops normal gameplay progression and changes the current level state to failure

#### Scenario: Goal ends the current level
- **WHEN** the player enters the goal zone while the current level is still active
- **THEN** the system changes the current level state to success