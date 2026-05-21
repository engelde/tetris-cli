import assert from "node:assert/strict"
import { describe, test } from "node:test"
import { createBoard } from "../src/game/board.js"
import { addGarbageRows, generateGarbageRows } from "../src/game/garbage.js"
import { BOARD_HEIGHT, BUFFER_ROWS } from "../src/utils/constants.js"

describe("Garbage", () => {
	test("addGarbageRows applies all rows when buffer is empty", () => {
		const board = createBoard()
		const garbageRows = generateGarbageRows(3)

		const result = addGarbageRows(board, garbageRows)

		assert.equal(result.remaining.length, 0)
		// Bottom 3 rows should contain garbage
		assert.ok(board[BOARD_HEIGHT + BUFFER_ROWS - 1].some((cell) => cell.type === "garbage"))
		assert.ok(board[BOARD_HEIGHT + BUFFER_ROWS - 2].some((cell) => cell.type === "garbage"))
		assert.ok(board[BOARD_HEIGHT + BUFFER_ROWS - 3].some((cell) => cell.type === "garbage"))
	})

	test("addGarbageRows returns remaining rows when buffer has blocks", () => {
		const board = createBoard()
		// Place a block in the buffer zone
		board[0][0] = { type: "T", color: "magenta" }

		const garbageRows = generateGarbageRows(3)
		const result = addGarbageRows(board, garbageRows)

		// All 3 rows should remain since buffer already has blocks
		assert.equal(result.remaining.length, 3)
		// No garbage should have been applied
		assert.ok(!board.some((row) => row.some((cell) => cell.type === "garbage")))
	})

	test("addGarbageRows applies some rows before buffer fills", () => {
		const board = createBoard()
		const garbageRows = generateGarbageRows(25)

		const result = addGarbageRows(board, garbageRows)

		// Some rows should be applied, some should remain
		assert.ok(result.remaining.length > 0)
		assert.ok(result.remaining.length < 25)
		// Some garbage should have been applied
		assert.ok(board.some((row) => row.some((cell) => cell.type === "garbage")))
	})
})
