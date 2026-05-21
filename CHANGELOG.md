# Changelog

## [Unreleased]

### Added
- Release automation with release-please and npm publish
- SIGWINCH fallback for terminal resize detection
- Pro tips and credits to README

### Fixed
- Menu now fills terminal and centers vertically
- Game and dual-game layouts center properly in large terminals
- Hard-drop trail bounds now use exact piece columns
- Garbage queue returns remaining rows when buffer is full

## 1.0.0

- Modernized the terminal UI around a compact Ink layout.
- Added reliable Marathon, vs CPU, and 2-player mode routing.
- Added stateful 7-bag randomizers per game state.
- Fixed hold behavior and visible hold panel updates.
- Added CPU placement logic and multiplayer garbage processing.
- Added local high-score persistence and menu display.
- Added layout, randomizer, multiplayer, high-score, and playthrough tests.
- Documented current controls, CLI options, QA commands, and terminal requirements.
