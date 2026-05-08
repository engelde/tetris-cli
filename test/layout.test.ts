import assert from "node:assert/strict"
import { describe, test } from "node:test"
import { render } from "ink-testing-library"
import { createElement } from "react"
import { DualGame } from "../src/components/DualGame"
import { Game } from "../src/components/Game"
import { createGameState, spawnPiece } from "../src/game/engine"
import { setTestTerminalSize } from "../src/test/terminal-size"

describe("Terminal layouts", () => {
	test("single-player game renders at 80x24 without the too-small screen", () => {
		setTestTerminalSize(80, 24)
		const state = createGameState("marathon", "normal")
		spawnPiece(state)
		state.score = 12345
		state.holdPiece = "T"

		const { lastFrame } = render(createElement(Game, { state, isHighScore: false }))
		const frame = lastFrame() ?? ""

		assert.ok(!frame.includes("Terminal Too Small"))
		assert.ok(frame.includes("HOLD"))
		assert.ok(frame.includes("NEXT"))
		assert.ok(frame.includes("STATS"))
		assert.ok(frame.includes("W/Sp hard"))
	})

	test("dual game renders at 100x24 without the too-small screen", () => {
		setTestTerminalSize(100, 24)
		const player1State = createGameState("2p", "normal")
		const player2State = createGameState("2p", "normal")
		spawnPiece(player1State)
		spawnPiece(player2State)

		const { lastFrame } = render(
			createElement(DualGame, {
				player1State,
				player2State,
				player1Label: "PLAYER 1",
				player2Label: "PLAYER 2",
				showWinner: false,
				winner: null,
			}),
		)
		const frame = lastFrame() ?? ""

		assert.ok(!frame.includes("Terminal Too Small"))
		assert.ok(frame.includes("PLAYER 1"))
		assert.ok(frame.includes("PLAYER 2"))
		assert.ok(frame.includes("P1 WASD"))
	})
})
