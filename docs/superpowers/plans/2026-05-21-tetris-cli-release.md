# tetris-cli Public Release Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix UI resize, menu flow, known bugs, and add release automation to prepare tetris-cli for GitHub/npm release.

**Architecture:** Minimal changes to existing Ink components and game engine. Focus on centering layouts, fixing two engine bugs, and adding release infrastructure.

**Tech Stack:** TypeScript, React, Ink, Node.js native test runner, Biome, GitHub Actions, release-please.

---

## File Map

| File | Responsibility |
|------|---------------|
| `src/hooks/useTerminalSize.ts` | Terminal size detection (add SIGWINCH fallback) |
| `src/components/Menu.tsx` | Title menu (fill terminal, center vertically) |
| `src/components/Game.tsx` | Single-player layout (verify centering) |
| `src/components/DualGame.tsx` | Dual-player layout (verify centering) |
| `src/utils/types.ts` | Animation type (add `columns` field) |
| `src/game/engine.ts` | Hard drop animation creation (store exact columns) |
| `src/components/Board.tsx` | Hard drop trail rendering (use exact columns) |
| `src/game/garbage.ts` | Garbage application (return overflow in `remaining`) |
| `README.md` | Full rewrite with pong-cli style |
| `release-please-config.json` | release-please configuration |
| `.release-please-manifest.json` | Current version manifest |
| `.github/workflows/release.yml` | npm publish on release creation |
| `package.json` | Release metadata |
| `CHANGELOG.md` | Version history |

---

## Task 1: Fix Terminal Resize Detection

**Files:**
- Modify: `src/hooks/useTerminalSize.ts`

The `resize` event on `process.stdout` does not fire in all terminal emulators. Add `SIGWINCH` as a fallback.

- [ ] **Step 1: Update useTerminalSize hook**

Replace the contents of `src/hooks/useTerminalSize.ts`:

```typescript
import { useEffect, useState } from "react"

interface TerminalSize {
	columns: number
	rows: number
}

export function useTerminalSize(): TerminalSize {
	const [size, setSize] = useState<TerminalSize>({
		columns: process.stdout.columns || 80,
		rows: process.stdout.rows || 24,
	})

	useEffect(() => {
		const onResize = () => {
			setSize({
				columns: process.stdout.columns || 80,
				rows: process.stdout.rows || 24,
			})
		}

		process.stdout.on("resize", onResize)
		process.on("SIGWINCH", onResize)
		return () => {
			process.stdout.off("resize", onResize)
			process.off("SIGWINCH", onResize)
		}
	}, [])

	return size
}
```

- [ ] **Step 2: Run tests**

```bash
npm test
```

