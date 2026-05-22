import "./setup"
import assert from "node:assert/strict"
import { describe, test } from "node:test"
import { decideCPUMove } from "../src/game/ai"
import { createGameState, spawnPiece } from "../src/game/engine"
import type { CpuConfig, InputAction } from "../src/utils/types"

const deterministicConfig: CpuConfig = {
	randomness: 0,
	placementSpeed: 200,
	useTSpins: false,
	useFlatHeuristic: true,
	lookAhead: 1,
}

describe("CPU AI", () => {
	test("chooses a placement action instead of placeholder-only actions", () => {
		const state = createGameState("cpu", "hard")
		spawnPiece(state)

		const action = decideCPUMove(state, deterministicConfig)
		const placementActions: InputAction[] = [
			"left",
			"right",
			"softDrop",
			"hardDrop",
			"rotateCW",
			"rotateCCW",
		]

		assert.ok(action)
		assert.ok(placementActions.includes(action))
		assert.notEqual(action, "hold")
	})
})
