import { playGarbageSent } from "../audio/sound.js"
import { drainGameEvents } from "../game/engine.js"
import { addGarbageRows, generateGarbageRows } from "../game/garbage.js"
import { getGarbageSent } from "../game/scoring.js"
import type { ClearType, GameState } from "../utils/types.js"
import { checkTopOut } from "./board.js"

export interface GarbageResolution {
	attack: number
	canceled: number
	sent: number
}

export function queueGarbage(state: GameState, garbageCount: number): void {
	if (garbageCount <= 0) return
	state.garbageQueue += garbageCount
}

export function applyPendingGarbage(state: GameState): number {
	if (state.garbageQueue <= 0) return 0

	const rowsToApply = state.garbageQueue
	const result = addGarbageRows(state.board, generateGarbageRows(rowsToApply))
	state.board = result.board
	state.garbageQueue = result.remaining.length

	if (checkTopOut(state.board)) {
		state.isGameOver = true
	}

	return rowsToApply - result.remaining.length
}

export function resolveGarbageAttack(
	state: GameState,
	clearType: ClearType,
	isBackToBack: boolean,
): GarbageResolution {
	const attack = getGarbageSent(clearType, isBackToBack)
	const canceled = Math.min(attack, state.garbageQueue)
	state.garbageQueue -= canceled
	const sent = attack - canceled

	if (sent > 0) {
		state.garbageSent += sent
		playGarbageSent()
	}

	return { attack, canceled, sent }
}

export function processVersusEvents(source: GameState, opponent: GameState): void {
	for (const event of drainGameEvents(source)) {
		if (event.type !== "lock") continue

		if (event.linesCleared > 0) {
			const resolution = resolveGarbageAttack(source, event.clearType, event.isBackToBack)
			queueGarbage(opponent, resolution.sent)
		} else {
			applyPendingGarbage(source)
		}
	}
}

// Receive garbage from opponent
export function receiveGarbage(state: GameState, garbageCount: number): void {
	queueGarbage(state, garbageCount)
}

// Check win condition for 2P mode
// Returns: 1 if P1 wins, 2 if P2 wins, 0 if no winner yet
export function checkWinCondition(state1: GameState, state2: GameState): 0 | 1 | 2 {
	if (state1.isGameOver && !state2.isGameOver) return 2
	if (state2.isGameOver && !state1.isGameOver) return 1
	if (state1.isGameOver && state2.isGameOver) return 0 // Draw
	return 0 // No winner yet
}
