import chalk from "chalk"

// Piece colors using Chalk (Tetris Guideline colors, tuned for dark terminals)
export const PIECE_COLORS = {
	I: chalk.hex("#12dff3"), // Cyan
	O: chalk.hex("#ffe15a"), // Yellow
	T: chalk.hex("#b770ff"), // Violet
	S: chalk.hex("#4ade80"), // Green
	Z: chalk.hex("#ff5c7a"), // Red
	J: chalk.hex("#5b8cff"), // Blue
	L: chalk.hex("#ffad42"), // Orange
} as const

// 3D piece colors (light and dark shades for depth effect)
export const PIECE_3D_COLORS = {
	I: {
		light: chalk.hex("#5ef6ff"), // Bright cyan
		dark: chalk.hex("#0792a3"), // Dark cyan
	},
	O: {
		light: chalk.hex("#fff38a"), // Bright yellow
		dark: chalk.hex("#ad8b00"), // Dark yellow
	},
	T: {
		light: chalk.hex("#d9a6ff"), // Bright violet
		dark: chalk.hex("#7038b8"), // Dark violet
	},
	S: {
		light: chalk.hex("#86efac"), // Bright green
		dark: chalk.hex("#16803d"), // Dark green
	},
	Z: {
		light: chalk.hex("#ff8fa3"), // Bright red
		dark: chalk.hex("#b41d3a"), // Dark red
	},
	J: {
		light: chalk.hex("#93b5ff"), // Bright blue
		dark: chalk.hex("#2444b8"), // Dark blue
	},
	L: {
		light: chalk.hex("#ffc47a"), // Bright orange
		dark: chalk.hex("#b45c00"), // Dark orange
	},
} as const

// Ghost piece styling (dimmed)
export const GHOST_COLOR = chalk.hex("#4b6478")

// Garbage block styling
export const GARBAGE_COLOR = chalk.hex("#7b8490")

// Block characters
export const BLOCK_CHAR = "██"
export const BLOCK_3D_LEFT = "▐"
export const BLOCK_3D_RIGHT = "▌"
export const GHOST_CHAR = "░░"
export const GARBAGE_CHAR_1 = "▒"
export const GARBAGE_CHAR_2 = "▓"
export const EMPTY_CHAR = "  "

export const EMPTY_BOARD_CHAR = chalk.hex("#17212b")("· ")

// UI element colors
export const UI_COLORS = {
	normal: chalk.white,
	highlight: chalk.hex("#12dff3"),
	warning: chalk.hex("#ffe15a"),
	error: chalk.hex("#ff5c7a"),
	success: chalk.hex("#4ade80"),
	dim: chalk.dim,
	muted: chalk.hex("#6f7f8f"),
	panelTitle: chalk.hex("#e9f7ff").bold,
	accent: chalk.hex("#ffad42"),
} as const

// HUD colors
export const HUD_COLORS = {
	score: chalk.hex("#ffe15a").bold,
	level: chalk.hex("#4ade80").bold,
	lines: chalk.hex("#12dff3").bold,
	label: chalk.hex("#d8e7f0"),
	value: chalk.whiteBright,
} as const

// Special event colors
export const EVENT_COLORS = {
	tspin: chalk.hex("#d9a6ff").bold,
	b2b: chalk.hex("#ffe15a").bold,
	combo: chalk.hex("#4ade80").bold,
} as const

// Border styling
export const BORDER_COLOR = chalk.white

// Helper to colorize a block character for a specific piece type
export function colorPiece(pieceType: string, char: string = BLOCK_CHAR): string {
	const colorFn = PIECE_COLORS[pieceType as keyof typeof PIECE_COLORS]
	return colorFn ? colorFn(char) : char
}

// Helper to create ghost piece display
export function colorGhost(char: string = GHOST_CHAR): string {
	return GHOST_COLOR(char)
}

// Helper to colorize garbage blocks
export function colorGarbage(char: string = BLOCK_CHAR): string {
	return GARBAGE_COLOR(char)
}

// Helper for compact block rendering (1 row, 2 columns per block)
export function colorPieceCompact(pieceType: string): string {
	const colorFn = PIECE_COLORS[pieceType as keyof typeof PIECE_COLORS]
	if (!colorFn) {
		return "██"
	}
	return colorFn("██")
}

// Enhanced ghost with color tint (compact)
export function colorGhostCompact(pieceType?: string): string {
	if (pieceType) {
		const colorFn = PIECE_COLORS[pieceType as keyof typeof PIECE_COLORS]
		if (colorFn) {
			return colorFn.dim(GHOST_CHAR)
		}
	}

	return GHOST_COLOR(GHOST_CHAR)
}

// Textured garbage with alternating patterns (compact)
export function colorGarbageCompact(): string {
	const grayMed = chalk.hex("#888888")
	return grayMed("▒▒")
}
