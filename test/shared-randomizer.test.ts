import "./setup"
import assert from "node:assert/strict"
import { describe, test } from "node:test"
import { createGameState, spawnPiece } from "../src/game/engine"
import { createRandomizerState, nextPieceFromRandomizer } from "../src/game/randomizer"
import type { PieceType } from "../src/utils/types"

describe("Shared piece sequence", () => {
	test("vs CPU players receive the same piece sequence", () => {
		const sharedRandomizer = createRandomizerState()
		const sharedQueue: PieceType[] = []
		for (let i = 0; i < 100; i++) {
			sharedQueue.push(nextPieceFromRandomizer(sharedRandomizer))
		}

		const playerState = createGameState("cpu", "normal")
		playerState.nextQueue = sharedQueue.slice()
		playerState.randomizer = sharedRandomizer
		const cpuState = createGameState("cpu", "normal")
		cpuState.nextQueue = sharedQueue.slice()
		cpuState.randomizer = sharedRandomizer

		spawnPiece(playerState)
		spawnPiece(cpuState)

		// Both should have the same current piece and next queue
		assert.equal(playerState.currentPiece?.type, cpuState.currentPiece?.type)
		assert.deepEqual(playerState.nextQueue, cpuState.nextQueue)

		// Spawn a few more pieces and verify they stay in sync
		for (let i = 0; i < 20; i++) {
			spawnPiece(playerState)
			spawnPiece(cpuState)
			assert.equal(playerState.currentPiece?.type, cpuState.currentPiece?.type)
			assert.deepEqual(playerState.nextQueue, cpuState.nextQueue)
		}
	})

	test("2P players receive the same piece sequence", () => {
		const sharedRandomizer = createRandomizerState()
		const sharedQueue: PieceType[] = []
		for (let i = 0; i < 100; i++) {
			sharedQueue.push(nextPieceFromRandomizer(sharedRandomizer))
		}

		const state1 = createGameState("2p", "normal")
		state1.nextQueue = sharedQueue.slice()
		state1.randomizer = sharedRandomizer
		const state2 = createGameState("2p", "normal")
		state2.nextQueue = sharedQueue.slice()
		state2.randomizer = sharedRandomizer

		spawnPiece(state1)
		spawnPiece(state2)

		assert.equal(state1.currentPiece?.type, state2.currentPiece?.type)
		assert.deepEqual(state1.nextQueue, state2.nextQueue)

		for (let i = 0; i < 20; i++) {
			spawnPiece(state1)
			spawnPiece(state2)
			assert.equal(state1.currentPiece?.type, state2.currentPiece?.type)
			assert.deepEqual(state1.nextQueue, state2.nextQueue)
		}
	})

	test("marathon mode still uses independent randomizer", () => {
		const state1 = createGameState("marathon", "normal")
		const state2 = createGameState("marathon", "normal")

		spawnPiece(state1)
		spawnPiece(state2)

		// They might occasionally match by chance, but randomizer objects should be different
		assert.notEqual(state1.randomizer, state2.randomizer)
	})
})
