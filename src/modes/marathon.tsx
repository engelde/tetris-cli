import { render, useApp, useInput } from "ink"
import { useEffect, useRef, useState } from "react"
import { playGameOver as playGameOverSound, playPause, setSoundEnabled } from "../audio/sound.js"
import { Game } from "../components/Game.js"
import {
	createGameState,
	handleInput,
	resetGravityAccumulator,
	spawnPiece,
} from "../game/engine.js"
import { recordMarathonHighScore } from "../game/highScores.js"
import { useGameLoop } from "../hooks/useGameLoop.js"
import { getInputAction } from "../input/controls.js"
import type { Difficulty, GameState } from "../utils/types.js"

export interface MarathonAppProps {
	difficulty: Difficulty
	soundEnabled: boolean
	onExit?: (reason: "quit" | "restart" | "menu") => void
}

export function MarathonApp({ difficulty, soundEnabled, onExit }: MarathonAppProps) {
	const { exit } = useApp()
	const didExit = useRef(false)
	const [state, _setState] = useState<GameState>(() => {
		setSoundEnabled(soundEnabled)
		resetGravityAccumulator()
		const initialState = createGameState("marathon", difficulty)
		spawnPiece(initialState)
		return initialState
	})

	const [isHighScore, setIsHighScore] = useState(false)
	const [_forceUpdate, setForceUpdate] = useState(0)
	const [pauseOption, setPauseOption] = useState(0)

	const finish = (reason: "quit" | "restart" | "menu") => {
		if (didExit.current) return
		didExit.current = true
		if (onExit) {
			onExit(reason)
		} else {
			exit()
		}
	}

	// Game loop
	useGameLoop({
		state,
		onUpdate: () => {
			setForceUpdate((prev) => prev + 1)
		},
		fps: 60,
	})

	// Handle input
	useInput((input, key) => {
		// Quit on Ctrl+C or Q
		if (key.ctrl && input === "c") {
			state.isGameOver = true
			finish("quit")
			return
		}

		if (state.isGameOver) {
			if (input === "q" || input === "Q" || key.escape) {
				finish("quit")
			} else if (input === "r" || input === "R") {
				finish("restart")
			} else if (input === "m" || input === "M") {
				finish("menu")
			}
			return
		}

		if (input === "q" || input === "Q") {
			finish("quit")
			return
		}

		// Pause
		if (input === "p" || input === "P" || key.escape) {
			state.isPaused = !state.isPaused
			setPauseOption(0)
			playPause()
			setForceUpdate((prev) => prev + 1)
			return
		}

		if (state.isPaused) {
			if (key.upArrow || input === "w" || input === "W") {
				setPauseOption((prev) => Math.max(0, prev - 1))
				setForceUpdate((prev) => prev + 1)
				return
			}
			if (key.downArrow || input === "s" || input === "S") {
				setPauseOption((prev) => Math.min(2, prev + 1))
				setForceUpdate((prev) => prev + 1)
				return
			}
			if (key.return) {
				if (pauseOption === 0) {
					state.isPaused = false
					playPause()
				} else if (pauseOption === 1) {
					finish("menu")
				} else if (pauseOption === 2) {
					finish("quit")
				}
				setForceUpdate((prev) => prev + 1)
				return
			}
			if (input === "m" || input === "M") {
				finish("menu")
			}
			return
		}

		// Map Ink keys to game actions
		let keyName: string | null = null

		if (key.leftArrow) keyName = "LEFT"
		else if (key.rightArrow) keyName = "RIGHT"
		else if (key.upArrow) keyName = "UP"
		else if (key.downArrow) keyName = "DOWN"
		else if (input === " ") keyName = "SPACE"
		else keyName = input.toUpperCase()

		if (keyName) {
			const action = getInputAction(keyName, 1)
			if (action) {
				handleInput(state, action)
				setForceUpdate((prev) => prev + 1)
			}
		}
	})

	// Check for high score when game ends
	useEffect(() => {
		if (state.isGameOver) {
			playGameOverSound()
			setIsHighScore(recordMarathonHighScore(state))
		}
	}, [state.isGameOver, state])

	return <Game state={state} isHighScore={isHighScore} pauseSelectedIndex={pauseOption} />
}

// Run marathon mode
export async function runMarathon(
	difficulty: Difficulty,
	soundEnabled: boolean,
): Promise<"quit" | "restart" | "menu"> {
	return new Promise((resolve) => {
		const { unmount } = render(
			<MarathonApp
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
