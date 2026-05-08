import type { PieceType, Position, RotationDirection, RotationState } from "../utils/types.js"

// SRS Wall Kick Data
// Format: [fromState][direction] = array of (col, row) offsets to try
// col: horizontal offset (positive = right), row: vertical offset (positive = down)
// Y-axis is positive downward (matching terminal coordinates)

// JLSTZ pieces wall kick data
// key = "fromState-direction" e.g., "0-1" = from 0, CW (1)
const KICKS_JLSTZ: Record<string, Position[]> = {
	// From state 0
	"0-1": [
		// 0 -> R (CW)
		{ row: 0, col: 0 },
		{ row: 0, col: -1 },
		{ row: 1, col: -1 },
		{ row: -2, col: 0 },
		{ row: -2, col: -1 },
	],
	"0--1": [
		// 0 -> L (CCW)
		{ row: 0, col: 0 },
		{ row: 0, col: 1 },
		{ row: 1, col: 1 },
		{ row: -2, col: 0 },
		{ row: -2, col: 1 },
	],

	// From state 1 (R)
	"1-1": [
		// R -> 2 (CW)
		{ row: 0, col: 0 },
		{ row: 0, col: 1 },
		{ row: -1, col: 1 },
		{ row: 2, col: 0 },
		{ row: 2, col: 1 },
	],
	"1--1": [
		// R -> 0 (CCW)
		{ row: 0, col: 0 },
		{ row: 0, col: -1 },
		{ row: -1, col: -1 },
		{ row: 2, col: 0 },
		{ row: 2, col: -1 },
	],

	// From state 2
	"2-1": [
		// 2 -> L (CW)
		{ row: 0, col: 0 },
		{ row: 0, col: 1 },
		{ row: 1, col: 1 },
		{ row: -2, col: 0 },
		{ row: -2, col: 1 },
	],
	"2--1": [
		// 2 -> R (CCW)
		{ row: 0, col: 0 },
		{ row: 0, col: -1 },
		{ row: 1, col: -1 },
		{ row: -2, col: 0 },
		{ row: -2, col: -1 },
	],

	// From state 3 (L)
	"3-1": [
		// L -> 0 (CW)
		{ row: 0, col: 0 },
		{ row: 0, col: -1 },
		{ row: -1, col: -1 },
		{ row: 2, col: 0 },
		{ row: 2, col: -1 },
	],
	"3--1": [
		// L -> 2 (CCW)
		{ row: 0, col: 0 },
		{ row: 0, col: 1 },
		{ row: -1, col: 1 },
		{ row: 2, col: 0 },
		{ row: 2, col: 1 },
	],
}

// I-piece wall kick data
const KICKS_I: Record<string, Position[]> = {
	// From state 0
	"0-1": [
		{ row: 0, col: 0 },
		{ row: 0, col: -2 },
		{ row: 0, col: 1 },
		{ row: -1, col: -2 },
		{ row: 2, col: 1 },
	],
	"0--1": [
		{ row: 0, col: 0 },
		{ row: 0, col: 2 },
		{ row: 0, col: -1 },
		{ row: 1, col: 2 },
		{ row: -2, col: -1 },
	],

	// From state 1 (R)
	"1-1": [
		{ row: 0, col: 0 },
		{ row: 0, col: -1 },
		{ row: 0, col: 2 },
		{ row: 2, col: -1 },
		{ row: -1, col: 2 },
	],
	"1--1": [
		{ row: 0, col: 0 },
		{ row: 0, col: 1 },
		{ row: 0, col: -2 },
		{ row: -2, col: 1 },
		{ row: 1, col: -2 },
	],

	// From state 2
	"2-1": [
		{ row: 0, col: 0 },
		{ row: 0, col: 2 },
		{ row: 0, col: -1 },
		{ row: 1, col: 2 },
		{ row: -2, col: -1 },
	],
	"2--1": [
		{ row: 0, col: 0 },
		{ row: 0, col: -2 },
		{ row: 0, col: 1 },
		{ row: -1, col: -2 },
		{ row: 2, col: 1 },
	],

	// From state 3 (L)
	"3-1": [
		{ row: 0, col: 0 },
		{ row: 0, col: 1 },
		{ row: 0, col: -2 },
		{ row: -2, col: 1 },
		{ row: 1, col: -2 },
	],
	"3--1": [
		{ row: 0, col: 0 },
		{ row: 0, col: -1 },
		{ row: 0, col: 2 },
		{ row: 2, col: -1 },
		{ row: -1, col: 2 },
	],
}

// Get the next rotation state given current and direction
export function getNextRotationState(
	current: RotationState,
	direction: RotationDirection,
): RotationState {
	return ((((current + direction) % 4) + 4) % 4) as RotationState
}

// Get wall kick tests for a piece type and rotation transition
export function getWallKickTests(
	pieceType: PieceType,
	fromState: RotationState,
	direction: RotationDirection,
): Position[] {
	if (pieceType === "O") {
		// O-piece doesn't kick
		return [{ row: 0, col: 0 }]
	}

	const key = `${fromState}-${direction}`
	if (pieceType === "I") {
		return KICKS_I[key] || [{ row: 0, col: 0 }]
	}

	return KICKS_JLSTZ[key] || [{ row: 0, col: 0 }]
}
