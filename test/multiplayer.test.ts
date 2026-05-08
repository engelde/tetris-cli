import assert from "node:assert/strict"
import { describe, test } from "node:test"
import { createGameState } from "../src/game/engine"
import {
	applyPendingGarbage,
	processVersusEvents,
	queueGarbage,
	resolveGarbageAttack,
} from "../src/game/multiplayer"
import { BOARD_WIDTH } from "../src/utils/constants"

describe("Multiplayer garbage", () => {
	test("attacks cancel incoming garbage before sending surplus", () => {
		const state = createGameState("2p", "normal")
		state.garbageQueue = 3

		const result = resolveGarbageAttack(state, "tetris", false)

		assert.deepEqual(result, { attack: 4, canceled: 3, sent: 1 })
		assert.equal(state.garbageQueue, 0)
		assert.equal(state.garbageSent, 1)
	})

	test("pending garbage applies from the bottom and clears the queue", () => {
		const state = createGameState("2p", "normal")
		queueGarbage(state, 2)

		const applied = applyPendingGarbage(state)

		assert.equal(applied, 2)
		assert.equal(state.garbageQueue, 0)
		assert.ok(state.board[39].some((cell) => cell.type === "garbage"))
		assert.ok(state.board[38].some((cell) => cell.type === "garbage"))
		assert.ok(state.board[39].filter((cell) => cell.type === "garbage").length < BOARD_WIDTH)
	})

	test("pending garbage tops out when it pushes blocks into the buffer", () => {
		const state = createGameState("2p", "normal")
		state.board[20][0] = { type: "T", color: "magenta" }
		queueGarbage(state, 1)

		applyPendingGarbage(state)

		assert.equal(state.isGameOver, true)
	})

	test("versus lock events send outgoing garbage to the opponent", () => {
		const source = createGameState("2p", "normal")
		const opponent = createGameState("2p", "normal")
		source.events.push({
			id: "event-1",
			type: "lock",
			clearType: "tetris",
			linesCleared: 4,
			isBackToBack: false,
		})

		processVersusEvents(source, opponent)

		assert.equal(source.garbageSent, 4)
		assert.equal(opponent.garbageQueue, 4)
		assert.equal(source.events.length, 0)
	})
})
