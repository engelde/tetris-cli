import assert from "node:assert/strict"
import { describe, test } from "node:test"
import { render } from "ink-testing-library"
import { createElement } from "react"
import { Menu } from "../src/components/Menu"

async function waitForInput() {
	await new Promise((resolve) => setTimeout(resolve, 0))
}

describe("Menu", () => {
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
