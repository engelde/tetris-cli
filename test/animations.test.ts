import "./setup"
import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { createGameState, gameTick, hardDrop } from "../src/game/engine.js"

describe("Animations", () => {
	it("adds a hardDrop animation on hard drop", () => {
		const state = createGameState("marathon", "normal")
		state.currentPiece = {
			type: "T",
			color: "magenta",
			shape: [
				[true, true, true],
				[false, true, false],
			],
			rotationState: 0,
			position: { row: 0, col: 4 },
		}
		hardDrop(state)
		assert.equal(state.animations.length, 1)
		assert.equal(state.animations[0].type, "hardDrop")
		assert.equal(state.animations[0].column, 4)
		assert.deepEqual(state.animations[0].columns, [4, 5, 6])
	})

	it("adds a clear animation when lines are cleared", () => {
		const state = createGameState("marathon", "normal")
		// Fill bottom row except one column
		for (let c = 0; c < 9; c++) {
			state.board[39][c] = { type: "O", color: "yellow" }
		}
		// Piece that will fill the gap at col 9
		state.currentPiece = {
			type: "I",
			color: "cyan",
			shape: [[true]],
			rotationState: 0,
			position: { row: 0, col: 9 },
		}

		hardDrop(state)

		const clearAnim = state.animations.find((a) => a.type === "clear")
		assert.ok(clearAnim, "clear animation should be dispatched")
	})

	it("removes expired animations on gameTick", () => {
		const state = createGameState("marathon", "normal")
		state.animations.push({
			id: "test1",
			type: "hardDrop",
			startTime: Date.now() - 1000,
			duration: 150,
			column: 0,
			columns: [0, 1, 2, 3],
			startRow: 0,
			endRow: 20,
		})

		gameTick(state, 16)

		assert.equal(state.animations.length, 0)
	})
})
