## ADDED Requirements

### Requirement: Player navigates the stealth level
The system SHALL allow the player character to move through the playable area while preventing movement through blocking obstacles.

#### Scenario: Valid movement through open space
- **WHEN** the player provides movement input toward a walkable area
- **THEN** the system moves the player through the level in that direction

#### Scenario: Movement blocked by cover
- **WHEN** the player attempts to move into an obstacle volume
- **THEN** the system prevents the player from passing through the obstacle

### Requirement: Guards detect only with visibility and clear line of sight
The system SHALL detect the player only when the player is within a guard's vision range, inside that guard's field of view, and not occluded by blocking level geometry.

#### Scenario: Player inside visible cone without cover
- **WHEN** the player enters a guard's vision area with no obstacle between the guard and player
- **THEN** the system marks the player as detected

#### Scenario: Player hidden behind obstacle
- **WHEN** the player is within a guard's vision range but an obstacle blocks the line between them
- **THEN** the system does not mark the player as detected

### Requirement: Guards follow defined patrol behavior
The system SHALL allow each guard to follow a configured patrol path and update its facing direction consistently with that route.

#### Scenario: Guard reaches patrol waypoint
- **WHEN** a guard arrives at the next point in its configured patrol route
- **THEN** the system advances the guard toward the following waypoint and updates its facing to match its new travel direction

### Requirement: Level resolves with fail or success states
The system SHALL end the active run in failure when the player is detected and SHALL end the active run in success when the player reaches the goal without prior detection.

#### Scenario: Detection ends the run
- **WHEN** any guard detects the player during an active level
- **THEN** the system stops normal gameplay progression and changes the run state to failure

#### Scenario: Goal ends the run
- **WHEN** the player enters the goal zone while the run is still active
- **THEN** the system changes the run state to success