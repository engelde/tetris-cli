import assert from "node:assert/strict"
import { describe, test } from "node:test"
import {
	createGameState,
	drainGameEvents,
	gameTick,
	hardDrop,
	holdPiece,
	spawnPiece,
} from "../src/game/engine"
import { BOARD_WIDTH } from "../src/utils/constants"

describe("Engine state", () => {
	test("hard difficulty starts at configured level", () => {
		const state = createGameState("marathon", "hard")

		assert.equal(state.difficulty, "hard")
		assert.equal(state.level, 5)
	})

	test("gravity accumulator is per-state", () => {
		const state1 = createGameState("2p", "normal")
		const state2 = createGameState("2p", "normal")
		spawnPiece(state1)
		spawnPiece(state2)

		gameTick(state1, 100)

		assert.ok(state1.gravityAccumulator > 0)
		assert.equal(state2.gravityAccumulator, 0)
	})

	test("game states use independent randomizer cursors", () => {
		const state1 = createGameState("2p", "normal")
		const state2 = createGameState("2p", "normal")
		const state2Cursor = state2.randomizer.bagIndex

		spawnPiece(state1)
		for (let i = 0; i < 3; i++) {
			state1.currentPiece = null
			spawnPiece(state1)
		}

		assert.ok(state1.randomizer.bagIndex > state2.randomizer.bagIndex)
		assert.equal(state2.randomizer.bagIndex, state2Cursor)
	})

	test("hold swaps once per active piece and resets after a lock", () => {
		const state = createGameState("marathon", "normal")
		spawnPiece(state)
		const firstType = state.currentPiece?.type
		const queuedType = state.nextQueue[0]

		assert.equal(holdPiece(state), true)
		assert.equal(state.holdPiece, firstType)
		assert.equal(state.currentPiece?.type, queuedType)
		assert.equal(state.canHold, false)
		assert.equal(holdPiece(state), false)

		hardDrop(state)
		spawnPiece(state)

		assert.equal(state.canHold, true)
	})

	test("drainGameEvents returns lock events once", () => {
		const state = createGameState("marathon", "normal")
		for (let col = 0; col < BOARD_WIDTH - 1; col++) {
			state.board[39][col] = { type: "O", color: "yellow" }
		}
		state.currentPiece = {
			type: "I",
			color: "cyan",
			shape: [[true]],
			rotationState: 0,
			position: { row: 0, col: BOARD_WIDTH - 1 },
		}

		hardDrop(state)

		const events = drainGameEvents(state)
		assert.equal(events.length, 1)
		assert.equal(events[0].type, "lock")
		if (events[0].type === "lock") {
			assert.equal(events[0].clearType, "single")
			assert.equal(events[0].linesCleared, 1)
		}
		assert.equal(drainGameEvents(state).length, 0)
	})
})
