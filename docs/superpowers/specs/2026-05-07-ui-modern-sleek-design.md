# Modern Sleek UI and Animations Spec: Current Design

## Goal

Keep the Tetris CLI interface compact, readable, and expressive in common terminal sizes.

## Current Architecture

- `src/utils/types.ts` defines `Animation` and adds `animations` to `GameState`.
- `src/game/engine.ts` emits gameplay events and animation metadata.
- `src/components/Board.tsx` combines board cells, active piece, ghost piece, garbage, and animation overlays.
- `src/config/colors.ts` centralizes piece colors, ghost styling, garbage styling, and UI text color helpers.

## Rendering Choices

- Filled cells: colored `██`.
- Ghost cells: dim two-column `░░`, tinted by piece color.
- Empty cells: subtle dark `· ` texture.
- Garbage: gray textured blocks.
- Hard-drop trail: slim vertical accent in empty cells.
- Line clear: bright row flash.

## Constraints

- Board cells must remain two visible columns wide.
- Marathon should remain readable at 80 x 24.
- Dual modes should remain readable at 100 x 24.
- Pause and game-over overlays must use terminal-size-aware backdrop sizing.

## Tests

- `test/colors.test.ts` guards ghost-cell width.
- `test/layout.test.ts` guards common terminal layouts.
- `test/playthrough.test.ts` drives real Ink stdin controls through all modes.
- `test/animations.test.ts` covers animation creation and expiry.
