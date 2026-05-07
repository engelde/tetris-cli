import chalk from "chalk"

// Piece colors using Chalk (Tetris Guideline colors)
export const PIECE_COLORS = {
	I: chalk.hex("#00f0f0"), // Cyan
	O: chalk.hex("#f0f000"), // Yellow
	T: chalk.hex("#a000f0"), // Magenta
	S: chalk.hex("#00f000"), // Green
	Z: chalk.hex("#f00000"), // Red
	J: chalk.hex("#0000f0"), // Blue
	L: chalk.hex("#f0a000"), // Orange
} as const

// 3D piece colors (light and dark shades for depth effect)
export const PIECE_3D_COLORS = {
	I: {
		light: chalk.hex("#40ffff"), // Bright cyan
		dark: chalk.hex("#00b0b0"), // Dark cyan
	},
	O: {
		light: chalk.hex("#ffff40"), // Bright yellow
		dark: chalk.hex("#b0b000"), // Dark yellow
	},
	T: {
		light: chalk.hex("#d040ff"), // Bright magenta
		dark: chalk.hex("#7000b0"), // Dark magenta
	},
	S: {
		light: chalk.hex("#40ff40"), // Bright green
		dark: chalk.hex("#00b000"), // Dark green
	},
	Z: {
		light: chalk.hex("#ff4040"), // Bright red
		dark: chalk.hex("#b00000"), // Dark red
	},
	J: {
		light: chalk.hex("#4040ff"), // Bright blue
		dark: chalk.hex("#0000b0"), // Dark blue
	},
	L: {
		light: chalk.hex("#ff9040"), // Bright orange
		dark: chalk.hex("#b06000"), // Dark orange
	},
} as const

// Ghost piece styling (dimmed)
export const GHOST_COLOR = chalk.gray

// Garbage block styling
export const GARBAGE_COLOR = chalk.gray

// Block characters
export const BLOCK_CHAR = "██"
export const BLOCK_3D_LEFT = "▐"
export const BLOCK_3D_RIGHT = "▌"
export const GHOST_CHAR = "░░"
export const GARBAGE_CHAR_1 = "▒"
export const GARBAGE_CHAR_2 = "▓"
export const EMPTY_CHAR = "  "

// UI element colors
export const UI_COLORS = {
	normal: chalk.white,
	highlight: chalk.cyan,
	warning: chalk.yellow,
	error: chalk.red,
	success: chalk.green,
	dim: chalk.dim,
} as const

// HUD colors
export const HUD_COLORS = {
	score: chalk.yellowBright,
	level: chalk.greenBright,
	lines: chalk.cyanBright,
	label: chalk.white,
	value: chalk.whiteBright,
} as const

// Special event colors
export const EVENT_COLORS = {
	tspin: chalk.magenta,
	b2b: chalk.yellowBright,
	combo: chalk.greenBright,
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
	const grayColor = chalk.gray

	if (pieceType) {
		const colorFn = PIECE_COLORS[pieceType as keyof typeof PIECE_COLORS]
		if (colorFn) {
			return colorFn.dim("[ ]")
		}
	}

	return grayColor("[ ]")
}

// Textured garbage with alternating patterns (compact)
export function colorGarbageCompact(): string {
	const grayMed = chalk.hex("#888888")
	return grayMed("▒▒")
}
