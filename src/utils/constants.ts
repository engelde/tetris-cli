// Playfield dimensions (Tetris Guideline)
export const BOARD_WIDTH = 10
export const BOARD_HEIGHT = 20
export const BUFFER_ROWS = 20 // Hidden rows above visible playfield
export const TOTAL_ROWS = BOARD_HEIGHT + BUFFER_ROWS

// Piece spawn position (top-center of visible area, in total row coordinates)
export const SPAWN_ROW = BUFFER_ROWS - 1 // Just above visible area
export const SPAWN_COL = 3 // Leftmost col for spawn (pieces vary in width)

// Timing constants (in milliseconds)
export const FRAME_TIME = 1000 / 60 // 60 FPS
export const LOCK_DELAY = 500 // ms - time before piece locks after touching surface
export const MAX_LOCK_RESETS = 15 // Max moves/rotates after touch before forced lock
export const LINE_CLEAR_DELAY = 300 // ms - visual delay before rows vanish
export const SOFT_DROP_SPEED = 50 // ms per cell when soft dropping
export const HARD_DROP_SCORE_PER_CELL = 2
export const SOFT_DROP_SCORE_PER_CELL = 1

// Animation constants (in milliseconds)
export const ANIMATION_DURATION_HARD_DROP = 150
export const ANIMATION_DURATION_CLEAR = 200

// Level/gravity constants
export const LINES_PER_LEVEL = 10
export const MAX_LEVEL = 29 // Hard cap for gravity table index

// Scoring constants (base values, multiplied by level)
export const SCORE_SINGLE = 100
export const SCORE_DOUBLE = 300
export const SCORE_TRIPLE = 500
export const SCORE_TETRIS = 800
export const SCORE_TSPIN_MINI_0 = 100
export const SCORE_TSPIN_0 = 400
export const SCORE_TSPIN_MINI_SINGLE = 200
export const SCORE_TSPIN_SINGLE = 800
export const SCORE_TSPIN_MINI_DOUBLE = 400
export const SCORE_TSPIN_DOUBLE = 1200
export const SCORE_TSPIN_TRIPLE = 1600
export const SCORE_COMBO_MULTIPLIER = 50 // 50 × combo_count × level
export const BACK_TO_BACK_MULTIPLIER = 1.5

// Garbage sent (multiplayer)
export const GARBAGE_SINGLE = 0
export const GARBAGE_DOUBLE = 1
export const GARBAGE_TRIPLE = 2
export const GARBAGE_TETRIS = 4
export const GARBAGE_TSPIN_SINGLE = 2
export const GARBAGE_TSPIN_DOUBLE = 4
export const GARBAGE_TSPIN_TRIPLE = 6
export const GARBAGE_B2B_BONUS = 1 // +1 for mini, +2 for Tetris/TSD, +3 for TST

// Next queue size
export const NEXT_QUEUE_SIZE = 3

// High score file
export const HIGH_SCORE_FILE = `${process.env.HOME || "~"}/.tetris-cli-scores.json`

// Sound beep character (terminal bell)
export const BEEP = "\x07"
