import {
	playB2B,
	playHardDrop,
	playLineClear,
	playLock,
	playMove,
	playRotate,
	playTSpin,
} from "../audio/sound.js"
import { DIFFICULTY_CONFIGS, getEffectiveGravity } from "../config/settings.js"
import {
	ANIMATION_DURATION_CLEAR,
	ANIMATION_DURATION_HARD_DROP,
	FRAME_TIME,
	HARD_DROP_SCORE_PER_CELL,
	LINES_PER_LEVEL,
	LOCK_DELAY,
	MAX_LEVEL,
	MAX_LOCK_RESETS,
	NEXT_QUEUE_SIZE,
	SOFT_DROP_SCORE_PER_CELL,
} from "../utils/constants.js"
import type {
	ClearType,
	Difficulty,
	GameEvent,
	GameMode,
	GameState,
	InputAction,
	RotationDirection,
	RotationState,
} from "../utils/types.js"
import {
	canPlacePiece,
	checkTopOut,
	clearLines,
	createBoard,
	getCompletedLines,
	getGhostPosition,
	isPieceTouching,
	lockPiece,
	movePieceDown,
	movePieceX,
} from "./board.js"
import { createPiece, getShapeAtRotation } from "./piece.js"
import { createRandomizerState, nextPieceFromRandomizer } from "./randomizer.js"
import { calculateScore, isDifficultClear } from "./scoring.js"
import { getWallKickTests } from "./srs.js"
import { detectTSpin } from "./tspin.js"

// Animation ID counter
let nextAnimationId = 1
let nextEventId = 1

type GameEventInput =
	| {
			type: "lock"
			clearType: ClearType
			linesCleared: number
			isBackToBack: boolean
	  }
	| {
			type: "topOut"
	  }

// Create initial game state
export function createGameState(mode: GameMode, _difficulty: Difficulty): GameState {
	const randomizer = createRandomizerState()
	const nextQueue = Array.from({ length: NEXT_QUEUE_SIZE }, () =>
		nextPieceFromRandomizer(randomizer),
	)
	const difficulty = _difficulty
	const config = DIFFICULTY_CONFIGS[difficulty]

	return {
		mode,
		difficulty,
		randomizer,
		board: createBoard(),
		currentPiece: null,
		nextQueue,
		holdPiece: null,
		canHold: true,
		score: 0,
		level: config.startLevel,
		lines: 0,
		combo: -1,
		lastClearWasDifficult: false,
		isGameOver: false,
		isPaused: false,
		lockDelay: 0,
		lockResets: 0,
		gravityAccumulator: 0,
		animations: [],
		events: [],
		garbageQueue: 0,
		garbageSent: 0,
	}
}

function emitEvent(state: GameState, event: GameEventInput): void {
	if (event.type === "lock") {
		state.events.push({
			id: String(nextEventId++),
			type: "lock",
			clearType: event.clearType,
			linesCleared: event.linesCleared,
			isBackToBack: event.isBackToBack,
		})
		return
	}

	state.events.push({
		id: String(nextEventId++),
		type: "topOut",
	})
}

export function drainGameEvents(state: GameState): GameEvent[] {
	const events = [...state.events]
	state.events = []
	return events
}

// Spawn a new piece at the top of the board
export function spawnPiece(state: GameState): boolean {
	while (state.nextQueue.length < NEXT_QUEUE_SIZE) {
		state.nextQueue.push(nextPieceFromRandomizer(state.randomizer))
	}

	const pieceType = state.nextQueue.shift()
	if (!pieceType) {
		state.isGameOver = true
		emitEvent(state, { type: "topOut" })
		return false
	}
	const newPiece = createPiece(pieceType)

	// Get next pieces for the queue
	while (state.nextQueue.length < NEXT_QUEUE_SIZE) {
		state.nextQueue.push(nextPieceFromRandomizer(state.randomizer))
	}

	state.currentPiece = newPiece
	state.canHold = true
	state.lockDelay = 0
	state.lockResets = 0

	// Check if spawn position is valid
	if (!canPlacePiece(state.board, newPiece)) {
		// Try wall kicks for spawn
		const kicks = getWallKickTests(pieceType, 0 as RotationState, 1 as RotationDirection)
		let spawned = false

		for (const kick of kicks) {
			newPiece.position.col += kick.col
			newPiece.position.row += kick.row
			if (canPlacePiece(state.board, newPiece)) {
				spawned = true
				break
			}
			newPiece.position.col -= kick.col
			newPiece.position.row -= kick.row
		}

		if (!spawned) {
			state.isGameOver = true
			emitEvent(state, { type: "topOut" })
			return false
		}
	}

	return true
}

// Move piece left
export function moveLeft(state: GameState): boolean {
	if (!state.currentPiece) return false
	const moved = movePieceX(state.board, state.currentPiece, -1)
	if (moved) {
		playMove()
		resetLockDelay(state)
	}
	return moved
}

