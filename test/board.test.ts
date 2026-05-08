import assert from "node:assert"
import { describe, test } from "node:test"
import {
	canPlacePiece,
	clearLines,
	createBoard,
	getCompletedLines,
	getGhostPosition,
	isPieceTouching,
	lockPiece,
} from "../src/game/board"
import { createPiece, getPieceCells } from "../src/game/piece"
import { BOARD_HEIGHT, BOARD_WIDTH, BUFFER_ROWS } from "../src/utils/constants"

describe("Board", () => {
	test("createBoard creates correct dimensions", () => {
		const board = createBoard()
		assert.strictEqual(board.length, BUFFER_ROWS + BOARD_HEIGHT)
		assert.strictEqual(board[0].length, BOARD_WIDTH)
	})

	test("canPlacePiece returns true for empty board", () => {
		const board = createBoard()
		const piece = createPiece("I")
		assert.strictEqual(canPlacePiece(board, piece), true)
	})

	test("canPlacePiece returns false for out of bounds", () => {
		const board = createBoard()
		const piece = createPiece("I")
		piece.position.col = -1 // Out of bounds
		assert.strictEqual(canPlacePiece(board, piece), false)
	})

	test("lockPiece places blocks on board", () => {
		const board = createBoard()
		const piece = createPiece("O")
		piece.position = { row: BUFFER_ROWS, col: 0 }
		lockPiece(board, piece)

		// Check that cells are now occupied
		assert.strictEqual(board[BUFFER_ROWS][0].type, "O")
		assert.strictEqual(board[BUFFER_ROWS][1].type, "O")
	})

	test("getCompletedLines detects full rows", () => {
		const board = createBoard()
		// Fill row BUFFER_ROWS
		for (let c = 0; c < BOARD_WIDTH; c++) {
			board[BUFFER_ROWS][c] = { type: "I", color: "cyan" }
		}
		const completed = getCompletedLines(board)
		assert.ok(completed.includes(BUFFER_ROWS))
	})

	test("clearLines removes completed rows", () => {
		const board = createBoard()
		// Fill row BUFFER_ROWS
		for (let c = 0; c < BOARD_WIDTH; c++) {
			board[BUFFER_ROWS][c] = { type: "I", color: "cyan" }
		}
		const lines = getCompletedLines(board)
		clearLines(board, lines)

		// Row should now be empty
		assert.strictEqual(board[BUFFER_ROWS][0].type, null)
	})

	test("isPieceTouching detects bottom", () => {
		const board = createBoard()
		const piece = createPiece("I")
		piece.position = { row: BUFFER_ROWS + BOARD_HEIGHT - 1, col: 0 }
		assert.strictEqual(isPieceTouching(board, piece), true)
	})

	test("getGhostPosition finds correct landing spot", () => {
		const board = createBoard()
		const piece = createPiece("I")
		piece.position = { row: BUFFER_ROWS, col: 0 }
		const ghost = getGhostPosition(board, piece)
		assert.ok(ghost.row >= BUFFER_ROWS)
	})
})

describe("Piece", () => {
	test("createPiece creates valid piece", () => {
		const piece = createPiece("T")
		assert.strictEqual(piece.type, "T")
		assert.ok(piece.shape.length > 0)
	})

	test("getPieceCells returns correct cells", () => {
		const piece = createPiece("O")
		piece.position = { row: 20, col: 5 }
		const cells = getPieceCells(piece)
		assert.strictEqual(cells.length, 4) // O piece has 4 blocks
	})
})
