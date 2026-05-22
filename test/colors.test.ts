import "./setup"
import assert from "node:assert/strict"
import { describe, test } from "node:test"
import { colorGarbageCompact, colorGhostCompact, colorPieceCompact } from "../src/config/colors"

const ANSI_PATTERN = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, "g")
const ANSI_BACKGROUND_PREFIX = `${String.fromCharCode(27)}[48;2;`

function visibleText(value: string): string {
	return value.replace(ANSI_PATTERN, "")
}

describe("Terminal color rendering", () => {
	test("board cells render as fixed-width filled terminal cells", () => {
		assert.ok(colorPieceCompact("T").includes(ANSI_BACKGROUND_PREFIX))
		assert.ok(colorGhostCompact("T").includes(ANSI_BACKGROUND_PREFIX))
		assert.ok(colorGarbageCompact().includes(ANSI_BACKGROUND_PREFIX))
	})

	test("ghost cells keep the same two-column width as filled cells", () => {
		assert.equal(visibleText(colorPieceCompact("T")).length, 2)
		assert.equal(visibleText(colorGhostCompact("T")).length, 2)
		assert.equal(visibleText(colorGarbageCompact()).length, 2)
		assert.equal(visibleText(colorGhostCompact()).length, 2)
	})
})
