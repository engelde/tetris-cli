import assert from "node:assert/strict"
import { describe, test } from "node:test"
import { colorGhostCompact } from "../src/config/colors"

const ANSI_PATTERN = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, "g")

function visibleText(value: string): string {
	return value.replace(ANSI_PATTERN, "")
}

describe("Terminal color rendering", () => {
	test("ghost cells keep the same two-column width as filled cells", () => {
		assert.equal(visibleText(colorGhostCompact("T")).length, 2)
		assert.equal(visibleText(colorGhostCompact()).length, 2)
	})
})
