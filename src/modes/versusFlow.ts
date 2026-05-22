import { checkWinCondition, processVersusEvents } from "../game/multiplayer.js"
import type { GameState } from "../utils/types.js"
import { type MatchWins, type RoundWinner, recordRoundWin } from "./versusRound.js"

export type ExitReason = "quit" | "restart" | "menu"
export type PauseMenuAction = "resume" | "menu" | "quit"
export type PauseDirection = "up" | "down"

const PAUSE_ACTIONS: PauseMenuAction[] = ["resume", "menu", "quit"]

export function processBothVersusEvents(player1: GameState, player2: GameState): void {
	processVersusEvents(player1, player2)
	processVersusEvents(player2, player1)
}

export function setVersusPaused(player1: GameState, player2: GameState, paused: boolean): void {
	player1.isPaused = paused
	player2.isPaused = paused
}

export function markVersusGameOver(player1: GameState, player2: GameState): void {
	player1.isGameOver = true
	player2.isGameOver = true
}

export function movePauseSelection(selectedIndex: number, direction: PauseDirection): number {
	const nextIndex = direction === "up" ? selectedIndex - 1 : selectedIndex + 1
	return Math.max(0, Math.min(PAUSE_ACTIONS.length - 1, nextIndex))
}

export function getPauseMenuAction(selectedIndex: number): PauseMenuAction {
	return PAUSE_ACTIONS[selectedIndex] ?? "resume"
}

export function getRoundWinner(player1: GameState, player2: GameState): RoundWinner | null {
	const result = checkWinCondition(player1, player2)
	if (!result) return null
	return result === 1 ? "player1" : "player2"
}

export function addRoundWin(matchWins: MatchWins, winner: RoundWinner): MatchWins {
	return recordRoundWin(matchWins, winner)
}
