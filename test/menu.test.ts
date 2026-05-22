import "./setup"
import assert from "node:assert/strict"
import { describe, test } from "node:test"
import { render } from "ink-testing-library"
import { createElement } from "react"
import { Menu } from "../src/components/Menu"
import { setTestTerminalSize } from "./terminal-size"

async function waitForInput() {
	await new Promise((resolve) => setTimeout(resolve, 0))
}

describe("Menu", () => {
	test("renders the ANSI logo without title text colliding into the art", () => {
		setTestTerminalSize(80, 24)
		const { lastFrame, unmount } = render(
			createElement(Menu, {
				bestScore: 12345,
				onSelect: () => {},
			}),
		)

		const frame = lastFrame() ?? ""
		unmount()

		const logoRows = [
			"████████╗███████╗████████╗██████╗ ██╗███████╗",
			"╚══██╔══╝██╔════╝╚══██╔══╝██╔══██╗██║██╔════╝",
			"   ██║   █████╗     ██║   ██████╔╝██║███████╗",
			"   ██║   ██╔══╝     ██║   ██╔══██╗██║╚════██║",
			"   ██║   ███████╗   ██║   ██║  ██║██║███████║",
			"   ╚═╝   ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚══════╝",
		]

		for (const row of logoRows) {
			assert.ok(frame.includes(row))
		}
		assert.ok(frame.includes("C L I   E D I T I O N"))
		assert.ok(!frame.includes("Arcade Tetris for the terminal"))
		assert.ok(frame.includes("Marathon"))
		assert.ok(frame.includes("Classic score chase"))
	})

	test("shows the best marathon score on the title screen", () => {
		const { lastFrame, unmount } = render(
			createElement(Menu, {
				bestScore: 12345,
				onSelect: () => {},
			}),
		)

		const frame = lastFrame() ?? ""
		unmount()

		assert.ok(frame.includes("Best Marathon: "))
		assert.ok(frame.includes("12345"))
	})

	test("toggles sound and passes the selected value into the game choice", async () => {
		let selectedSound: boolean | null = null
		const { stdin, lastFrame, unmount } = render(
			createElement(Menu, {
				onSelect: (choice) => {
					selectedSound = choice.sound
				},
			}),
		)

		assert.ok((lastFrame() ?? "").includes("Sound: ON"))

		stdin.write("t")
		await waitForInput()
		assert.ok((lastFrame() ?? "").includes("Sound: OFF"))

		stdin.write(" ")
		await waitForInput()
		stdin.write("\r")
		await waitForInput()
		unmount()

		assert.equal(selectedSound, false)
	})

	test("can open with sound already disabled", () => {
		const { lastFrame, unmount } = render(
			createElement(Menu, {
				initialSoundEnabled: false,
				onSelect: () => {},
			}),
		)

		const frame = lastFrame() ?? ""
		unmount()

		assert.ok(frame.includes("Sound: OFF"))
	})

	test("pressing Q quits without selecting a game", async () => {
		let quitCount = 0
		let selectCount = 0
		const { stdin, unmount } = render(
			createElement(Menu, {
				onQuit: () => {
					quitCount += 1
				},
				onSelect: () => {
					selectCount += 1
				},
			}),
		)

		stdin.write("q")
		await waitForInput()
		unmount()

		assert.equal(quitCount, 1)
		assert.equal(selectCount, 0)
	})
})
