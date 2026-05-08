import { render, useApp, useInput } from "ink"
import { useEffect, useState } from "react"
import { playGameOver as playGameOverSound, playPause, setSoundEnabled } from "../audio/sound.js"
import { DualGame } from "../components/DualGame.js"
import {
	createGameState,
	handleInput,
	resetGravityAccumulator,
	spawnPiece,
} from "../game/engine.js"
import { checkWinCondition, processVersusEvents } from "../game/multiplayer.js"
import { useGameLoop } from "../hooks/useGameLoop.js"
import { getInputAction } from "../input/controls.js"
import type { Difficulty, GameState } from "../utils/types.js"

export interface VsPlayerAppProps {
	difficulty: Difficulty
	soundEnabled: boolean
	onExit?: (reason: "quit" | "restart" | "menu") => void
}

export function VsPlayerApp({ difficulty, soundEnabled, onExit }: VsPlayerAppProps) {
	const { exit } = useApp()
	const [state1, _setState1] = useState<GameState>(() => {
		setSoundEnabled(soundEnabled)
		resetGravityAccumulator()
		const s = createGameState("2p", difficulty)
		s.garbageQueue = 0
		s.garbageSent = 0
		spawnPiece(s)
		return s
	})

	const [state2, _setState2] = useState<GameState>(() => {
		const s = createGameState("2p", difficulty)
		s.garbageQueue = 0
		s.garbageSent = 0
		spawnPiece(s)
		return s
	})

	const [_forceUpdate1, setForceUpdate1] = useState(0)
	const [_forceUpdate2, setForceUpdate2] = useState(0)
	const [winner, setWinner] = useState<"player1" | "player2" | null>(null)
	const [showWinner, setShowWinner] = useState(false)

	// Game loops for both players
	useGameLoop({
		state: state1,
		onUpdate: () => {
			processVersusEvents(state1, state2)
			processVersusEvents(state2, state1)
			setForceUpdate1((prev) => prev + 1)
		},
		fps: 60,
	})

	useGameLoop({
		state: state2,
		onUpdate: () => {
			processVersusEvents(state1, state2)
			processVersusEvents(state2, state1)
			setForceUpdate2((prev) => prev + 1)
		},
		fps: 60,
	})

	// Handle input
	useInput((input, key) => {
		// Quit on Ctrl+C or Q
		if (key.ctrl && input === "c") {
			state1.isGameOver = true
			state2.isGameOver = true
			if (onExit) onExit("quit")
			else exit()
			return
		}

		if (state1.isGameOver || state2.isGameOver) {
			if (input === "q" || input === "Q" || key.escape) {
				if (onExit) onExit("quit")
				else exit()
			} else if (input === "r" || input === "R") {
				if (onExit) onExit("restart")
			} else if (input === "m" || input === "M") {
				if (onExit) onExit("menu")
			}
			return
		}

		if (input === "q" || input === "Q") {
			state1.isGameOver = true
			state2.isGameOver = true
			if (onExit) onExit("quit")
			else exit()
			return
		}

		// Pause (affects both players)
		if (input === "p" || input === "P") {
			state1.isPaused = !state1.isPaused
			state2.isPaused = state1.isPaused
			playPause()
			setForceUpdate1((prev) => prev + 1)
			setForceUpdate2((prev) => prev + 1)
			return
		}

		if (state1.isPaused || state2.isPaused) return

		// Map Ink keys to game actions for both players
		let keyName: string | null = null

		if (key.leftArrow) keyName = "LEFT"
		else if (key.rightArrow) keyName = "RIGHT"
		else if (key.upArrow) keyName = "UP"
		else if (key.downArrow) keyName = "DOWN"
		else if (input === " ") keyName = "SPACE"
		else keyName = input.toUpperCase()

		if (keyName) {
			// Player 1 controls (WASD, J/K, H)
			const action1 = getInputAction(keyName, 1)
			if (action1 && !state1.isGameOver) {
				handleInput(state1, action1)
				processVersusEvents(state1, state2)
				setForceUpdate1((prev) => prev + 1)
			}

			// Player 2 controls (Arrow keys, N/M, Y)
			const action2 = getInputAction(keyName, 2)
			if (action2 && !state2.isGameOver) {
				handleInput(state2, action2)
				processVersusEvents(state2, state1)
				setForceUpdate2((prev) => prev + 1)
			}
		}
	})

	// Check for winner
	useEffect(() => {
		const result = checkWinCondition(state1, state2)
		if (result) {
			playGameOverSound()
			setWinner(result === 1 ? "player1" : "player2")
			setShowWinner(true)
		}
	}, [state1.isGameOver, state2.isGameOver, state1, state2])

	return (
		<DualGame
			player1State={state1}
			player2State={state2}
			player1Label="PLAYER 1"
			player2Label="PLAYER 2"
			showWinner={showWinner}
			winner={winner}
		/>
	)
}

// Run 2-player mode
export async function runVsPlayer(
	difficulty: Difficulty,
	soundEnabled: boolean,
): Promise<"quit" | "restart" | "menu"> {
	return new Promise((resolve) => {
		const { unmount } = render(
			<VsPlayerApp
				difficulty={difficulty}
				soundEnabled={soundEnabled}
				onExit={(reason) => {
					unmount()
					resolve(reason)
				}}
			/>,
		)
	})
}
