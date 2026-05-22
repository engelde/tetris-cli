import { createGameState, resetGravityAccumulator, spawnPiece } from "../game/engine.js"
import { createRandomizerState, nextPieceFromRandomizer } from "../game/randomizer.js"
import type { Difficulty, GameMode, GameState, PieceType } from "../utils/types.js"

export interface MatchWins {
	player1: number
	player2: number
}

export interface VersusRound {
	player1State: GameState
	player2State: GameState
}

export type RoundWinner = "player1" | "player2"

export function createVersusRound(
	mode: Extract<GameMode, "cpu" | "2p">,
	difficulty: Difficulty,
): VersusRound {
	resetGravityAccumulator()

	const sharedRandomizer = createRandomizerState()
	const sharedQueue: PieceType[] = []
	for (let i = 0; i < 10000; i++) {
		sharedQueue.push(nextPieceFromRandomizer(sharedRandomizer))
	}

	const player1State = createGameState(mode, difficulty)
	player1State.garbageQueue = 0
	player1State.garbageSent = 0
	player1State.nextQueue = sharedQueue.slice()
	player1State.randomizer = sharedRandomizer
	spawnPiece(player1State)

	const player2State = createGameState(mode, difficulty)
	player2State.garbageQueue = 0
	player2State.garbageSent = 0
	player2State.nextQueue = sharedQueue.slice()
	player2State.randomizer = sharedRandomizer
	spawnPiece(player2State)

	return { player1State, player2State }
}

export function recordRoundWin(wins: MatchWins, winner: RoundWinner): MatchWins {
	return {
		player1: wins.player1 + (winner === "player1" ? 1 : 0),
		player2: wins.player2 + (winner === "player2" ? 1 : 0),
	}
}
