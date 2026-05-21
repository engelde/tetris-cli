# tetris-cli Public Release Design

**Date:** 2026-05-21
**Status:** Draft — awaiting review

## Goal

Prepare `tetris-cli` for a polished public release on GitHub and npm, matching the quality and automation of the reference project `pong-cli`.

## Success Criteria

1. `npx tetris-cli` runs the menu on launch (no `--mode` flag required)
2. Game layouts dynamically resize to fill available terminal space
3. README features ASCII art, badges, screenshots, and pro tips (pong-cli style)
4. Automated releases via release-please + npm publish workflow
5. All 52+ tests pass; no known bugs
6. Short gameplay GIF in repo for README/visuals

---

## 1. Terminal Resize Handling

### Problem

The game uses fixed minimum widths (58x24 single player, 86x24 dual) but does not dynamically center or expand to fill larger terminals. Components are rendered at fixed sizes with hardcoded margins.

### Solution

- **Menu (`Menu.tsx`)**: Keep centered, but allow the outer container to fill the terminal. The inner menu box stays fixed width but is always centered.
- **Single Player (`Game.tsx`)**: The outer `Box` already uses `width={size.columns} height={size.rows} justifyContent="center" alignItems="center"`. The inner layout is fixed-width. We will keep the fixed-width inner layout but ensure it always centers. Additionally, we will reduce the minimum width requirement where possible by making control hints and side panels more compact.
- **Dual Mode (`DualGame.tsx`)**: Same pattern — fixed inner layout, centered in available space. The separator and header should also center properly.
- **TooSmall (`TooSmall.tsx`)**: Keep as-is — it's a safety screen for genuinely tiny terminals.

### Acceptance

- Game renders centered at 80x24, 100x24, 120x30, 200x50 without clipping or misalignment
- Menu is vertically and horizontally centered
- No `TooSmall` screen appears at reasonable terminal sizes (≥58 cols single, ≥86 cols dual)

---

## 2. Menu Flow Investigation & Fix

### Problem (Reported)

User reports that the game "launches straight into a game rather than showing the menu."

### Current Code Analysis

`src/index.tsx` already has menu logic:
- If `args.mode` is null (no `--mode` flag), it calls `selectFromMenu()`
- Menu renders `<Menu />` with `onSelect` callback

### Hypotheses

1. **Build artifact stale** — `dist/index.js` may be out of sync with `src/index.tsx`
2. **Binary entrypoint issue** — `bin/tetris.js` may have a different behavior
3. **Test environment confusion** — The user may be running with a mode flag inadvertently

### Investigation Steps

1. Verify `dist/index.js` matches `src/index.tsx` source
2. Run `node bin/tetris.js` directly (no args) and observe behavior
3. Check if any global install or `npx` cache is serving an old version
4. If the menu truly skips, trace the `parseArgs()` output

### Fix (if needed)

If a bug is found, apply minimal fix. If no bug is found, document the correct behavior.

---

## 3. Bug Fixes

### 3.1 Hard Drop Trail Bounds Check

**File:** `src/components/Board.tsx`, line 103
**Issue:** `c <= a.column + 3` assumes max piece width of 4, but bounds check is approximate and may miss or include wrong columns for rotated pieces.
**Fix:** Use the actual piece cells to determine trail column bounds instead of a hardcoded `+3`.

### 3.2 Garbage Queue Remaining Logic

**File:** `src/game/garbage.ts`
**Issue:** `addGarbageRows` always returns `{ board, remaining: [] }`. The caller in `multiplayer.ts` sets `state.garbageQueue = result.remaining.length`, which is always `0`.
**Fix:** Implement actual remaining garbage logic. If garbage rows can't all fit (board is full), return the overflow in `remaining`.

### 3.3 Verify No Other Critical Bugs

Run full test suite, lint, and manual playthrough to catch any regressions.

---

## 4. README Overhaul

Restructure `README.md` to match `pong-cli`'s polished style:

### Structure

