import "./setup"
import assert from "node:assert/strict"
import { afterEach, describe, test } from "node:test"
import {
	playGameOver,
	playHardDrop,
	playLineClear,
	playLock,
	playMove,
	playPause,
	playRotate,
	setSoundEnabled,
	setSoundOutputForTests,
	setSoundPlayerForTests,
} from "../src/audio/sound"

function captureSoundWrites(): string[] {
	const writes: string[] = []

	setSoundOutputForTests((chunk) => {
		writes.push(chunk)
	})

	return writes
}

function capturePlayedCues(): string[] {
	const cues: string[] = []

	setSoundPlayerForTests((cue) => {
		cues.push(cue)
	})

	return cues
}

afterEach(() => {
	setSoundOutputForTests(null)
	setSoundPlayerForTests(null)
	setSoundEnabled(false)
})

describe("Sound effects", () => {
	test("plays native cues for common gameplay actions", () => {
		const cues = capturePlayedCues()
		setSoundEnabled(true)

		playMove()
		playRotate()
		playLock()
		playHardDrop()

		assert.deepEqual(cues, ["move", "rotate", "lock", "hard-drop"])
	})

	test("uses richer cues for larger line clears", () => {
		const cues = capturePlayedCues()
		setSoundEnabled(true)

		playLineClear(1)
		playLineClear(4)

		assert.deepEqual(cues, ["line-clear-1", "line-clear-4"])
	})

	test("does not fall back to terminal bell when native player is available", () => {
		const writes = captureSoundWrites()
		const cues = capturePlayedCues()
		setSoundEnabled(true)

		playGameOver()
		setSoundEnabled(false)

		assert.deepEqual(cues, ["game-over"])
		assert.deepEqual(writes, [])
	})

	test("does not play cues while disabled", () => {
		const writes = captureSoundWrites()
		const cues = capturePlayedCues()
		setSoundEnabled(false)

		playLineClear(4)
		playPause()
		playGameOver()

		assert.deepEqual(cues, [])
		assert.deepEqual(writes, [])
	})
})
