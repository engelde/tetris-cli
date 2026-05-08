import { SPAWN_COL, SPAWN_ROW } from "../utils/constants.js"
import type { Piece, PieceType, RotationState, Shape } from "../utils/types.js"

// Piece type definitions with their shapes for all 4 rotation states
// Shapes are defined as [row][col] boolean matrices
// Using standard Guideline/SRS bounding boxes:
// I: 4x4, O: 2x2, T/S/Z/J/L: 3x3

const F = false
const T = true

export const PIECE_SHAPES: Record<PieceType, Shape[]> = {
	I: [
		// State 0: horizontal (spawn)
		[
			[F, F, F, F],
			[T, T, T, T],
			[F, F, F, F],
			[F, F, F, F],
		],
		// State 1: vertical
		[
			[F, F, T, F],
			[F, F, T, F],
			[F, F, T, F],
			[F, F, T, F],
		],
		// State 2: horizontal (flipped)
		[
			[F, F, F, F],
			[F, F, F, F],
			[T, T, T, T],
			[F, F, F, F],
		],
		// State 3: vertical (flipped)
		[
			[F, T, F, F],
			[F, T, F, F],
			[F, T, F, F],
			[F, T, F, F],
		],
	],

	O: [
		[
			[T, T],
			[T, T],
		],
		[
			[T, T],
			[T, T],
		],
		[
			[T, T],
			[T, T],
		],
		[
			[T, T],
			[T, T],
		],
	],

	T: [
		// State 0: T pointing up
		[
			[F, T, F],
			[T, T, T],
			[F, F, F],
		],
		// State 1: T pointing right
		[
			[F, T, F],
			[F, T, T],
			[F, T, F],
		],
		// State 2: T pointing down
		[
			[F, F, F],
			[T, T, T],
			[F, T, F],
		],
		// State 3: T pointing left
		[
			[F, T, F],
			[T, T, F],
			[F, T, F],
		],
	],

	S: [
		// State 0: S horizontal
		[
			[F, T, T],
			[T, T, F],
			[F, F, F],
		],
		// State 1: S vertical
		[
			[F, T, F],
			[F, T, T],
			[F, F, T],
		],
		// State 2: S horizontal (flipped)
		[
			[F, F, F],
			[F, T, T],
			[T, T, F],
		],
		// State 3: S vertical (flipped)
		[
			[T, F, F],
			[T, T, F],
			[F, T, F],
		],
	],

	Z: [
		// State 0: Z horizontal
		[
			[T, T, F],
			[F, T, T],
			[F, F, F],
		],
		// State 1: Z vertical
		[
			[F, F, T],
			[F, T, T],
			[F, T, F],
		],
		// State 2: Z horizontal (flipped)
		[
			[F, F, F],
			[T, T, F],
			[F, T, T],
		],
		// State 3: Z vertical (flipped)
		[
			[F, T, F],
			[T, T, F],
			[T, F, F],
		],
	],

	J: [
		// State 0: J pointing up
		[
			[T, F, F],
			[T, T, T],
			[F, F, F],
		],
		// State 1: J pointing right
		[
			[F, T, T],
			[F, T, F],
			[F, T, F],
		],
		// State 2: J pointing down
		[
			[F, F, F],
			[T, T, T],
			[F, F, T],
		],
		// State 3: J pointing left
		[
			[F, T, F],
			[F, T, F],
			[T, T, F],
		],
	],

	L: [
		// State 0: L pointing up
		[
			[F, F, T],
			[T, T, T],
			[F, F, F],
		],
		// State 1: L pointing right
		[
			[F, T, F],
			[F, T, F],
			[F, T, T],
		],
		// State 2: L pointing down
		[
			[F, F, F],
			[T, T, T],
			[T, F, F],
		],
		// State 3: L pointing left
		[
			[T, T, F],
			[F, T, F],
			[F, T, F],
		],
	],
}

// Piece color names used by gameplay state and render helpers.
export const PIECE_COLORS: Record<PieceType, string> = {
	I: "cyan",
	O: "yellow",
	T: "magenta",
	S: "green",
	Z: "red",
	J: "blue",
	L: "white",
}

export const PIECE_TYPES: PieceType[] = ["I", "O", "T", "S", "Z", "J", "L"]

// Create a new piece at spawn position
export function createPiece(type: PieceType, rotationState: RotationState = 0): Piece {
	const shapes = PIECE_SHAPES[type]
	return {
		type,
		color: PIECE_COLORS[type],
		shape: shapes[rotationState],
		rotationState,
		position: {
			row: SPAWN_ROW,
			col: SPAWN_COL,
		},
	}
}

// Get the shape for a piece at a specific rotation state
export function getShapeAtRotation(type: PieceType, rotationState: RotationState): Shape {
	return PIECE_SHAPES[type][rotationState]
}

// Get all cell positions occupied by a piece
export function getPieceCells(piece: Piece): { row: number; col: number }[] {
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
