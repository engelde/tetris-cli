# Phase 11 Closeout: UI Polish and Playability

This document records the completed Phase 11 work. It is no longer an implementation checklist.

## Completed

- Centered Marathon layout.
- Compact 20-row board rendering using 2-column cells.
- Subtle playfield texture and low-contrast ghost pieces.
- Hard-drop trail and line-clear animation support.
- Double-line panel styling for board, hold, next, and stats.
- Shared pause/game-over backdrop sized from the active terminal.
- Interactive title menu with mode descriptions, difficulty selection, sound toggle, and best Marathon score.
- Mode-specific control hints for Marathon, vs CPU, and 2 Player.
- Playthrough smoke tests that drive real Ink stdin controls in every mode.

## Verification

Run:

```bash
npm run lint
npm run build
npm test
```

For text screenshot captures:

```bash
WRITE_PLAYTHROUGH_SCREENSHOTS=1 npm test -- test/playthrough.test.ts
```

Screenshots are written outside the repo to `/tmp/tetris-cli-playthrough`.

## Follow-up Ideas

- Derive preview rendering directly from canonical piece definitions.
- Add richer event callouts for Tetris, T-Spins, and back-to-back chains.
- Add a compact incoming-garbage meter for dual modes.
- Capture polished screenshots for release notes.
