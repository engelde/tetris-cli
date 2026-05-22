import "./setup"
import assert from "node:assert/strict"
import { describe, test } from "node:test"
import { render } from "ink-testing-library"
import { createElement } from "react"
import { DualGame } from "../src/components/DualGame"
import { Game } from "../src/components/Game"
import { Menu } from "../src/components/Menu"
import { createGameState, spawnPiece } from "../src/game/engine"
import { resizeTestTerminal, setTestTerminalSize } from "./terminal-size"

const ANSI_PATTERN = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, "g")

function stripAnsi(value: string): string {
	return value.replace(ANSI_PATTERN, "")
}

function assertFrameFits(frame: string, columns: number): void {
	for (const line of stripAnsi(frame).split("\n")) {
		assert.ok(line.length <= columns, `line overflowed ${columns} columns: ${line}`)
	}
}

async function waitForFrame(ms = 25) {
	await new Promise((resolve) => setTimeout(resolve, ms))
}

describe("Terminal layouts", () => {
	test("main menu remains framed after terminal resize", async () => {
		setTestTerminalSize(100, 30)
		const { lastFrame, unmount } = render(
			createElement(Menu, {
				bestScore: 987_654_321,
				initialSoundEnabled: true,
				onSelect: () => {},
				onQuit: () => {},
			}),
		)
		await waitForFrame()
		resizeTestTerminal(80, 24)
		await waitForFrame()
		const frame = lastFrame() ?? ""
		const text = stripAnsi(frame)
		unmount()

		assert.ok(text.includes("SELECT GAME MODE"))
		assert.ok(text.includes("Sound: ON"))
		assert.ok(text.includes("╔════════"))
		assert.ok(text.includes("╚════════"))
		assert.ok(!text.includes("Terminal Too Small"))
		assertFrameFits(frame, 80)
	})

	test("difficulty menu remains framed after terminal resize", async () => {
		setTestTerminalSize(100, 30)
		const { lastFrame, stdin, unmount } = render(
			createElement(Menu, {
				bestScore: 987_654_321,
				initialSoundEnabled: true,
				onSelect: () => {},
				onQuit: () => {},
			}),
		)
		await waitForFrame()
		stdin.write(" ")
		await waitForFrame()
		resizeTestTerminal(80, 24)
		await waitForFrame()
		const frame = lastFrame() ?? ""
		const text = stripAnsi(frame)
		unmount()

		assert.ok(text.includes("SELECT DIFFICULTY"))
		assert.ok(text.includes("▶ Normal"))
		assert.ok(text.includes("╔════════"))
		assert.ok(text.includes("╚════════"))
		assert.ok(!text.includes("Terminal Too Small"))
		assertFrameFits(frame, 80)
	})

	test("single-player game renders at 80x24 without the too-small screen", () => {
		setTestTerminalSize(80, 24)
		const state = createGameState("marathon", "normal")
		spawnPiece(state)
		state.score = 12345
		state.holdPiece = "T"

		const { lastFrame, unmount } = render(createElement(Game, { state, isHighScore: false }))
		const frame = lastFrame() ?? ""
		unmount()

		assert.ok(!frame.includes("Terminal Too Small"))
		assert.ok(frame.includes("HOLD"))
		assert.ok(frame.includes("NEXT"))
		assert.ok(frame.includes("GAME STATS"))
		assert.ok(frame.includes("Score"))
		assert.ok(frame.includes("Level"))
		assert.ok(frame.includes("Lines"))
		assert.ok(frame.includes("Next"))
		assert.ok(!frame.includes("SC "))
		assert.ok(!frame.includes("LV "))
		assert.ok(!frame.includes("LN "))
		assert.ok(frame.includes("TETRIS CLI"))
	})

	test("single-player stats panel compacts large values at 80x24", () => {
		setTestTerminalSize(80, 24)
		const state = createGameState("marathon", "normal")
		spawnPiece(state)
		state.score = 987_654_321_098_765
		state.level = 999_999
		state.lines = 999_999

		const { lastFrame, unmount } = render(createElement(Game, { state, isHighScore: false }))
		const frame = lastFrame() ?? ""
		const text = stripAnsi(frame)
		unmount()

		assert.ok(text.includes("Score 988T"))
		assert.ok(text.includes("Level 1.0M"))
		assert.ok(text.includes("Lines 1.0M"))
		assert.ok(!text.includes("987,654,321,098,765"))
		assertFrameFits(frame, 80)
	})

	test("game over overlay remains framed after terminal resize", async () => {
		setTestTerminalSize(100, 30)
		const state = createGameState("marathon", "normal")
		spawnPiece(state)
		state.isGameOver = true
		state.score = 123_456_789
		state.lines = 420

		const { lastFrame, unmount } = render(createElement(Game, { state, isHighScore: true }))
		await waitForFrame()
		resizeTestTerminal(80, 24)
		await waitForFrame()
		const frame = lastFrame() ?? ""
		const text = stripAnsi(frame)
		unmount()

		assert.ok(text.includes("GAME OVER"))
		assert.ok(text.includes("╔════════"))
		assert.ok(text.includes("╚════════"))
		assertFrameFits(frame, 80)
	})

	test("single-player pause menu stays compact at 80x24", () => {
		setTestTerminalSize(80, 24)
		const state = createGameState("marathon", "normal")
		spawnPiece(state)
		state.isPaused = true

		const { lastFrame, unmount } = render(
			createElement(Game, { state, isHighScore: false, pauseSelectedIndex: 1 }),
		)
		const frame = lastFrame() ?? ""
		const text = stripAnsi(frame)
		const visibleLines = text.split("\n").filter((line) => line.trim().length > 0)
		unmount()

		assert.ok(text.includes("PAUSED"))
		assert.ok(text.includes("CONTROLS"))
		assert.ok(text.includes("Move"))
		assert.ok(text.includes("Soft Drop"))
		assert.ok(text.includes("Hard Drop"))
		assert.ok(text.includes("Rotate CW"))
		assert.ok(text.includes("Rotate CCW"))
		assert.ok(text.includes("Hold"))
		assert.ok(text.includes("▶ Menu"))
		assert.ok(text.includes("Quit"))
		assert.ok(text.includes("╔════════"))
		assert.ok(text.includes("╚════════"))
		assert.ok(!text.includes("Board held. Take a breath."))
		assert.ok(visibleLines.length <= 16, `pause menu was too tall:\n${text}`)
		assertFrameFits(frame, 80)
	})

	test("single-player pause menu remains compact after terminal resize", async () => {
		setTestTerminalSize(100, 30)
		const state = createGameState("marathon", "normal")
		spawnPiece(state)
		state.isPaused = true

		const { lastFrame, unmount } = render(
			createElement(Game, { state, isHighScore: false, pauseSelectedIndex: 0 }),
		)
		await waitForFrame()
		resizeTestTerminal(80, 24)
		await waitForFrame()
		const frame = lastFrame() ?? ""
		const text = stripAnsi(frame)
		const visibleLines = text.split("\n").filter((line) => line.trim().length > 0)
		unmount()

		assert.ok(text.includes("PAUSED"))
		assert.ok(text.includes("CONTROLS"))
		assert.ok(text.includes("Move"))
		assert.ok(text.includes("Rotate CW"))
		assert.ok(text.includes("▶ Resume"))
		assert.ok(text.includes("Menu"))
		assert.ok(text.includes("Quit"))
		assert.ok(text.includes("╔════════"))
		assert.ok(text.includes("╚════════"))
		assert.ok(!text.includes("Board held. Take a breath."))
		assert.ok(visibleLines.length <= 16, `resized pause menu was too tall:\n${text}`)
		assertFrameFits(frame, 80)
	})

	test("dual game renders at 100x24 without the too-small screen", () => {
		setTestTerminalSize(100, 24)
		const player1State = createGameState("2p", "normal")
		const player2State = createGameState("2p", "normal")
		spawnPiece(player1State)
		spawnPiece(player2State)

		const { lastFrame, unmount } = render(
			createElement(DualGame, {
				player1State,
				player2State,
				player1Label: "PLAYER 1",
				player2Label: "PLAYER 2",
				showWinner: false,
				winner: null,
				matchWins: { player1: 2, player2: 1 },
			}),
		)
		const frame = lastFrame() ?? ""
		unmount()

		assert.ok(!frame.includes("Terminal Too Small"))
		assert.ok(frame.includes("PLAYER 1"))
		assert.ok(frame.includes("PLAYER 2"))
		assert.ok(frame.includes("2 wins"))
		assert.ok(frame.includes("1 wins"))
		assert.ok(frame.includes("VS"))
	})

	test("dual game winner overlay explains next round and shows match score", () => {
		setTestTerminalSize(100, 24)
		const player1State = createGameState("2p", "normal")
		const player2State = createGameState("2p", "normal")
		spawnPiece(player1State)
		spawnPiece(player2State)

		const { lastFrame, unmount } = render(
			createElement(DualGame, {
				player1State,
				player2State,
				player1Label: "PLAYER 1",
				player2Label: "PLAYER 2",
				showWinner: true,
				winner: "player1",
				matchWins: { player1: 3, player2: 2 },
			}),
		)
		const frame = lastFrame() ?? ""
		unmount()

		assert.ok(frame.includes("ROUND WINNER"))
		assert.ok(frame.includes("Match: PLAYER 1 3 - 2 PLAYER 2"))
		assert.ok(frame.includes("next round"))
	})

	test("dual winner overlay remains framed after terminal resize", async () => {
		setTestTerminalSize(112, 30)
		const player1State = createGameState("2p", "normal")
		const player2State = createGameState("2p", "normal")
		spawnPiece(player1State)
		spawnPiece(player2State)
		player2State.isGameOver = true

		const { lastFrame, unmount } = render(
			createElement(DualGame, {
				player1State,
				player2State,
				player1Label: "PLAYER 1",
				player2Label: "PLAYER 2",
				showWinner: true,
				winner: "player1",
				matchWins: { player1: 12, player2: 11 },
			}),
		)
		await waitForFrame()
		resizeTestTerminal(100, 24)
		await waitForFrame()
		const frame = lastFrame() ?? ""
		const text = stripAnsi(frame)
		unmount()

		assert.ok(text.includes("ROUND WINNER"))
		assert.ok(text.includes("╔════════"))
		assert.ok(text.includes("╚════════"))
		assert.ok(!text.includes("· · · ╔"))
		assertFrameFits(frame, 100)
	})

	test("dual pause menu stays compact at 100x24", () => {
		setTestTerminalSize(100, 24)
		const player1State = createGameState("2p", "normal")
		const player2State = createGameState("2p", "normal")
		spawnPiece(player1State)
		spawnPiece(player2State)
		player1State.isPaused = true

		const { lastFrame, unmount } = render(
			createElement(DualGame, {
				player1State,
				player2State,
				player1Label: "PLAYER 1",
				player2Label: "PLAYER 2",
				showWinner: false,
				winner: null,
				matchWins: { player1: 0, player2: 0 },
				pauseSelectedIndex: 2,
			}),
		)
		const frame = lastFrame() ?? ""
		const text = stripAnsi(frame)
		const visibleLines = text.split("\n").filter((line) => line.trim().length > 0)
		unmount()

		assert.ok(text.includes("PAUSED"))
		assert.ok(text.includes("PLAYER 1"))
		assert.ok(text.includes("PLAYER 2"))
		assert.ok(text.includes("Move"))
		assert.ok(text.includes("Soft Drop"))
		assert.ok(text.includes("Hard Drop"))
		assert.ok(text.includes("Rotate CW"))
		assert.ok(text.includes("Rotate CCW"))
		assert.ok(text.includes("Hold"))
		assert.ok(text.includes("Resume"))
		assert.ok(text.includes("Menu"))
		assert.ok(text.includes("▶ Quit"))
		assert.ok(text.includes("╔════════"))
		assert.ok(text.includes("╚════════"))
		assert.ok(!text.includes("Match held. Take a breath."))
		assert.ok(visibleLines.length <= 16, `dual pause menu was too tall:\n${text}`)
		assertFrameFits(frame, 100)
	})

	test("dual pause menu remains compact after terminal resize", async () => {
		setTestTerminalSize(112, 30)
		const player1State = createGameState("2p", "normal")
		const player2State = createGameState("2p", "normal")
		spawnPiece(player1State)
		spawnPiece(player2State)
		player2State.isPaused = true

		const { lastFrame, unmount } = render(
			createElement(DualGame, {
				player1State,
				player2State,
				player1Label: "PLAYER 1",
				player2Label: "PLAYER 2",
				showWinner: false,
				winner: null,
				matchWins: { player1: 4, player2: 3 },
				pauseSelectedIndex: 0,
			}),
		)
		await waitForFrame()
		resizeTestTerminal(100, 24)
		await waitForFrame()
		const frame = lastFrame() ?? ""
		const text = stripAnsi(frame)
		const visibleLines = text.split("\n").filter((line) => line.trim().length > 0)
		unmount()

		assert.ok(text.includes("PAUSED"))
		assert.ok(text.includes("PLAYER 1"))
		assert.ok(text.includes("PLAYER 2"))
		assert.ok(text.includes("Move"))
		assert.ok(text.includes("Rotate CW"))
		assert.ok(text.includes("▶ Resume"))
		assert.ok(text.includes("Menu"))
		assert.ok(text.includes("Quit"))
		assert.ok(text.includes("╔════════"))
		assert.ok(text.includes("╚════════"))
		assert.ok(!text.includes("Match held. Take a breath."))
		assert.ok(visibleLines.length <= 16, `resized dual pause menu was too tall:\n${text}`)
		assertFrameFits(frame, 100)
	})
})
