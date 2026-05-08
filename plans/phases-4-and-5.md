# Phases 4 and 5 Closeout: Layout and Board Rendering

## Completed

- Added `src/hooks/useTerminalSize.ts` for render-time terminal dimensions.
- Added `src/components/TooSmall.tsx` for friendly minimum-size guidance.
- Refactored Marathon and dual layouts around compact board dimensions.
- Replaced oversized per-cell outlines with 1-row, 2-column cells.
- Added subtle empty-cell texture, low-contrast ghost pieces, and textured garbage.
- Kept hold and next previews aligned with the compact board style.
- Added layout tests for common 80 x 24 and 100 x 24 terminal sizes.

## Current Minimums

- Marathon: 58 x 24 component minimum, recommended 80 x 24.
- Dual modes: 86 x 24 component minimum, recommended 100 x 24 or wider.

## Follow-up

- Derive preview shapes from canonical piece data instead of a separate preview template.
- Add explicit snapshot coverage for all seven preview pieces.