// Move piece right
export function moveRight(state: GameState): boolean {
	if (!state.currentPiece) return false
	const moved = movePieceX(state.board, state.currentPiece, 1)
	if (moved) {
		playMove()
		resetLockDelay(state)
	}
	return moved
}

// Soft drop (move down one cell)
export function softDrop(state: GameState): boolean {
	if (!state.currentPiece) return false
	const moved = movePieceDown(state.board, state.currentPiece)
	if (moved) {
		state.score += SOFT_DROP_SCORE_PER_CELL
	}
	return moved
}

// Hard drop (instantly drop to bottom)
export function hardDrop(state: GameState): void {
	if (!state.currentPiece) return

	const ghostPos = getGhostPosition(state.board, state.currentPiece)
	const cellsBelow = ghostPos.row - state.currentPiece.position.row

	if (cellsBelow > 0) {
		state.animations.push({
			id: String(nextAnimationId++),
			type: "hardDrop",
			startTime: Date.now(),
			duration: ANIMATION_DURATION_HARD_DROP,
			column: state.currentPiece.position.col,
			startRow: state.currentPiece.position.row,
			endRow: ghostPos.row,
		})
	}

	state.currentPiece.position.row = ghostPos.row
	state.score += HARD_DROP_SCORE_PER_CELL * cellsBelow

	playHardDrop()
	lockCurrentPiece(state)
}

// Rotate piece clockwise
export function rotateCW(state: GameState): boolean {
	return rotatePiece(state, 1 as RotationDirection)
}

// Rotate piece counter-clockwise
export function rotateCCW(state: GameState): boolean {
	return rotatePiece(state, -1 as RotationDirection)
}

// Generic rotate piece
function rotatePiece(state: GameState, direction: RotationDirection): boolean {
	if (!state.currentPiece) return false

	const piece = state.currentPiece
	const oldRotation = piece.rotationState
	const newRotation = ((((oldRotation + direction) % 4) + 4) % 4) as RotationState

	// Get the new shape
	const newShape = getShapeAtRotation(piece.type, newRotation)

	// Save old state
	const oldShape = piece.shape
	const oldPos = { ...piece.position }

	// Try the rotation
	piece.shape = newShape
	piece.rotationState = newRotation

	// Check if valid
	if (canPlacePiece(state.board, piece)) {
		playRotate()
		resetLockDelay(state)
		return true
	}

	// Try wall kicks
	const kicks = getWallKickTests(piece.type, oldRotation, direction)
	for (const kick of kicks) {
		piece.position.col += kick.col
		piece.position.row += kick.row

		if (canPlacePiece(state.board, piece)) {
			playRotate()
			resetLockDelay(state)
			return true
		}

		piece.position.col -= kick.col
		piece.position.row -= kick.row
	}

	// Revert
	piece.shape = oldShape
	piece.rotationState = oldRotation
	piece.position = oldPos

	return false
}

// Hold current piece
export function holdPiece(state: GameState): boolean {
	if (!state.currentPiece || !state.canHold) return false

	const currentType = state.currentPiece.type
	state.canHold = false

	if (state.holdPiece) {
		// Swap with hold
		const heldType = state.holdPiece
		state.holdPiece = currentType
		const newPiece = createPiece(heldType)
		state.currentPiece = newPiece
	} else {
		// Just hold, spawn next
		state.holdPiece = currentType
		spawnPiece(state)
	}

	state.canHold = false
	state.lockDelay = 0
	state.lockResets = 0

	return true
}

// Reset lock delay (on move/rotate)
function resetLockDelay(state: GameState): void {
	if (state.currentPiece && isPieceTouching(state.board, state.currentPiece)) {
		if (state.lockResets < MAX_LOCK_RESETS) {
			state.lockDelay = 0
			state.lockResets++
		}
	}
}