1. **Centered ASCII art title** — "TETRIS CLI EDITION"
2. **Badges** — npm version, license, node version (shield.io)
3. **One-line description** + tagline
4. **Static ASCII screenshot** of marathon mode (from test output)
5. **Quick Start** — `npx tetris-cli` block
6. **What Is This?** — 2-3 sentence description
7. **Features** — Emoji list (Marathon, vs CPU, 2P, SRS, hold, ghost, combos, etc.)
8. **Controls** — Clean tables for P1 and P2
9. **Options** — CLI flags table
10. **Pro Tips** — 2-3 tips in blockquote format
11. **Development** — clone/install/test commands
12. **Credits** — Acknowledge Tetris (Alexey Pajitnov, 1984)
13. **License** — MIT

### Screenshots

- Capture `01-marathon-start.txt` and `04-vs-cpu-start.txt` as inline code blocks in README
- Create a short gameplay GIF (see Section 6)

---

## 5. Release Automation

### Files to Add/Modify

#### `release-please-config.json`

```json
{
  "packages": {
    ".": {
      "changelog-path": "CHANGELOG.md",
      "release-type": "node",
      "bump-minor-pre-major": false,
      "bump-patch-for-minor-pre-major": false,
      "draft": false,
      "prerelease": false
    }
  }
}
```

#### `.release-please-manifest.json`

```json
{
  ".": "1.0.0"
}
```

#### `.github/workflows/release.yml`

- Trigger on `push` to `main` with release-please
- On release creation, run `npm publish`
- Use `NPM_TOKEN` secret

#### `package.json` updates

- Ensure `files` array includes only intended files: `bin/`, `dist/`, `README.md`, `LICENSE`, `CHANGELOG.md`
- Verify `engines` field: `node >= 18.0.0`

---

## 6. Screenshots & GIF

### Static Screenshots

Use existing test infrastructure:
- `WRITE_PLAYTHROUGH_SCREENSHOTS=1 npm test -- test/playthrough.test.ts`
- Outputs to `/tmp/tetris-cli-playthrough/`
- Use `01-marathon-start.txt`, `04-vs-cpu-start.txt`, `07-2p-start.txt`, `03-marathon-paused.txt`

### Animated GIF

Create a short (~5-10 second) gameplay GIF showing:
1. Menu navigation (mode → difficulty selection)
2. Marathon gameplay (piece movement, rotation, line clear)
3. Pause overlay

**Tools:** Use `terminalizer` or `asciinema` + `agg` (asciinema GIF generator) to record terminal session.

**Alternative:** If terminal recording tools are not available, create a sequence of text frames and convert to GIF using `imagemagick` or a Node.js library.

**Decision:** Research available tools in the environment first. If none are readily available, document the manual recording steps in the README.

---

## 7. Verification Checklist

Before release:

- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] `npm test` passes (52+ tests)
- [ ] `npm pack --dry-run` only includes intended files
- [ ] Menu shows on `node bin/tetris.js` with no args
- [ ] Game centers at 80x24, 100x24, 120x30
- [ ] No `TooSmall` screen at reasonable sizes
- [ ] README renders correctly on GitHub preview
- [ ] CHANGELOG.md is up to date

---

## Out of Scope

The following items from `PLAN.md` are intentionally deferred to keep this release focused:

- Piece preview unification tests
- Enhanced gameplay feedback (lock pulse, T-Spin callouts)
- Dual mode UX improvements (CPU difficulty badge, cleaner garbage meter)
- CPU AI using hold piece
- SRS wall kick dedicated tests
- T-Spin detection dedicated tests

---

## Architecture

No major architectural changes. All work is within existing component and file boundaries:

- `src/components/Menu.tsx` — centering and visual polish
- `src/components/Game.tsx` — dynamic centering
- `src/components/DualGame.tsx` — dynamic centering
- `src/components/Board.tsx` — trail bounds fix
- `src/game/garbage.ts` — remaining garbage fix
- `README.md` — full rewrite
- `.github/workflows/release.yml` — new file
- `release-please-config.json` — new file
- `.release-please-manifest.json` — new file
