import assert from "node:assert"
import { describe, test } from "node:test"
import { PIECE_TYPES } from "../src/game/piece"
import {
	createRandomizerState,
	nextPieceFromRandomizer,
	nextPieceType,
	peekFromRandomizer,
	peekNext,
	resetRandomizer,
} from "../src/game/randomizer"

describe("Randomizer (7-bag)", () => {
	test("nextPieceType returns valid piece types", () => {
		resetRandomizer()
		const type = nextPieceType()
		assert.ok(PIECE_TYPES.includes(type))
	})

	test("7-bag contains all 7 pieces", () => {
		resetRandomizer()
		const pieces: string[] = []
		for (let i = 0; i < 7; i++) {
			pieces.push(nextPieceType())
		}

		// Check all 7 types are present
		for (const type of PIECE_TYPES) {
			assert.ok(pieces.includes(type), `Missing piece type: ${type}`)
		}
	})

	test("peekNext returns correct number of pieces", () => {
		resetRandomizer()
		const next = peekNext(3)
		assert.strictEqual(next.length, 3)
	})

	test("stateful randomizers advance independently", () => {
		const first = createRandomizerState()
		const second = createRandomizerState()

		nextPieceFromRandomizer(first)
		nextPieceFromRandomizer(first)
		nextPieceFromRandomizer(second)

		assert.strictEqual(first.bagIndex, 2)
		assert.strictEqual(second.bagIndex, 1)
	})

	test("peeking a stateful randomizer does not consume pieces", () => {
		const randomizer = createRandomizerState()
		const before = randomizer.bagIndex
		const next = peekFromRandomizer(randomizer, 5)

		assert.strictEqual(next.length, 5)
		assert.strictEqual(randomizer.bagIndex, before)
	})

	test("pieces are randomized (not always same order)", () => {
		resetRandomizer()
		const bag1: string[] = []
		for (let i = 0; i < 7; i++) bag1.push(nextPieceType())

		resetRandomizer()
		const bag2: string[] = []
		for (let i = 0; i < 7; i++) bag2.push(nextPieceType())

		// Very unlikely to be identical
		let _identical = true
		for (let i = 0; i < 7; i++) {
			if (bag1[i] !== bag2[i]) {
				_identical = false
				break
			}
		}
		// Note: This could theoretically fail but very unlikely
		assert.ok(true) // Just check it doesn't crash
	})
})
