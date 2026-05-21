// Re-export PieceType from constants
export type PieceType = "I" | "O" | "T" | "S" | "Z" | "J" | "L"

// Rotation states (SRS)
export type RotationState = 0 | 1 | 2 | 3 // 0=spawn, 1=90°CW, 2=180°, 3=270°CW

// Direction for rotation
export type RotationDirection = 1 | -1 // 1=CW, -1=CCW

// Cell representation
export interface Cell {
	type: PieceType | "garbage" | null
	color: string | null
}

// Board is a 2D array: [row][col]
export type Board = Cell[][]

// Position on the board
export interface Position {
	row: number
	col: number
}

// Shape is a 2D array of booleans representing block positions
export type Shape = boolean[][]

// Piece definition
export interface Piece {
	type: PieceType
	color: string
	shape: Shape // Current rotation shape
	rotationState: RotationState
	position: Position // Top-left of the bounding box
}

export interface RandomizerState {
	bag: PieceType[]
	bagIndex: number
}

// SRS Wall kick test result
export interface KickResult {
	offset: Position
	rotationState: RotationState
}

// Line clear types
export type ClearType =
	| "single"
	| "double"
	| "triple"
	| "tetris"
	| "tspin-mini-single"
	| "tspin-single"
	| "tspin-mini-double"
	| "tspin-double"
	| "tspin-triple"
	| "tspin-mini-0"
	| "tspin-0"

// Scoring event
export interface ScoreEvent {
	type: ClearType
	score: number
	lines: number
	isB2B: boolean
	combo: number
}

// Game mode
export type GameMode = "marathon" | "cpu" | "2p"

// Difficulty
export type Difficulty = "easy" | "normal" | "hard"

// Animation for visual effects
export interface Animation {
	id: string
	type: "clear" | "hardDrop"
	startTime: number
	duration: number // ms
	// For line clears:
	rows?: number[]
	// For hard drop trails:
	column?: number
	columns?: number[] // Exact columns occupied by the piece
	startRow?: number
	endRow?: number
}

// Gameplay events emitted by the engine for modes/UI to consume.
export type GameEvent =
	| {
			id: string
			type: "lock"
			clearType: ClearType
			linesCleared: number
			isBackToBack: boolean
	  }
	| {
			id: string
			type: "topOut"
	  }

// Game state
export interface GameState {
	mode: GameMode
	difficulty: Difficulty
	randomizer: RandomizerState
	board: Board
	currentPiece: Piece | null
	nextQueue: PieceType[]
	holdPiece: PieceType | null
	canHold: boolean // Prevent holding same piece twice
	score: number
	level: number
	lines: number
	combo: number // -1 means no previous clear
	lastClearWasDifficult: boolean // For B2B tracking
	isGameOver: boolean
	isPaused: boolean
	lockDelay: number // Current lock delay elapsed (ms)
	lockResets: number // Number of lock resets for current piece
	gravityAccumulator: number
	animations: Animation[]
	events: GameEvent[]
	// Multiplayer
	garbageQueue: number // Incoming garbage rows
	garbageSent: number // Total garbage sent to opponent
}

// Player state (for 2P)
export interface PlayerState extends GameState {
	playerId: 1 | 2
}

// CPU difficulty config
export interface CpuConfig {
	randomness: number // 0.0 - 1.0, chance of non-optimal move
	placementSpeed: number // Milliseconds between CPU inputs
	useTSpins: boolean
	useFlatHeuristic: boolean
	lookAhead: number
}

// Garbage row with hole
export interface GarbageRow {
	hole: number // Column where the hole is (0-9)
	blocks: boolean[] // True for block, false for hole
}

// Input action
export type InputAction =
	| "left"
	| "right"
	| "softDrop"
	| "hardDrop"
	| "rotateCW"
	| "rotateCCW"
	| "hold"
	| "pause"
	| "quit"

// T-Spin detection result
export interface TSpinResult {
	isTSpin: boolean
	isMini: boolean
	frontCorners: [boolean, boolean] // [left, right] of T front
	backCorners: [boolean, boolean] // [left, right] of T back
}