// Lock the current piece onto the board
function lockCurrentPiece(state: GameState): void {
	if (!state.currentPiece) return

	lockPiece(state.board, state.currentPiece)
	playLock()

	// Check for T-Spin (before clearing lines, piece is still "on board")
	let tSpinResult = { isTSpin: false, isMini: false }
	if (state.currentPiece.type === "T") {
		try {
			tSpinResult = detectTSpin(state.board, state.currentPiece)
		} catch (err) {
			console.error("T-Spin detection error:", err)
		}
	}

	// Check for completed lines
	const completedLines = getCompletedLines(state.board)
	const linesCleared = completedLines.length

	// Determine clear type
	let clearType: ClearType = "single"
	let isTSpin = false
	let _isTSpinMini = false

	if (linesCleared === 0) {
		if (tSpinResult.isTSpin) {
			clearType = tSpinResult.isMini ? "tspin-mini-0" : "tspin-0"
			isTSpin = true
			_isTSpinMini = tSpinResult.isMini
		}
	} else {
		switch (linesCleared) {
			case 1:
				if (tSpinResult.isTSpin) {
					clearType = tSpinResult.isMini ? "tspin-mini-single" : "tspin-single"
					isTSpin = true
					_isTSpinMini = tSpinResult.isMini
				} else {
					clearType = "single"
				}
				break
			case 2:
				if (tSpinResult.isTSpin) {
					clearType = tSpinResult.isMini ? "tspin-mini-double" : "tspin-double"
					isTSpin = true
					_isTSpinMini = tSpinResult.isMini
				} else {
					clearType = "double"
				}
				break
			case 3:
				if (tSpinResult.isTSpin) {
					clearType = "tspin-triple"
					isTSpin = true
				} else {
					clearType = "triple"
				}
				break
			case 4:
				clearType = "tetris"
				break
		}
	}

	// Calculate score
	const isBackToBack = state.lastClearWasDifficult && isDifficultClear(clearType)
	const scoreEvent = calculateScore(clearType, state.level, isBackToBack, Math.max(0, state.combo))

	state.score += scoreEvent.score

	if (linesCleared > 0) {
		state.lines += linesCleared

		// Add clear animation
		state.animations.push({
			id: String(nextAnimationId++),
			type: "clear",
			startTime: Date.now(),
			duration: ANIMATION_DURATION_CLEAR,
			rows: [...completedLines],
		})

		// Update combo
		state.combo = state.combo < 0 ? 0 : state.combo + 1

		// Update B2B
		state.lastClearWasDifficult = scoreEvent.isB2B

		// Clear the lines
		clearLines(state.board, completedLines)
		playLineClear(linesCleared)

		// Play T-Spin sound if applicable
		if (isTSpin && linesCleared > 0) {
			playTSpin()
		}

		if (isBackToBack && scoreEvent.isB2B) {
			playB2B()
		}

		// Update level, preserving difficulty start level.
		state.level = Math.min(
			MAX_LEVEL,
			DIFFICULTY_CONFIGS[state.difficulty].startLevel + Math.floor(state.lines / LINES_PER_LEVEL),
		)
	} else {
		// No lines cleared - reset combo (but T-Spin 0 doesn't break B2B)
		if (!clearType.includes("tspin-0")) {
			state.combo = -1
		}
	}

	emitEvent(state, {
		type: "lock",
		clearType,
		linesCleared,
		isBackToBack,
	})

	// Check top-out
	if (checkTopOut(state.board)) {
		state.isGameOver = true
		emitEvent(state, { type: "topOut" })
	}

	// Spawn next piece
	state.currentPiece = null
}

// Game tick (called every frame)
export function gameTick(state: GameState, dt: number): void {
	if (state.isPaused || state.isGameOver) return

	// Clear expired animations
	const now = Date.now()
	state.animations = state.animations.filter((a) => now - a.startTime < a.duration)

	// Spawn piece if needed
	if (!state.currentPiece) {
		spawnPiece(state)
		if (state.isGameOver) return
	}

	// Apply gravity
	const gravityFrames = getEffectiveGravity(state.level, state.difficulty)
	const gravityMs = gravityFrames * FRAME_TIME
	state.lockDelay += dt

	// Natural gravity drop
	state.gravityAccumulator += dt

	while (state.gravityAccumulator >= gravityMs) {
		state.gravityAccumulator -= gravityMs
		if (state.currentPiece) {
			if (!movePieceDown(state.board, state.currentPiece)) {
				break
			}
		}
	}

	// Check lock delay
	if (state.currentPiece && isPieceTouching(state.board, state.currentPiece)) {
		if (state.lockDelay >= LOCK_DELAY) {
			lockCurrentPiece(state)
		}
	}
}

// Handle input action
export function handleInput(state: GameState, action: InputAction): void {
	if (state.isGameOver) return

	switch (action) {
		case "left":
			moveLeft(state)
			break
		case "right":
			moveRight(state)
			break
		case "softDrop":
			softDrop(state)
			break
		case "hardDrop":
			hardDrop(state)
			break
		case "rotateCW":
			rotateCW(state)
			break
		case "rotateCCW":
			rotateCCW(state)
			break
		case "hold":
			holdPiece(state)
			break
		case "pause":
			state.isPaused = !state.isPaused
			break
		case "quit":
			state.isGameOver = true
			break
	}
}

// Get ghost position for rendering
export function getGhost(state: GameState): { row: number; col: number } | null {
	if (!state.currentPiece) return null
	return getGhostPosition(state.board, state.currentPiece)
}

// Reset gravity accumulator (for new game)
export function resetGravityAccumulator(): void {
	nextAnimationId = 1
	nextEventId = 1
}
