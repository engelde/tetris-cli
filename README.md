# tetris-cli

A polished Tetris game for the terminal, built with TypeScript, React, and Ink.

`tetris-cli` includes Marathon, vs CPU, and same-keyboard 2-player modes with SRS rotation, hold, ghost pieces, next queue, garbage attacks, local high scores, and a compact arcade-style terminal UI.

## Quick Start

```bash
npx tetris-cli
```

Install globally if you want the `tetris` command available everywhere:

```bash
npm install -g tetris-cli
tetris
```

## Game Modes

| Mode | Description |
| --- | --- |
| Marathon | Single-player score chase with increasing speed |
| vs CPU | Battle an AI opponent with Easy, Normal, or Hard difficulty |
| 2 Player | Same-keyboard versus mode with garbage attacks |

## Features

- 7-bag randomizer for fair piece distribution
- SRS rotation and wall kicks
- Hold piece, ghost piece, and next queue
- T-Spin, combo, and back-to-back scoring
- Multiplayer garbage sending and incoming garbage handling
- Local marathon high scores in `~/.tetris-cli-scores.json`
- Compact terminal layout with clear pause and game-over overlays
- Optional terminal bell sound effects

## Controls

### Player 1

| Action | Keys |
| --- | --- |
| Move left | `A` / Left Arrow |
| Move right | `D` / Right Arrow |
| Soft drop | `S` / Down Arrow |
| Hard drop | `W` / Up Arrow / Space |
| Rotate clockwise | `K` / `Z` |
| Rotate counter-clockwise | `J` / `X` |
| Hold | `H` / `C` |
| Pause | `P` / Escape |
| Quit | `Q` / Ctrl+C |

### Player 2

| Action | Keys |
| --- | --- |
| Move left | Left Arrow |
| Move right | Right Arrow |
| Soft drop | Down Arrow |
| Hard drop | Up Arrow / Space |
| Rotate clockwise | `,` / `.` |
| Rotate counter-clockwise | `/` / `>` |
| Hold | `;` / `L` |
| Pause | `P` / Escape |
| Quit | `Q` / Ctrl+C |

## CLI Options

| Flag | Description | Default |
| --- | --- | --- |
| `--mode <mode>` | `marathon`, `cpu`, or `2p` | Interactive menu |
| `--difficulty <level>` | `easy`, `normal`, or `hard` | `normal` |
| `--no-sound` | Disable terminal bell sound effects | Sound enabled |
| `--help`, `-h` | Show help | |
| `--version`, `-v` | Show version | |

Examples:

```bash
npx tetris-cli
npx tetris-cli --mode marathon --difficulty easy --no-sound
npx tetris-cli --mode cpu --difficulty hard
npx tetris-cli --mode 2p
```

## Terminal Requirements

- Node.js 18 or newer
- A terminal with ANSI color support
- Recommended minimum size:
  - Marathon: 80 x 24
  - vs CPU / 2 Player: 100 x 24

If the terminal is too small, the game shows a resize prompt instead of clipping the board.

## Development

```bash
git clone https://github.com/engelde/tetris-cli.git
cd tetris-cli
npm install
npm test
npm run build
```

Common commands:

| Command | Description |
| --- | --- |
| `npm start` | Run the game |
| `npm run dev` | Build and run locally |
| `npm test` | Run unit and Ink playthrough tests |
| `npm run build` | Compile TypeScript |
| `npm run lint` | Run Biome checks |
| `npm run format` | Format with Biome |

## Project Structure

```text
src/
  index.tsx          CLI entrypoint and mode routing
  cli-args.ts        CLI argument parsing and help text
  audio/             Terminal sound effects
  components/        Ink UI components
  config/            Colors and difficulty settings
  game/              Engine, pieces, scoring, randomizer, AI, garbage
  hooks/             Terminal/game loop hooks
  input/             Key bindings
  modes/             Marathon, vs CPU, and 2-player mode shells
  test/              Manual visual render scripts
  utils/             Constants and shared types
test/                Automated unit, layout, and playthrough tests
```

## QA

The automated test suite covers:

- Game engine state and hold behavior
- Randomizer fairness and independent cursors
- CPU move selection
- Multiplayer garbage exchange
- CLI argument validation
- High-score persistence
- Terminal layout invariants
- Actual Ink playthrough smoke tests for Marathon, vs CPU, and 2 Player

Run all checks before publishing:

```bash
npm run lint
npm run build
npm test
```

## License

MIT
