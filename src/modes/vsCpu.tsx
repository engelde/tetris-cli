import { render, useApp, useInput } from "ink"
import { useEffect, useRef, useState } from "react"
import { playGameOver as playGameOverSound, playPause, setSoundEnabled } from "../audio/sound.js"
import { DualGame } from "../components/DualGame.js"
import { CPU_DIFFICULTY_CONFIGS } from "../config/settings.js"
import { decideCPUMove } from "../game/ai.js"
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

export interface VsCpuAppProps {
	difficulty: Difficulty
	soundEnabled: boolean
	onExit?: (reason: "quit" | "restart" | "menu") => void
}

export function VsCpuApp({ difficulty, soundEnabled, onExit }: VsCpuAppProps) {
	const { exit } = useApp()
	const [playerState, _setPlayerState] = useState<GameState>(() => {
		setSoundEnabled(soundEnabled)
		resetGravityAccumulator()
		const s = createGameState("cpu", difficulty)
		s.garbageQueue = 0
		s.garbageSent = 0
		spawnPiece(s)
		return s
	})

	const [cpuState, _setCpuState] = useState<GameState>(() => {
		const s = createGameState("cpu", difficulty)
		s.garbageQueue = 0
		s.garbageSent = 0
		spawnPiece(s)
		return s
	})

	const [_forceUpdatePlayer, setForceUpdatePlayer] = useState(0)
	const [_forceUpdateCpu, setForceUpdateCpu] = useState(0)
	const [winner, setWinner] = useState<"player1" | "player2" | null>(null)
	const [showWinner, setShowWinner] = useState(false)

	const cpuConfig = CPU_DIFFICULTY_CONFIGS[difficulty]
	const cpuThinkInterval = useRef(0)

	// Player game loop
	useGameLoop({
		state: playerState,
		onUpdate: () => {
			processVersusEvents(playerState, cpuState)
			processVersusEvents(cpuState, playerState)
			setForceUpdatePlayer((prev) => prev + 1)
		},
		fps: 60,
	})

	// CPU game loop
	useGameLoop({
		state: cpuState,
		onUpdate: () => {
			// CPU AI logic
			if (!cpuState.isPaused && !cpuState.isGameOver && cpuState.currentPiece) {
				cpuThinkInterval.current += 16 // Assuming 60 FPS

				if (cpuThinkInterval.current >= cpuConfig.placementSpeed) {
					cpuThinkInterval.current = 0
					const move = decideCPUMove(cpuState, cpuConfig)
					if (move) {
						handleInput(cpuState, move)
						processVersusEvents(cpuState, playerState)
					}
				}
			}

			processVersusEvents(playerState, cpuState)
			processVersusEvents(cpuState, playerState)
			setForceUpdateCpu((prev) => prev + 1)
		},
		fps: 60,
	})

	// Handle input (player only)
	useInput((input, key) => {
		// Quit on Ctrl+C or Q
		if (key.ctrl && input === "c") {
			playerState.isGameOver = true
			cpuState.isGameOver = true
			if (onExit) onExit("quit")
			else exit()
			return
		}

		if (playerState.isGameOver || cpuState.isGameOver) {
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
			playerState.isGameOver = true
			cpuState.isGameOver = true
			if (onExit) onExit("quit")
			else exit()
			return
		}

		// Pause (affects both)
		if (input === "p" || input === "P") {
			playerState.isPaused = !playerState.isPaused
			cpuState.isPaused = playerState.isPaused
			playPause()
			setForceUpdatePlayer((prev) => prev + 1)
			setForceUpdateCpu((prev) => prev + 1)
			return
		}

		if (playerState.isPaused) return

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
			if (action && !playerState.isGameOver) {
				handleInput(playerState, action)
				processVersusEvents(playerState, cpuState)
				setForceUpdatePlayer((prev) => prev + 1)
			}
		}
	})

	// Check for winner
	useEffect(() => {
		const result = checkWinCondition(playerState, cpuState)
		if (result) {
			playGameOverSound()
			setWinner(result === 1 ? "player1" : "player2")
			setShowWinner(true)
		}
	}, [playerState.isGameOver, cpuState.isGameOver, cpuState, playerState])

	return (
		<DualGame
			player1State={playerState}
			player2State={cpuState}
			player1Label="PLAYER"
			player2Label="CPU"
			controlsHint="A/D move | K/Z J/X rotate | H/C hold | P pause | Q quit"
			showWinner={showWinner}
			winner={winner}
		/>
	)
}
export async function runVsCpu(
	difficulty: Difficulty,
	soundEnabled: boolean,
): Promise<"quit" | "restart" | "menu"> {
	return new Promise((resolve) => {
		const { unmount } = render(
			<VsCpuApp
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
