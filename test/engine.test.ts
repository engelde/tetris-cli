import "./setup"
import assert from "node:assert/strict"
import { describe, test } from "node:test"
import {
	createGameState,
	drainGameEvents,
	gameTick,
	hardDrop,
	holdPiece,
	moveLeft,
	rotateCW,
	spawnPiece,
} from "../src/game/engine"
import { createPiece } from "../src/game/piece"
import { BOARD_WIDTH, LOCK_DELAY, TOTAL_ROWS } from "../src/utils/constants"

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

	test("starts lock delay after landing and allows last-second movement", () => {
		const state = createGameState("marathon", "normal")
		state.currentPiece = {
			type: "O",
			color: "yellow",
			shape: [[true]],
			rotationState: 0,
			position: { row: TOTAL_ROWS - 2, col: 4 },
		}

		gameTick(state, LOCK_DELAY * 2)

		assert.ok(state.currentPiece)
		assert.equal(state.currentPiece.position.row, TOTAL_ROWS - 1)
		assert.equal(state.lockDelay, 0)

		assert.equal(moveLeft(state), true)
		assert.equal(state.currentPiece.position.col, 3)

		gameTick(state, LOCK_DELAY - 1)
		assert.ok(state.currentPiece)

		gameTick(state, 1)
		assert.equal(state.currentPiece, null)
	})

	test("lets players rotate during the first lock-delay window after landing", () => {
		const state = createGameState("marathon", "normal")
		const piece = createPiece("T")
		piece.position = { row: TOTAL_ROWS - 3, col: 4 }
		state.currentPiece = piece

		gameTick(state, LOCK_DELAY * 2)

		assert.ok(state.currentPiece)
		assert.equal(state.currentPiece.position.row, TOTAL_ROWS - 2)
		assert.equal(rotateCW(state), true)
		assert.equal(state.currentPiece?.rotationState, 1)
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
