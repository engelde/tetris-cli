import assert from "node:assert/strict"
import { describe, test } from "node:test"
import { parseArgs } from "../src/cli-args"

describe("CLI arguments", () => {
	test("parses valid mode, difficulty, and sound flags", () => {
		const args = parseArgs(["--mode", "cpu", "--difficulty", "hard", "--no-sound"])

		assert.equal(args.mode, "cpu")
		assert.equal(args.difficulty, "hard")
		assert.equal(args.sound, false)
		assert.deepEqual(args.errors, [])
	})

	test("reports invalid mode and difficulty values", () => {
		const args = parseArgs(["--mode", "party", "--difficulty", "spicy"])

		assert.equal(args.mode, null)
		assert.equal(args.difficulty, "normal")
		assert.deepEqual(args.errors, [
			'Unknown mode "party". Use marathon, cpu, or 2p.',
			'Unknown difficulty "spicy". Use easy, normal, or hard.',
		])
	})

	test("reports missing option values", () => {
		const args = parseArgs(["--mode", "--difficulty"])

		assert.equal(args.mode, null)
		assert.deepEqual(args.errors, [
			"--mode requires a value: marathon, cpu, or 2p",
			"--difficulty requires a value: easy, normal, or hard",
		])
	})

	test("reports unknown options", () => {
		const args = parseArgs(["--turbo"])

		assert.deepEqual(args.errors, ['Unknown option "--turbo". Run with --help for usage.'])
	})
})
