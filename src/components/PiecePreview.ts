import { colorPieceCompact } from "../config/colors.js"
import type { PieceType } from "../utils/types.js"

// Piece shape templates (using 4x2 grid for compact display)
const PIECE_SHAPES: Record<PieceType, string[][]> = {
	I: [
		[" ", " ", " ", " "],
		["█", "█", "█", "█"],
	],
	O: [
		[" ", "█", "█", " "],
		[" ", "█", "█", " "],
	],
	T: [
		[" ", "█", " ", " "],
		["█", "█", "█", " "],
	],
	S: [
		[" ", "█", "█", " "],
		["█", "█", " ", " "],
	],
	Z: [
		["█", "█", " ", " "],
		[" ", "█", "█", " "],
	],
	J: [
		["█", " ", " ", " "],
		["█", "█", "█", " "],
	],
	L: [
		[" ", " ", "█", " "],
		["█", "█", "█", " "],
	],
}

/**
 * Render a piece preview as an array of strings (for display)
 * Each piece row becomes 1 terminal row.
 */
export function renderPiecePreview(pieceType: PieceType): string[] {
	const shape = PIECE_SHAPES[pieceType]
	const filled = colorPieceCompact(pieceType)
	const empty = "  " // 2 spaces for empty cell (matching compact width)

	const result: string[] = []

	for (const row of shape) {
		const line = row.map((cell) => (cell === "█" ? filled : empty)).join("")
		result.push(line)
	}

	return result
}

/**
 * Render a compact piece label (single line)
 */
export function renderPieceLabel(pieceType: PieceType): string {
	const block = colorPieceCompact(pieceType)
	return ` ${block} ${pieceType} `
}

/**
 * Get piece display lines for preview box (centered, 2 lines)
 */
export function getPiecePreviewLines(pieceType: PieceType | null): string[] {
	if (!pieceType) {
		return ["        ", "        "]
	}
	return renderPiecePreview(pieceType)
}
