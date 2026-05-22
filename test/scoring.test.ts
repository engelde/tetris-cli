import "./setup"
import assert from "node:assert"
import { describe, test } from "node:test"
import {
	calculateScore,
	formatCompactNumber,
	getGarbageSent,
	isDifficultClear,
} from "../src/game/scoring"

describe("Scoring", () => {
	test("single scores 100 × level", () => {
		const result = calculateScore("single", 1, false, 0)
		assert.strictEqual(result.score, 100)
		assert.strictEqual(result.lines, 1)
	})

	test("double scores 300 × level", () => {
		const result = calculateScore("double", 1, false, 0)
		assert.strictEqual(result.score, 300)
	})

	test("tetris scores 800 × level", () => {
		const result = calculateScore("tetris", 1, false, 0)
		assert.strictEqual(result.score, 800)
	})

	test("tetris at level 5 scores 4000", () => {
		const result = calculateScore("tetris", 5, false, 0)
		assert.strictEqual(result.score, 4000)
	})

	test("B2B bonus applies to tetris", () => {
		const result = calculateScore("tetris", 1, true, 0)
		assert.strictEqual(result.score, 1200) // 800 × 1.5
	})

	test("combo adds bonus", () => {
		const result = calculateScore("single", 1, false, 2)
		assert.strictEqual(result.score, 200) // 100 + (50 × 2 × 1)
	})

	test("isDifficultClear identifies difficult clears", () => {
		assert.strictEqual(isDifficultClear("tetris"), true)
		assert.strictEqual(isDifficultClear("tspin-single"), true)
		assert.strictEqual(isDifficultClear("single"), false)
	})

	test("getGarbageSent returns correct values", () => {
		assert.strictEqual(getGarbageSent("single", false), 0)
		assert.strictEqual(getGarbageSent("double", false), 1)
		assert.strictEqual(getGarbageSent("tetris", false), 4)
		assert.strictEqual(getGarbageSent("tetris", true), 6) // 4 + 2 B2B
	})

	test("formatCompactNumber keeps HUD values short", () => {
		assert.strictEqual(formatCompactNumber(42), "42")
		assert.strictEqual(formatCompactNumber(12_345), "12K")
		assert.strictEqual(formatCompactNumber(999_999), "1.0M")
		assert.strictEqual(formatCompactNumber(987_654_321_098_765), "988T")
	})
})
