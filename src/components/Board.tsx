import { Box, Text } from "ink"
import chalk from "chalk"
import {
	colorGarbageCompact,
	colorGhostCompact,
	colorPieceCompact,
	EMPTY_CHAR,
} from "../config/colors.js"
import { getGhostPosition } from "../game/board.js"
import { getPieceCells } from "../game/piece.js"
import { BOARD_HEIGHT, BOARD_WIDTH, BUFFER_ROWS } from "../utils/constants.js"
import type { GameState, Piece } from "../utils/types.js"

interface BoardProps {
	state: GameState
}

export function Board({ state }: BoardProps) {
	const { board, currentPiece } = state

	// Create a display board (visible area only)
	// Track cell types for rendering
	type CellType = { type: string; isGhost?: boolean } | null
	const displayBoard: CellType[][] = []

	// Initialize with empty cells
	for (let r = 0; r < BOARD_HEIGHT; r++) {
		displayBoard[r] = []
		for (let c = 0; c < BOARD_WIDTH; c++) {
			displayBoard[r][c] = null
		}
	}

	// Fill in placed blocks from the board
	for (let r = BUFFER_ROWS; r < BUFFER_ROWS + BOARD_HEIGHT; r++) {
		for (let c = 0; c < BOARD_WIDTH; c++) {
			const cell = board[r][c]
			const displayRow = r - BUFFER_ROWS

			if (cell?.type) {
				displayBoard[displayRow][c] = { type: cell.type }
			}
		}
	}

	// Draw ghost piece
	if (currentPiece) {
		const ghostPos = getGhostPosition(board, currentPiece)
		const ghostCells = getPieceCells({ ...currentPiece, position: ghostPos } as Piece)

		for (const { row, col } of ghostCells) {
			if (row >= BUFFER_ROWS && row < BUFFER_ROWS + BOARD_HEIGHT) {
				const displayRow = row - BUFFER_ROWS
				if (!displayBoard[displayRow][col]) {
					displayBoard[displayRow][col] = { type: currentPiece.type, isGhost: true }
				}
			}
		}
	}

	// Draw current piece (on top of ghost)
	if (currentPiece) {
		const cells = getPieceCells(currentPiece)

		for (const { row, col } of cells) {
			if (row >= BUFFER_ROWS && row < BUFFER_ROWS + BOARD_HEIGHT) {
				const displayRow = row - BUFFER_ROWS
				displayBoard[displayRow][col] = { type: currentPiece.type, isGhost: false }
			}
		}
	}

	// Render the board with compact blocks (each row becomes 1 terminal row)
	const renderedRows: string[] = []

	const clearAnims = state.animations?.filter(a => a.type === "clear") || []
	const hardDropAnims = state.animations?.filter(a => a.type === "hardDrop") || []

	for (let r = 0; r < BOARD_HEIGHT; r++) {
		// Check if this row has an active clear animation
		const isRowClearing = clearAnims.some(a => a.rows?.includes(r + BUFFER_ROWS))
		
		if (isRowClearing) {
			// Render a bright white flash for the whole row
			renderedRows.push(chalk.bgWhite("  ".repeat(BOARD_WIDTH)))
			continue
		}

		const rowArr: string[] = []

		for (let c = 0; c < BOARD_WIDTH; c++) {
			const cell = displayBoard[r][c]
			const absoluteRow = r + BUFFER_ROWS

			if (!cell) {
				// Check for hard drop particle trail
				const isTrail = hardDropAnims.some(a => 
					a.startRow !== undefined && a.endRow !== undefined &&
					a.column !== undefined && 
					c >= a.column && c <= a.column + 3 && // Rough bounds check for trail width
					absoluteRow >= a.startRow && absoluteRow <= a.endRow
				)

				if (isTrail) {
					rowArr.push(chalk.dim("· "))
				} else {
					rowArr.push(EMPTY_CHAR)
				}
			} else if (cell.isGhost) {
				rowArr.push(colorGhostCompact(cell.type))
			} else if (cell.type === "garbage") {
				rowArr.push(colorGarbageCompact())
			} else {
				rowArr.push(colorPieceCompact(cell.type))
			}
		}

		renderedRows.push(rowArr.join(""))
	}

	// Render the board with border
	return (
		<Box flexDirection="column" borderStyle="double" borderColor="cyan">
			{renderedRows.map((row, rowIndex) => (
				<Box key={`board-row-${rowIndex}`}>
					<Text>{row}</Text>
				</Box>
			))}
		</Box>
	)
}
