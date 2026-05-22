import { BOARD_WIDTH, BUFFER_ROWS } from "../utils/constants.js"
import type { Board, Piece, TSpinResult } from "../utils/types.js"

// Check for T-Spin (3-corner rule)
// Returns TSpinResult with isTSpin, isMini, and corner info
export function detectTSpin(board: Board, piece: Piece): TSpinResult {
	const result: TSpinResult = {
		isTSpin: false,
		isMini: false,
		frontCorners: [false, false],
		backCorners: [false, false],
	}

	// Only T piece can T-spin
	if (piece.type !== "T") {
		return result
	}

	// Get the center of the T piece (the intersection point)
	const cells = getPieceCells(piece)
	if (cells.length !== 4) return result

	// Find the center cell (the one with 3 neighbors)
	let centerRow = 0,
		centerCol = 0,
		neighborCount = 0
	for (const cell of cells) {
		let neighbors = 0
		for (const other of cells) {
			if (cell === other) continue
			if (Math.abs(cell.row - other.row) + Math.abs(cell.col - other.col) === 1) {
				neighbors++
			}
		}
		if (neighbors === 3) {
			centerRow = cell.row
			centerCol = cell.col
			neighborCount = neighbors
			break
		}
	}

	if (neighborCount !== 3) return result

	// Check the 4 corners around the center
	// Corners are at: (centerRow-1, centerCol-1), (centerRow-1, centerCol+1),
	//                   (centerRow+1, centerCol-1), (centerRow+1, centerCol+1)
	// But we need to know which way the T is pointing...

	// Simpler: check the 3x3 area around the center
	// The T's "front" is the direction the flat side points
	const rotation = piece.rotationState

	// Front corners and back corners depend on rotation state
	let corners: [number, number][] = []
	let backCorners: [number, number][] = []

	switch (rotation) {
		case 0: // T pointing up - front is bottom
			corners = [
				[centerRow, centerCol - 1],
				[centerRow, centerCol + 1],
			] // bottom corners
			backCorners = [
				[centerRow - 2, centerCol - 1],
				[centerRow - 2, centerCol + 1],
			] // top corners
			break
		case 1: // T pointing right - front is left
			corners = [
				[centerRow - 1, centerCol],
				[centerRow + 1, centerCol],
			] // left corners
			backCorners = [
				[centerRow - 1, centerCol + 2],
				[centerRow + 1, centerCol + 2],
			] // right corners
			break
		case 2: // T pointing down - front is top
			corners = [
				[centerRow - 1, centerCol - 1],
				[centerRow - 1, centerCol + 1],
			] // top corners
			backCorners = [
				[centerRow + 1, centerCol - 1],
				[centerRow + 1, centerCol + 1],
			] // bottom corners
			break
		case 3: // T pointing left - front is right
			corners = [
				[centerRow - 1, centerCol + 2],
				[centerRow + 1, centerCol + 2],
			] // right corners
			backCorners = [
				[centerRow - 1, centerCol],
				[centerRow + 1, centerCol],
			] // left corners
			break
	}

	// Check if corners are occupied (have blocks or are out of bounds)
	const isOccupied = (row: number, col: number): boolean => {
		if (col < 0 || col >= BOARD_WIDTH) return true // Out of bounds = occupied
		if (row < 0) return true // Above board = occupied
		if (row >= BUFFER_ROWS + 20) return true // Below board = occupied
		// Check if cell has a block (and it's not part of current piece)
		return board[row][col].type !== null
	}

	const frontOccupied = [
		isOccupied(corners[0][0], corners[0][1]),
		isOccupied(corners[1][0], corners[1][1]),
	]
	const backOccupied = [
		isOccupied(backCorners[0][0], backCorners[0][1]),
		isOccupied(backCorners[1][0], backCorners[1][1]),
	]

	result.frontCorners = [frontOccupied[0], frontOccupied[1]]
	result.backCorners = [backOccupied[0], backOccupied[1]]

	// T-Spin: 3 of 4 diagonal cells occupied
	const occupiedCount =
		(frontOccupied[0] ? 1 : 0) +
		(frontOccupied[1] ? 1 : 0) +
		(backOccupied[0] ? 1 : 0) +
		(backOccupied[1] ? 1 : 0)

	if (occupiedCount >= 3) {
		result.isTSpin = true

		// Check if it's a Mini T-Spin
		// Mini: front has 1 or 0 occupied, back has both occupied
		// OR the last move was not a "kick" (just a regular rotation)
		const frontCount = (frontOccupied[0] ? 1 : 0) + (frontOccupied[1] ? 1 : 0)
		const backCount = (backOccupied[0] ? 1 : 0) + (backOccupied[1] ? 1 : 0)

		if (frontCount < 2 || backCount < 2) {
			result.isMini = true
		}
	}

	return result
}

// Helper to get piece cells (re-exported from piece.ts)
function getPieceCells(piece: Piece): { row: number; col: number }[] {
	const cells: { row: number; col: number }[] = []
	const { shape, position } = piece

	for (let r = 0; r < shape.length; r++) {
		for (let c = 0; c < shape[r].length; c++) {
			if (shape[r][c]) {
				cells.push({
					row: position.row + r,
					col: position.col + c,
				})
			}
		}
	}
	return cells
}
