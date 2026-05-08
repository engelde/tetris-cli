# tetris-cli Roadmap

Goal: keep `tetris-cli` correct, readable, and fun as a polished Ink terminal game.

## Current State

The project is a TypeScript/React/Ink CLI app.

- Entrypoint: `src/index.tsx`
- Screens and UI: `src/components`
- Mode shells: `src/modes`
- Core game logic: `src/game`
- Key bindings: `src/input/controls.ts`
- Automated tests: `test/*.test.ts`

Verified quality gates:

- `npm run lint`
- `npm run build`
- `npm test`

The current test suite includes unit tests, layout tests, and Ink playthrough smoke tests for Marathon, vs CPU, and 2 Player.

## Completed Foundation

- Canonical game state now tracks difficulty, randomizer state, gravity accumulator, animations, and gameplay events.
- Hold behavior is visible and limited to one hold per piece life.
- Marathon, vs CPU, and 2 Player route correctly from both CLI flags and the interactive menu.
- Menu quit, game quit, restart, and return-to-menu behavior are covered.
- Multiplayer garbage is processed through game events and tested.
- CPU mode uses the shared AI evaluator and difficulty settings.
- Board rendering is compact enough for common terminal sizes.
- Pause and game-over overlays use a shared terminal-sized backdrop.
- README, help text, and in-game control hints match the implemented controls.
- High scores are persisted and surfaced on the title menu.

## Active Design Direction

Modern arcade terminal UI:

- Compact 2-column cells
- High-contrast but non-harsh piece colors
- Subtle playfield grid
- Low-contrast ghost pieces
- Clear side panels for hold, next, and stats
- Concise controls during gameplay
- Stronger menu, pause, and game-over hierarchy

## Remaining Roadmap

### 1. Piece Preview Unification

The active pieces use canonical engine shapes, while previews use a compact display template. Keep these visually aligned by deriving previews from the same canonical piece data or adding explicit shape parity tests.

Acceptance:

- Active, hold, and next pieces always match orientation expectations.
- Preview rendering has direct tests for all seven tetrominoes.

### 2. Gameplay Feedback Polish

Current line clear and hard-drop animations are lightweight. Improve event feedback without slowing the game loop.

Ideas:

- Stronger line clear flash timing
- Lock pulse
- Tetris/T-Spin callouts
- Incoming garbage meter in dual modes

Acceptance:

- Feedback is visible in tests or visual snapshots.
- No gameplay input lag is introduced.

### 3. Dual Mode UX

CPU and 2P are playable, but can still communicate more clearly.

Ideas:

- CPU difficulty badge
- Cleaner incoming-garbage meter
- More prominent winner banner
- Better distinction between human and CPU panels

Acceptance:

- 100 x 24 layout remains unclipped.
- Winner, pause, and garbage states are obvious at a glance.

### 4. Release Readiness

Before publishing:

- Confirm `npm pack --dry-run` only includes intended files.
- Confirm package entrypoints work from the packed tarball.
- Capture current text screenshots for the README or release notes.
- Keep `CHANGELOG.md` updated.

## Useful Commands

```bash
npm run lint
npm run build
npm test
WRITE_PLAYTHROUGH_SCREENSHOTS=1 npm test -- test/playthrough.test.ts
```
