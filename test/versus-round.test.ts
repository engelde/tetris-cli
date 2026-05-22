import "./setup"
import assert from "node:assert/strict"
import { describe, test } from "node:test"
import { createVersusRound, recordRoundWin } from "../src/modes/versusRound"

describe("Versus rounds", () => {
	test("records round wins without resetting the match score", () => {
		const wins = recordRoundWin({ player1: 1, player2: 0 }, "player2")

		assert.deepEqual(wins, { player1: 1, player2: 1 })
	})

	test("creates a fresh round with active pieces for both players", () => {
		const round = createVersusRound("2p", "normal")

		assert.ok(round.player1State.currentPiece)
		assert.ok(round.player2State.currentPiece)
		assert.equal(round.player1State.isGameOver, false)
		assert.equal(round.player2State.isGameOver, false)
	})
})
