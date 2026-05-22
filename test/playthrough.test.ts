import "./setup"
import assert from "node:assert/strict"
import { mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { describe, test } from "node:test"
import { render } from "ink-testing-library"
import { createElement } from "react"
import { MarathonApp } from "../src/modes/marathon"
import { VsCpuApp } from "../src/modes/vsCpu"
import { VsPlayerApp } from "../src/modes/vsPlayer"
import { resizeTestTerminal, setTestTerminalSize } from "./terminal-size"

const SCREENSHOT_DIR = "/tmp/tetris-cli-playthrough"
const ANSI_PATTERN = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, "g")

async function waitForFrame(ms = 25) {
	await new Promise((resolve) => setTimeout(resolve, ms))
}

function stripAnsi(value: string): string {
	return value.replace(ANSI_PATTERN, "")
}

function saveScreenshot(name: string, frame: string) {
	if (!process.env.WRITE_PLAYTHROUGH_SCREENSHOTS) return
	mkdirSync(SCREENSHOT_DIR, { recursive: true })
	writeFileSync(join(SCREENSHOT_DIR, `${name}.txt`), stripAnsi(frame))
}

describe("Mode playthrough smoke tests", () => {
	test("marathon accepts movement, hold, hard drop, pause, resume, and quit", async () => {
		setTestTerminalSize(100, 24)
		let exitReason: string | null = null
		const { lastFrame, stdin, unmount } = render(
			createElement(MarathonApp, {
				difficulty: "normal",
				soundEnabled: false,
				onExit: (reason) => {
					exitReason = reason
				},
			}),
		)

		await waitForFrame()
		saveScreenshot("01-marathon-start", lastFrame() ?? "")

		stdin.write("adkjhsw")
		await waitForFrame(50)
		const activeFrame = lastFrame() ?? ""
		saveScreenshot("02-marathon-after-controls", activeFrame)

		stdin.write("p")
		await waitForFrame()
		const pausedFrame = lastFrame() ?? ""
		saveScreenshot("03-marathon-paused", pausedFrame)

		stdin.write("p")
		await waitForFrame()
		stdin.write("q")
		await waitForFrame()
		unmount()

		assert.ok(stripAnsi(activeFrame).includes("TETRIS CLI"))
		assert.ok(stripAnsi(activeFrame).includes("Score"))
		assert.ok(stripAnsi(activeFrame).includes("Next"))
		assert.ok(stripAnsi(pausedFrame).includes("PAUSED"))
		assert.ok(stripAnsi(pausedFrame).includes("CONTROLS"))
		assert.ok(stripAnsi(pausedFrame).includes("▶ Resume"))
		assert.equal(exitReason, "quit")
	})

	test("marathon pause menu supports arrow/W/S navigation and Enter selection", async () => {
		setTestTerminalSize(100, 24)
		let exitReason: string | null = null
		const { lastFrame, stdin, unmount } = render(
			createElement(MarathonApp, {
				difficulty: "normal",
				soundEnabled: false,
				onExit: (reason) => {
					exitReason = reason
				},
			}),
		)

		await waitForFrame(50)
		stdin.write("p")
		await waitForFrame(50)
		assert.ok(stripAnsi(lastFrame() ?? "").includes("▶ Resume"))

		stdin.write("\x1B[B")
		await waitForFrame(50)
		assert.ok(stripAnsi(lastFrame() ?? "").includes("▶ Menu"))

		stdin.write("w")
		await waitForFrame(50)
		assert.ok(stripAnsi(lastFrame() ?? "").includes("▶ Resume"))

		stdin.write("s")
		await waitForFrame(50)
		stdin.write("\r")
		await waitForFrame(50)
		unmount()

		assert.equal(exitReason, "menu")
	})

	test("marathon pause menu remains framed after terminal resize", async () => {
		setTestTerminalSize(100, 30)
		const { lastFrame, stdin, unmount } = render(
			createElement(MarathonApp, {
				difficulty: "normal",
				soundEnabled: false,
				onExit: () => {},
			}),
		)

		await waitForFrame(50)
		stdin.write("p")
		await waitForFrame(50)
		resizeTestTerminal(80, 24)
		await waitForFrame(50)
		const pausedFrame = stripAnsi(lastFrame() ?? "")
		unmount()

		assert.ok(pausedFrame.includes("PAUSED"))
		assert.ok(pausedFrame.includes("CONTROLS"))
		assert.ok(pausedFrame.includes("▶ Resume"))
		assert.ok(pausedFrame.includes("╚════════"))
	})

	test("vs CPU accepts player controls, updates CPU board, pauses, resumes, and quits", async () => {
		setTestTerminalSize(112, 24)
		let exitReason: string | null = null
		const { lastFrame, stdin, unmount } = render(
			createElement(VsCpuApp, {
				difficulty: "normal",
				soundEnabled: false,
				onExit: (reason) => {
					exitReason = reason
				},
			}),
		)

		await waitForFrame(100)
		saveScreenshot("04-vs-cpu-start", lastFrame() ?? "")

		stdin.write("adkhw")
		await waitForFrame(350)
		const activeFrame = lastFrame() ?? ""
		saveScreenshot("05-vs-cpu-after-controls", activeFrame)

		stdin.write("p")
		await waitForFrame()
		const pausedFrame = lastFrame() ?? ""
		saveScreenshot("06-vs-cpu-paused", pausedFrame)

		stdin.write("p")
		await waitForFrame()
		stdin.write("q")
		await waitForFrame()
		unmount()

		assert.ok(stripAnsi(activeFrame).includes("PLAYER"))
		assert.ok(stripAnsi(activeFrame).includes("CPU"))
		assert.ok(stripAnsi(activeFrame).includes("0 wins"))
		assert.ok(stripAnsi(pausedFrame).includes("PAUSED"))
		assert.ok(stripAnsi(pausedFrame).includes("PLAYER 1"))
		assert.ok(stripAnsi(pausedFrame).includes("PLAYER 2"))
		assert.ok(stripAnsi(pausedFrame).includes("▶ Resume"))
		assert.equal(exitReason, "quit")
	})

	test("vs CPU pause menu supports keyboard navigation and Enter selection", async () => {
		setTestTerminalSize(112, 24)
		let exitReason: string | null = null
		const { lastFrame, stdin, unmount } = render(
			createElement(VsCpuApp, {
				difficulty: "normal",
				soundEnabled: false,
				onExit: (reason) => {
					exitReason = reason
				},
			}),
		)

		await waitForFrame(100)
		stdin.write("p")
		await waitForFrame(50)
		assert.ok(stripAnsi(lastFrame() ?? "").includes("▶ Resume"))

		stdin.write("\x1B[B")
		await waitForFrame(50)
		assert.ok(stripAnsi(lastFrame() ?? "").includes("▶ Menu"))

		stdin.write("s")
		await waitForFrame(50)
		assert.ok(stripAnsi(lastFrame() ?? "").includes("▶ Quit"))

		stdin.write("\r")
		await waitForFrame(50)
		unmount()

		assert.equal(exitReason, "quit")
	})

	test("2-player accepts both players' controls, pauses, resumes, and quits", async () => {
		setTestTerminalSize(112, 24)
		let exitReason: string | null = null
		const { lastFrame, stdin, unmount } = render(
			createElement(VsPlayerApp, {
				difficulty: "normal",
				soundEnabled: false,
				onExit: (reason) => {
					exitReason = reason
				},
			}),
		)

		await waitForFrame(100)
		const startFrame = lastFrame() ?? ""
		saveScreenshot("07-2p-start", startFrame)

		stdin.write("akH")
		stdin.write("\x1B[C")
		stdin.write(",/; ")
		await waitForFrame(50)
		const activeFrame = lastFrame() ?? ""
		saveScreenshot("08-2p-after-controls", activeFrame)

		stdin.write("p")
		await waitForFrame()
		const pausedFrame = lastFrame() ?? ""
		saveScreenshot("09-2p-paused", pausedFrame)

		stdin.write("p")
		await waitForFrame()
		stdin.write("q")
		await waitForFrame()
		unmount()

		assert.ok(stripAnsi(activeFrame).includes("PLAYER 1"))
		assert.ok(stripAnsi(activeFrame).includes("PLAYER 2"))
		assert.ok(stripAnsi(activeFrame).includes("0 wins"))
		assert.ok(stripAnsi(pausedFrame).includes("PAUSED"))
		assert.ok(stripAnsi(pausedFrame).includes("PLAYER 1"))
		assert.ok(stripAnsi(pausedFrame).includes("PLAYER 2"))
		assert.ok(stripAnsi(pausedFrame).includes("▶ Resume"))
		assert.equal(exitReason, "quit")
	})

	test("2-player pause menu supports keyboard navigation and Enter selection", async () => {
		setTestTerminalSize(112, 24)
		let exitReason: string | null = null
		const { lastFrame, stdin, unmount } = render(
			createElement(VsPlayerApp, {
				difficulty: "normal",
				soundEnabled: false,
				onExit: (reason) => {
					exitReason = reason
				},
			}),
		)

		await waitForFrame(100)
		stdin.write("p")
		await waitForFrame(50)
		assert.ok(stripAnsi(lastFrame() ?? "").includes("▶ Resume"))

		stdin.write("s")
		await waitForFrame(50)
		assert.ok(stripAnsi(lastFrame() ?? "").includes("▶ Menu"))

		stdin.write("\r")
		await waitForFrame(50)
		unmount()

		assert.equal(exitReason, "menu")
	})

	test("versus pause menu remains framed after terminal resize", async () => {
		setTestTerminalSize(112, 30)
		const { lastFrame, stdin, unmount } = render(
			createElement(VsPlayerApp, {
				difficulty: "normal",
				soundEnabled: false,
				onExit: () => {},
			}),
		)

		await waitForFrame(80)
		stdin.write("p")
		await waitForFrame(50)
		resizeTestTerminal(112, 24)
		await waitForFrame(50)
		const pausedFrame = stripAnsi(lastFrame() ?? "")
		unmount()

		assert.ok(pausedFrame.includes("PAUSED"))
		assert.ok(pausedFrame.includes("PLAYER 1"))
		assert.ok(pausedFrame.includes("PLAYER 2"))
		assert.ok(pausedFrame.includes("▶ Resume"))
		assert.ok(pausedFrame.includes("╚════════"))
	})
})