Expected: 52 tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useTerminalSize.ts
git commit -m "fix(hooks): add SIGWINCH fallback for terminal resize"
```

---

## Task 2: Make Menu Fill Terminal and Center Vertically

**Files:**
- Modify: `src/components/Menu.tsx`

The menu currently renders with `padding={2}` but does not fill the terminal or center vertically.

- [ ] **Step 1: Update Menu to fill terminal**

Import `useTerminalSize` and wrap the menu in a full-size centered box.

Replace the import block in `src/components/Menu.tsx`:

```typescript
import { Box, Text, useApp, useInput } from "ink"
import { useState } from "react"
import { HUD_COLORS, UI_COLORS } from "../config/colors.js"
import { useTerminalSize } from "../hooks/useTerminalSize.js"
import type { Difficulty } from "../utils/types.js"
```

Then, inside the `Menu` function, add:

```typescript
export function Menu({ onSelect, onQuit, bestScore = 0 }: MenuProps) {
	const { exit } = useApp()
	const size = useTerminalSize()
	const [selectedMode, setSelectedMode] = useState(0)
	// ... rest of state
```

And replace the outermost `<Box>` in the return statement:

```tsx
	return (
		<Box
			width={size.columns}
			height={size.rows}
			flexDirection="column"
			justifyContent="center"
			alignItems="center"
		>
			<Box flexDirection="column" padding={2} alignItems="center">
				{/* existing title, menu box, controls box */}
			</Box>
		</Box>
	)
```

The inner `<Box flexDirection="column" padding={2} alignItems="center">` stays unchanged; we just wrap it in a full-size outer box.

- [ ] **Step 2: Run tests**

```bash
npm test
```

Expected: All tests pass, including menu layout tests.

- [ ] **Step 3: Commit**

```bash
git add src/components/Menu.tsx
git commit -m "fix(ui): make menu fill terminal and center vertically"
```

---

## Task 3: Verify Game Layout Centers Properly

**Files:**
- Modify: `src/components/Game.tsx`

The Game component already has `width={size.columns} height={size.rows} justifyContent="center" alignItems="center"`. We will ensure the inner content also centers vertically by adding `justifyContent="center"` to the inner column box.

- [ ] **Step 1: Update Game inner layout**

In `src/components/Game.tsx`, change the inner box from:

```tsx
		<Box flexDirection="column" alignItems="center">
```

to:

```tsx
		<Box flexDirection="column" alignItems="center" justifyContent="center">
```

- [ ] **Step 2: Run tests**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/Game.tsx
git commit -m "fix(ui): ensure single-player layout centers vertically"
```

---

## Task 4: Verify DualGame Layout Centers Properly

**Files:**
- Modify: `src/components/DualGame.tsx`

Same fix as Game: ensure the inner column box centers vertically.

- [ ] **Step 1: Update DualGame inner layout**

In `src/components/DualGame.tsx`, change:

```tsx
		<Box flexDirection="column" alignItems="center">
```

to:

```tsx
		<Box flexDirection="column" alignItems="center" justifyContent="center">
```

- [ ] **Step 2: Run tests**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/DualGame.tsx
git commit -m "fix(ui): ensure dual-game layout centers vertically"
```

---

## Task 5: Fix Hard Drop Trail Bounds

**Files:**
- Modify: `src/utils/types.ts`
- Modify: `src/game/engine.ts`
- Modify: `src/components/Board.tsx`

The hard drop animation stores only a single `column` value and uses `column + 3` as a rough width check. We will store the exact occupied columns in the animation.

- [ ] **Step 1: Add columns field to Animation type**

In `src/utils/types.ts`, change the Animation interface:

```typescript
export interface Animation {
	id: string
	type: "clear" | "hardDrop"
	startTime: number
	duration: number
	// For line clears:
	rows?: number[]
	// For hard drop trails:
	column?: number
	columns?: number[] // Exact columns occupied by the piece
	startRow?: number
	endRow?: number
}
```

- [ ] **Step 2: Store exact columns in hard drop animation**

In `src/game/engine.ts`, import `getPieceCells` if not already imported, then update the hard drop animation creation (around line 216):

```typescript
	if (cellsBelow > 0) {
		const pieceCells = getPieceCells(state.currentPiece)
		const columns = [...new Set(pieceCells.map((cell) => cell.col))]
		state.animations.push({
			id: String(nextAnimationId++),
			type: "hardDrop",
			startTime: Date.now(),
			duration: ANIMATION_DURATION_HARD_DROP,
			column: state.currentPiece.position.col,
			columns,
			startRow: state.currentPiece.position.row,
			endRow: ghostPos.row,
		})
	}
```

- [ ] **Step 3: Use exact columns in trail rendering**

In `src/components/Board.tsx`, replace the trail bounds check:

Old code (lines 97-106):
```typescript
				const isTrail = hardDropAnims.some(
					(a) =>
						a.startRow !== undefined &&
						a.endRow !== undefined &&
						a.column !== undefined &&
						c >= a.column &&
						c <= a.column + 3 &&
						absoluteRow >= a.startRow &&
						absoluteRow <= a.endRow,
				)
```

New code:
```typescript
				const isTrail = hardDropAnims.some(
					(a) =>
						a.startRow !== undefined &&
						a.endRow !== undefined &&
						absoluteRow >= a.startRow &&
						absoluteRow <= a.endRow &&
						(a.columns ? a.columns.includes(c) : c >= (a.column ?? 0) && c <= (a.column ?? 0) + 3),
				)
```

- [ ] **Step 4: Run tests**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/utils/types.ts src/game/engine.ts src/components/Board.tsx
git commit -m "fix(engine): use exact piece columns for hard-drop trail"
```

---

## Task 6: Fix Garbage Remaining Logic

**Files:**
- Modify: `src/game/garbage.ts`

`addGarbageRows` always returns `{ board, remaining: [] }`. We will return remaining rows when the board's buffer zone already contains blocks.

- [ ] **Step 1: Implement remaining garbage logic**

Replace `src/game/garbage.ts`:

```typescript
import { BOARD_HEIGHT, BOARD_WIDTH, BUFFER_ROWS } from "../utils/constants.js"
import type { Board, Cell, GarbageRow } from "../utils/types.js"

// Generate a garbage row with a single hole at a random column
export function generateGarbageRow(): GarbageRow {
	const hole = Math.floor(Math.random() * BOARD_WIDTH)
	const blocks: boolean[] = []

	for (let c = 0; c < BOARD_WIDTH; c++) {
		blocks[c] = c !== hole
	}

	return { hole, blocks }
}

// Generate multiple garbage rows
export function generateGarbageRows(count: number): GarbageRow[] {
	const rows: GarbageRow[] = []
	for (let i = 0; i < count; i++) {
		rows.push(generateGarbageRow())
	}
	return rows
}

// Check if any buffer row (above visible playfield) already has blocks.
function bufferHasBlocks(board: Board): boolean {
	for (let r = 0; r < BUFFER_ROWS; r++) {
		if (board[r].some((cell) => cell !== null && cell.type !== null)) {
			return true
		}
	}
	return false
}

// Add garbage rows from the bottom, pushing the existing stack upward.
// Returns any rows that could not be applied because the buffer is full.
export function addGarbageRows(
	board: Board,
	garbageRows: GarbageRow[],
): { board: Board; remaining: GarbageRow[] } {
	const remaining: GarbageRow[] = []

	for (let i = 0; i < garbageRows.length; i++) {
		// If buffer already has blocks, adding more garbage would push them out.
		// Return the rest as remaining.
		if (bufferHasBlocks(board)) {
			remaining.push(...garbageRows.slice(i))
			break
		}

		const gRow = garbageRows[i]
		const newRow: Cell[] = []

		for (let c = 0; c < BOARD_WIDTH; c++) {
			if (gRow.blocks[c]) {
				newRow[c] = { type: "garbage", color: "brightBlack" }
			} else {
				newRow[c] = { type: null, color: null }
			}
		}

		board.shift()
		board.push(newRow)
	}

	return { board, remaining }
}
```

- [ ] **Step 2: Run tests**

```bash
npm test
```

Expected: All tests pass. The existing test "pending garbage tops out when it pushes blocks into the buffer" still passes because the single garbage row is applied before the buffer check detects the pushed block.

- [ ] **Step 3: Commit**

```bash
git add src/game/garbage.ts
git commit -m "fix(engine): return remaining garbage when buffer is full"
```

---

## Task 7: Rewrite README.md

**Files:**
- Modify: `README.md`

Rewrite the README to match `pong-cli` style with ASCII art, badges, features, pro tips, and credits.

- [ ] **Step 1: Write new README**

Replace `README.md` with:

```markdown
<div align="center">

<pre>
████████╗███████╗████████╗██████╗ ██╗███████╗
╚══██╔══╝██╔════╝╚══██╔══╝██╔══██╗██║██╔════╝
   ██║   █████╗     ██║   ██████╔╝██║███████╗
   ██║   ██╔══╝     ██║   █╔══██╗██║╚════██║
   ██║   ███████╗   ██║   ██║  ██║██║███████║
   ╚═╝   ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚══════╝
</pre>

**A faithful CLI recreation of Tetris — right in your terminal.** 🎮

[![npm version](https://img.shields.io/npm/v/tetris-cli?color=black&label=npm&style=flat-square)](https://www.npmjs.com/package/tetris-cli)
[![license](https://img.shields.io/npm/l/tetris-cli?color=black&style=flat-square)](LICENSE)
[![node](https://img.shields.io/node/v/tetris-cli?color=black&style=flat-square)](package.json)

<pre>
╔══════════╗ ╔══════════════════════╗ ╔════════════╗
║ HOLD     ║ ║ · · · ██████· · · ·  ║ ║ NEXT       ║
║          ║ ║ · · · · · · · · · ·  ║ ║   ██       ║
╚══════════╝ ║ · · · · · · · · · ·  ║ ║ ██████     ║
      A/D move · · · · · · · · · ·  ║ ║   ████     ║
       K/Z J/X · · · · · · · · · ·  ║ ╚════════════╝
       H/C hold · · · · · · · · · ·  ║
             · · · · · · · · · ·  ║ ╔════════════╗
             · · · · · · · · · ·  ║ ║ STATS      ║
             · · · · · · · · · ·  ║ ║ SC       0 ║
             · · · · · · · · · ·  ║ ║ LV       1 ║
             · · · · · · · · · ·  ║ ║ LN       0 ║
             · · · · · · · · · ·  ║ ║ [      ]   ║
             · · · · · · · · · ·  ║ ╚════════════╝
             · · · · · · · · · ·  ║
             · · · · · · · · · ·  ║ S soft
             · · · · · .. · · · · ║ W/Sp hard
             · · · ······· · · · ·║ P pause/Q quit
             ╚══════════════════════╝
</pre>

*"The classic puzzle game, rebuilt for the terminal."*

</div>

## 🚀 Quick Start

```bash
npx tetris-cli
```

One command. No install. Just play.

> **Want it installed?** Run `npm install -g tetris-cli` then just type `tetris`.

## 🕹️ What Is This?

A faithful recreation of **Tetris** — the puzzle game that defined a genre. Seven pieces, one board, infinite challenge. Built with TypeScript, React, and Ink for smooth 60 FPS terminal rendering.

## ✨ Features

- 🏃 **Marathon** — Classic score chase with increasing speed
- 🤖 **vs CPU** — Battle an AI opponent on Easy, Normal, or Hard
- 👥 **2-Player** — Same-keyboard duel with garbage attacks
- 🎲 **7-Bag Randomizer** — Fair piece distribution every game
- 🔄 **SRS Rotation** — Full wall kicks and spin detection
- 📦 **Hold Piece** — Swap and strategize
- 👻 **Ghost Piece** — See exactly where you'll land
- 🔥 **Combos & Back-to-Back** — Advanced scoring for pros
- 🗑️ **Garbage System** — Send lines to your opponent
- 🏆 **Local High Scores** — Persisted in `~/.tetris-cli-scores.json`
- 🔔 **Sound Effects** — Terminal bell for game events (disable with `--no-sound`)

## 🎮 Controls

### Player 1

| Action | Keys |
|--------|------|
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
|--------|------|
| Move left | Left Arrow |
| Move right | Right Arrow |
| Soft drop | Down Arrow |
| Hard drop | Up Arrow / Space |
| Rotate clockwise | `,` / `.` |
| Rotate counter-clockwise | `/` / `>` |
| Hold | `;` / `L` |

## ⚙️ Options

| Flag | Description | Default |
|------|-------------|---------|
| `--mode <mode>` | `marathon`, `cpu`, or `2p` | Interactive menu |
| `--difficulty <level>` | `easy`, `normal`, or `hard` | `normal` |
| `--no-sound` | Disable terminal bell sounds | Sound enabled |
| `--help`, `-h` | Show help | — |
| `--version`, `-v` | Show version | — |

```bash
# Examples
npx tetris-cli --mode marathon --difficulty easy --no-sound
npx tetris-cli --mode cpu --difficulty hard
npx tetris-cli --mode 2p
```

## 💡 Pro Tips

> 🎯 **Master the hold** — Save an I-piece for the perfect Tetris setup.

> 🔄 **Learn SRS wall kicks** — A well-timed rotation can save a piece from a tight spot.

> ⚡ **Combos add up** — Clearing lines back-to-back sends massive garbage in versus modes.

> 🏓 **Watch the ghost** — The ghost piece shows your landing spot. Use it to plan ahead.

## 🛠️ Development

```bash
git clone https://github.com/engelde/tetris-cli.git
cd tetris-cli
npm install
```

| Command | Description |
|---------|-------------|
| `npm start` | Run the game |
| `npm test` | Run tests |
| `npm run build` | Compile TypeScript |
| `npm run lint` | Lint with Biome |
| `npm run format` | Format with Biome |

[Husky](https://typicode.github.io/husky/) runs linting + tests on pre-commit and enforces [Conventional Commits](https://www.conventionalcommits.org/). CI runs on Node 18 / 20 / 22. Releases via [release-please](https://github.com/googleapis/release-please).

## 📜 Credits

Inspired by the original **Tetris** created by **Alexey Pajitnov** in 1984. This is an independent, open-source recreation with no affiliation with The Tetris Company.

## 📄 License

[MIT](LICENSE)
```

- [ ] **Step 2: Verify rendering**

Preview the README in a Markdown viewer or GitHub to confirm formatting.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: rewrite README with badges, ASCII art, and pro tips"
```

---

## Task 8: Add Release Automation Config

**Files:**
- Create: `release-please-config.json`
- Create: `.release-please-manifest.json`

- [ ] **Step 1: Create release-please-config.json**

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

- [ ] **Step 2: Create .release-please-manifest.json**

```json
{
	".": "1.0.0"
}
```

- [ ] **Step 3: Commit**

```bash
git add release-please-config.json .release-please-manifest.json
git commit -m "chore: add release-please configuration"
```

---

## Task 9: Add Release Workflow

**Files:**
- Create: `.github/workflows/release.yml`

- [ ] **Step 1: Create release workflow**

```yaml
name: Release

on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: "https://registry.npmjs.org"
      - run: npm ci
      - run: npm run build
      - run: npm test
      - run: npm run lint
      - uses: googleapis/release-please-action@v4
        id: release
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
      - name: Publish to npm
        if: ${{ steps.release.outputs.release_created }}
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/release.yml
git commit -m "ci: add release-please and npm publish workflow"
```

---

## Task 10: Update Package Metadata

**Files:**
- Modify: `package.json`
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Update package.json**

Ensure the `files` array in `package.json` is correct:

```json
	"files": [
		"bin/",
		"dist/",
		"README.md",
		"LICENSE",
		"CHANGELOG.md"
	],
```

Also verify `engines`:

```json
	"engines": {
		"node": ">=18.0.0"
	},
```

- [ ] **Step 2: Update CHANGELOG.md**

Add a new section at the top:

```markdown
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
```

- [ ] **Step 3: Commit**

```bash
git add package.json CHANGELOG.md
git commit -m "chore: update package metadata and changelog for release"
```

---

## Task 11: Capture Screenshots

**Files:**
- (No file changes — captures test output)

- [ ] **Step 1: Generate screenshots**

```bash
WRITE_PLAYTHROUGH_SCREENSHOTS=1 npm test -- test/playthrough.test.ts
```

- [ ] **Step 2: Copy to docs/screenshots/**

```bash
mkdir -p docs/screenshots
cp /tmp/tetris-cli-playthrough/01-marathon-start.txt docs/screenshots/marathon.txt
cp /tmp/tetris-cli-playthrough/04-vs-cpu-start.txt docs/screenshots/vs-cpu.txt
cp /tmp/tetris-cli-playthrough/07-2p-start.txt docs/screenshots/2-player.txt
cp /tmp/tetris-cli-playthrough/03-marathon-paused.txt docs/screenshots/paused.txt
```

- [ ] **Step 3: Commit**

```bash
git add docs/screenshots/
git commit -m "docs: add gameplay screenshots"
```

---

## Task 12: Final Verification

- [ ] **Step 1: Run quality gates**

```bash
npm run lint
npm run build
npm test
```

Expected: lint passes, build succeeds, 52+ tests pass.

- [ ] **Step 2: Verify package contents**

```bash
npm pack --dry-run
```

Expected: Only `bin/`, `dist/`, `README.md`, `LICENSE`, `CHANGELOG.md` are included.

- [ ] **Step 3: Verify menu appears with no args**

```bash
node bin/tetris.js --help
node bin/tetris.js --version
```

Expected: Help and version print correctly. Menu shows when run without args (manual verification required since it's interactive).

- [ ] **Step 4: Commit any final fixes**

If any issues found in steps 1-3, fix and commit.

---

## Self-Review Checklist

- [x] Spec coverage: All design spec items map to a task
- [x] No placeholders: Every task has exact file paths and code
- [x] Type consistency: `Animation.columns` used consistently across types, engine, Board
- [x] Test coverage: Each code change has a verification step
- [x] No scope creep: Out-of-scope items from design spec are excluded
