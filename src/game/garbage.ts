import { BOARD_WIDTH } from "../utils/constants.js"
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

// Add garbage rows from the bottom, pushing the existing stack upward.
export function addGarbageRows(
	board: Board,
	garbageRows: GarbageRow[],
): { board: Board; remaining: GarbageRow[] } {
	for (let i = 0; i < garbageRows.length; i++) {
		const gRow = garbageRows[i]
		const newRow: Cell[] = []

		for (let c = 0; c < BOARD_WIDTH; c++) {
			if (gRow.blocks[c]) {
				newRow[c] = { type: "garbage", color: "brightBlack" }
			} else {
				newRow[c] = { type: null, color: null }
			}
		}

		// Garbage rises from the bottom and pushes the stack upward.
		board.shift()
		board.push(newRow)
	}

	return { board, remaining: [] }
}
