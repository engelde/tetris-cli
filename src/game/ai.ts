import { BOARD_WIDTH, TOTAL_ROWS } from "../utils/constants.js"
import type {
	Board,
	CpuConfig,
	GameState,
	InputAction,
	PieceType,
	RotationState,
} from "../utils/types.js"
import { canPlacePiece, getCompletedLines, lockPiece } from "./board.js"
import { createPiece } from "./piece.js"

interface Placement {
	col: number
	rotationState: RotationState
	row: number
	score: number
}

function cloneBoard(board: Board): Board {
	return board.map((row) => row.map((cell) => ({ ...cell })))
}

function columnHeights(board: Board): number[] {
	const heights: number[] = []

	for (let col = 0; col < BOARD_WIDTH; col++) {
		let height = 0
		for (let row = 0; row < TOTAL_ROWS; row++) {
			if (board[row][col].type !== null) {
				height = TOTAL_ROWS - row
				break
			}
		}
		heights.push(height)
	}

	return heights
}

function countHoles(board: Board): number {
	let holes = 0

	for (let col = 0; col < BOARD_WIDTH; col++) {
		let hasBlockAbove = false
		for (let row = 0; row < TOTAL_ROWS; row++) {
			if (board[row][col].type !== null) {
				hasBlockAbove = true
			} else if (hasBlockAbove) {
				holes++
			}
		}
	}

	return holes
}

function evaluatePlacement(
	board: Board,
	pieceType: PieceType,
	rotationState: RotationState,
	col: number,
	config: CpuConfig,
): Placement | null {
	const piece = createPiece(pieceType, rotationState)
	piece.position.col = col

	if (!canPlacePiece(board, piece)) {
		return null
	}

	while (canPlacePiece(board, piece)) {
		piece.position.row++
	}
	piece.position.row--

	const testBoard = cloneBoard(board)
	lockPiece(testBoard, piece)

	const linesCleared = getCompletedLines(testBoard).length
	const heights = columnHeights(testBoard)
	const aggregateHeight = heights.reduce((sum, height) => sum + height, 0)
	const maxHeight = Math.max(...heights)
	const bumpiness = heights.slice(1).reduce((sum, height, index) => {
		return sum + Math.abs(height - heights[index])
	}, 0)
	const holes = countHoles(testBoard)

	let score = linesCleared * linesCleared * 1000
	score -= aggregateHeight * (config.useFlatHeuristic ? 8 : 4)
	score -= holes * 650
	score -= bumpiness * (config.useFlatHeuristic ? 35 : 15)
	score -= maxHeight * 20

	if (pieceType === "I" && linesCleared === 4) {
		score += 600
	}

	return {
		col,
		rotationState,
		row: piece.position.row,
		score,
	}
}

function findBestPlacement(state: GameState, config: CpuConfig): Placement | null {
	if (!state.currentPiece) return null

	const placements: Placement[] = []
	const rotations: RotationState[] = [0, 1, 2, 3]

	for (const rotationState of rotations) {
		for (let col = -2; col < BOARD_WIDTH + 2; col++) {
			const placement = evaluatePlacement(
				state.board,
				state.currentPiece.type,
				rotationState,
				col,
				config,
			)
			if (placement) {
				placements.push(placement)
			}
		}
	}

	if (placements.length === 0) return null

	placements.sort((a, b) => b.score - a.score)

	if (Math.random() < config.randomness && placements.length > 1) {
		const candidateCount = Math.max(1, Math.ceil(placements.length * 0.35))
		return placements[Math.floor(Math.random() * candidateCount)]
	}

	return placements[0]
}

function rotationDistance(from: RotationState, to: RotationState): number {
	return (to - from + 4) % 4
}

export function decideCPUMove(state: GameState, config: CpuConfig): InputAction | null {
	const piece = state.currentPiece
	if (!piece) return null

	const target = findBestPlacement(state, config)
	if (!target) return "softDrop"

	const clockwiseDistance = rotationDistance(piece.rotationState, target.rotationState)
	if (clockwiseDistance === 1 || clockwiseDistance === 2) {
		return "rotateCW"
	}
	if (clockwiseDistance === 3) {
		return "rotateCCW"
	}

	if (piece.position.col < target.col) {
		return "right"
	}
	if (piece.position.col > target.col) {
		return "left"
	}

	return piece.position.row >= target.row ? "hardDrop" : "softDrop"
}
