import { BOARD_WIDTH, BUFFER_ROWS, TOTAL_ROWS } from "../utils/constants.js"
import type { Board, Cell, ClearType, Piece, Position } from "../utils/types.js"
import { getPieceCells } from "./piece.js"

// Create an empty board
export function createBoard(): Board {
	const board: Board = []
	for (let r = 0; r < TOTAL_ROWS; r++) {
		board[r] = []
		for (let c = 0; c < BOARD_WIDTH; c++) {
			board[r][c] = { type: null, color: null }
		}
	}
	return board
}

// Check if a piece can be placed at its current position
export function canPlacePiece(board: Board, piece: Piece): boolean {
	const cells = getPieceCells(piece)

	for (const { row, col } of cells) {
		// Check bounds
		if (col < 0 || col >= BOARD_WIDTH || row >= TOTAL_ROWS) {
			return false
		}
		// Check if above total rows (spawn area is fine, just not below)
		if (row < 0) continue // Allow negative rows (spawn buffer)
		// Check collision with existing blocks
		if (board[row][col].type !== null) {
			return false
		}
	}
	return true
}

// Lock a piece onto the board
export function lockPiece(board: Board, piece: Piece): void {
	const cells = getPieceCells(piece)

	for (const { row, col } of cells) {
		if (row >= 0 && row < TOTAL_ROWS && col >= 0 && col < BOARD_WIDTH) {
			board[row][col] = {
				type: piece.type,
				color: piece.color,
			}
		}
	}
}

// Check for completed lines and return them
// Returns the indices of completed rows (relative to total rows)
export function getCompletedLines(board: Board): number[] {
	const completed: number[] = []

	for (let r = BUFFER_ROWS; r < TOTAL_ROWS; r++) {
		let isComplete = true
		for (let c = 0; c < BOARD_WIDTH; c++) {
			if (board[r][c].type === null) {
				isComplete = false
				break
			}
		}
		if (isComplete) {
			completed.push(r)
		}
	}

	return completed
}

// Clear the given rows and drop everything above
export function clearLines(board: Board, rows: number[]): void {
	// Sort rows in descending order so we remove from bottom up
	const sortedRows = [...rows].sort((a, b) => b - a)

	for (const row of sortedRows) {
		// Remove the row
		board.splice(row, 1)
	}

	for (let row = 0; row < sortedRows.length; row++) {
		// Add a new empty row at the top
		const newRow: Cell[] = []
		for (let c = 0; c < BOARD_WIDTH; c++) {
			newRow[c] = { type: null, color: null }
		}
		board.unshift(newRow)
	}
}

// Detect the type of line clear for scoring
// Returns the clear type and number of lines
export function detectClearType(
	linesCleared: number,
	isTSpin: boolean,
	isTSpinMini: boolean,
): { type: ClearType; lines: number } {
	if (linesCleared === 0) {
		if (isTSpin) return { type: "tspin-0", lines: 0 }
		if (isTSpinMini) return { type: "tspin-mini-0", lines: 0 }
		return { type: "single", lines: 0 } // No clear but not T-Spin
	}

	if (isTSpin) {
		switch (linesCleared) {
			case 1:
				return { type: "tspin-single", lines: 1 }
			case 2:
				return { type: "tspin-double", lines: 2 }
			case 3:
				return { type: "tspin-triple", lines: 3 }
		}
	}

	if (isTSpinMini) {
		switch (linesCleared) {
			case 1:
				return { type: "tspin-mini-single", lines: 1 }
			case 2:
				return { type: "tspin-mini-double", lines: 2 }
		}
	}

	switch (linesCleared) {
		case 1:
			return { type: "single", lines: 1 }
		case 2:
			return { type: "double", lines: 2 }
		case 3:
			return { type: "triple", lines: 3 }
		case 4:
			return { type: "tetris", lines: 4 }
	}

	return { type: "single", lines: linesCleared }
}

// Check if the piece at its current position is touching something below
export function isPieceTouching(board: Board, piece: Piece): boolean {
	const cells = getPieceCells(piece)

	for (const { row, col } of cells) {
		const belowRow = row + 1
		// If below is out of bounds, it's touching the bottom
		if (belowRow >= TOTAL_ROWS) return true
		// If below is an occupied cell
		if (belowRow >= 0 && board[belowRow][col].type !== null) return true
	}

	return false
}

// Move a piece horizontally, return true if successful
export function movePieceX(board: Board, piece: Piece, deltaCol: number): boolean {
	piece.position.col += deltaCol
	if (!canPlacePiece(board, piece)) {
		piece.position.col -= deltaCol
		return false
	}
	return true
}

// Move a piece down, return true if successful
export function movePieceDown(board: Board, piece: Piece): boolean {
	piece.position.row += 1
	if (!canPlacePiece(board, piece)) {
		piece.position.row -= 1
		return false
	}
	return true
}

// Get the ghost piece position (where the piece would land)
export function getGhostPosition(board: Board, piece: Piece): Position {
	const ghost = {
		...piece,
		position: { ...piece.position },
	}

	while (canPlacePiece(board, ghost)) {
		ghost.position.row++
	}
	// Last valid position
	ghost.position.row--

	return ghost.position
}

// Check if a piece overlaps the visible area (for top-out detection)
export function isInVisibleArea(piece: Piece): boolean {
	const cells = getPieceCells(piece)
	for (const { row } of cells) {
		if (row >= BUFFER_ROWS) return true
	}
	return false
}

// Check for top-out: piece locked with any block in the buffer zone
export function checkTopOut(board: Board): boolean {
	// Check if any blocks exist in the buffer zone (rows 0 to BUFFER_ROWS-1)
	for (let r = 0; r < BUFFER_ROWS; r++) {
		for (let c = 0; c < BOARD_WIDTH; c++) {
			if (board[r][c].type !== null) {
				return true
			}
		}
	}
	return false
}
