## 1. Campaign Structure

- [x] 1.1 Refactor level data from a single-level export into an ordered campaign sequence from easiest to hardest
- [x] 1.2 Add runtime state for the current level index, current level metadata, and campaign completion
- [x] 1.3 Reset or replay the currently active level without breaking progression order

## 2. Guard Patrol Enhancements

- [x] 2.1 Extend guard patrol configuration to support watch directions and dwell times at patrol steps
- [x] 2.2 Update patrol simulation so guards can pause, turn to configured directions, and then resume movement
- [x] 2.3 Ensure detection uses the guard's current facing direction during both movement and watch phases

## 3. Shell and Progression UX

- [x] 3.1 Show the current level number and total level count in the browser game shell
- [x] 3.2 Add the success flow for advancing from a completed level to the next harder level
- [x] 3.3 Add final campaign completion messaging and replay behavior from the first level

## 4. Content and Difficulty Curve

- [x] 4.1 Author multiple levels with a clear difficulty ramp from easiest to hardest
- [x] 4.2 Increase later-level complexity through more demanding guard placement, overlapping vision, and directional watch coverage

## 5. Verification

- [x] 5.1 Add or update tests for progression order, current-level restart behavior, and final completion handling
- [x] 5.2 Add or update tests for guard watch phases, turning behavior, and detection while facing configured directions