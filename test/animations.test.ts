import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { createGameState, hardDrop } from "../src/game/engine.js"

describe("Animations", () => {
	it("adds a hardDrop animation on hard drop", () => {
		const state = createGameState("marathon", "normal")
		state.currentPiece = { type: "T", color: "magenta", shape: [[true, true, true], [false, true, false]], rotationState: 0, position: { row: 0, col: 4 } }
		hardDrop(state)
		assert.equal(state.animations.length, 1)
		assert.equal(state.animations[0].type, "hardDrop")
		assert.equal(state.animations[0].column, 4)
	})
})
