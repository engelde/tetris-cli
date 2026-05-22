import { BOARD_WIDTH, BUFFER_ROWS } from "../utils/constants.js"
import type { Board, Cell, GarbageRow } from "../utils/types.js"

// Generate a garbage row with a single hole at a random column
export function generateGarbageRow(): GarbageRow {
	const hole = Math.floor(Math.random() * BOARD_WIDTH)
	const blocks: boolean[] = []

	for (let c = 0; c < BOARD_WIDTH; c++) {
		blocks[c] = c !== hole
	}

	return { hole, blocks }
}

// Generate multiple garbage rows
export function generateGarbageRows(count: number): GarbageRow[] {
	const rows: GarbageRow[] = []
	for (let i = 0; i < count; i++) {
		rows.push(generateGarbageRow())
	}
	return rows
}

// Check if any buffer row (above visible playfield) already has blocks.
function bufferHasBlocks(board: Board): boolean {
	for (let r = 0; r < BUFFER_ROWS; r++) {
		if (board[r].some((cell) => cell.type !== null)) {
			return true
		}
	}
	return false
}

// Add garbage rows from the bottom, pushing the existing stack upward.
// Returns any rows that could not be applied because the buffer is full.
export function addGarbageRows(
	board: Board,
	garbageRows: GarbageRow[],
): { board: Board; remaining: GarbageRow[] } {
	const remaining: GarbageRow[] = []

	for (let i = 0; i < garbageRows.length; i++) {
		// If buffer already has blocks, adding more garbage would push them out.
		// Return the rest as remaining.
		if (bufferHasBlocks(board)) {
			remaining.push(...garbageRows.slice(i))
			break
		}

		const gRow = garbageRows[i]
		const newRow: Cell[] = []

		for (let c = 0; c < BOARD_WIDTH; c++) {
			if (gRow.blocks[c]) {
				newRow[c] = { type: "garbage", color: "brightBlack" }
			} else {
				newRow[c] = { type: null, color: null }
			}
		}

		board.shift()
		board.push(newRow)
	}

	return { board, remaining }
}
