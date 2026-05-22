import { render, useApp, useInput } from "ink"
import { useEffect, useRef, useState } from "react"
import { playGameOver as playGameOverSound, playPause, setSoundEnabled } from "../audio/sound.js"
import { DualGame } from "../components/DualGame.js"
import { CPU_DIFFICULTY_CONFIGS } from "../config/settings.js"
import { decideCPUMove } from "../game/ai.js"
import { handleInput } from "../game/engine.js"
import { useGameLoop } from "../hooks/useGameLoop.js"
import { getInputAction } from "../input/controls.js"
import type { Difficulty } from "../utils/types.js"
import {
	getGameKeyName,
	getPauseNavigation,
	isCtrlC,
	isMenuKey,
	isPauseKey,
	isQuitKey,
	isRestartKey,
} from "./modeInput.js"
import {
	addRoundWin,
	type ExitReason,
	getPauseMenuAction,
	getRoundWinner,
	markVersusGameOver,
	movePauseSelection,
	processBothVersusEvents,
	setVersusPaused,
} from "./versusFlow.js"
import {
	createVersusRound,
	type MatchWins,
	type RoundWinner,
	type VersusRound,
} from "./versusRound.js"

export interface VsCpuAppProps {
	difficulty: Difficulty
	soundEnabled: boolean
	onExit?: (reason: ExitReason) => void
}

export function VsCpuApp({ difficulty, soundEnabled, onExit }: VsCpuAppProps) {
	const { exit } = useApp()

	const [round, setRound] = useState<VersusRound>(() => {
		setSoundEnabled(soundEnabled)
		return createVersusRound("cpu", difficulty)
	})
	const { player1State: playerState, player2State: cpuState } = round
	const [_forceUpdatePlayer, setForceUpdatePlayer] = useState(0)
	const [_forceUpdateCpu, setForceUpdateCpu] = useState(0)
	const [matchWins, setMatchWins] = useState<MatchWins>({ player1: 0, player2: 0 })
	const [winner, setWinner] = useState<RoundWinner | null>(null)
	const [showWinner, setShowWinner] = useState(false)
	const [pauseOption, setPauseOption] = useState(0)

	const cpuConfig = CPU_DIFFICULTY_CONFIGS[difficulty]
	const cpuThinkInterval = useRef(0)

	const refreshBoth = () => {
		setForceUpdatePlayer((prev) => prev + 1)
		setForceUpdateCpu((prev) => prev + 1)
	}

	const startNextRound = () => {
		cpuThinkInterval.current = 0
		setWinner(null)
		setShowWinner(false)
		setPauseOption(0)
		setRound(createVersusRound("cpu", difficulty))
	}

	// Player game loop
	useGameLoop({
		state: playerState,
		onUpdate: () => {
			processBothVersusEvents(playerState, cpuState)
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
					}
				}
			}

			processBothVersusEvents(playerState, cpuState)
			setForceUpdateCpu((prev) => prev + 1)
		},
		fps: 60,
	})

	// Handle input (player only)
	useInput((input, key) => {
		// Quit on Ctrl+C or Q
		if (isCtrlC(input, key)) {
			markVersusGameOver(playerState, cpuState)
			if (onExit) onExit("quit")
			else exit()
			return
		}

		if (playerState.isGameOver || cpuState.isGameOver) {
			if (isQuitKey(input) || key.escape) {
				if (onExit) onExit("quit")
				else exit()
			} else if (isRestartKey(input)) {
				startNextRound()
			} else if (isMenuKey(input)) {
				if (onExit) onExit("menu")
			}
			return
		}

		if (isQuitKey(input)) {
			markVersusGameOver(playerState, cpuState)
			if (onExit) onExit("quit")
			else exit()
			return
		}

		// Pause (affects both)
		if (isPauseKey(input, key)) {
			setVersusPaused(playerState, cpuState, !playerState.isPaused)
			setPauseOption(0)
			playPause()
			refreshBoth()
			return
		}

		if (playerState.isPaused) {
			const navigation = getPauseNavigation(input, key)
			if (navigation === "up" || navigation === "down") {
				setPauseOption((prev) => movePauseSelection(prev, navigation))
				refreshBoth()
				return
			}
			if (navigation === "select") {
				const action = getPauseMenuAction(pauseOption)
				if (action === "resume") {
					setVersusPaused(playerState, cpuState, false)
					playPause()
				} else if (action === "menu") {
					markVersusGameOver(playerState, cpuState)
					if (onExit) onExit("menu")
					else exit()
				} else {
					markVersusGameOver(playerState, cpuState)
					if (onExit) onExit("quit")
					else exit()
				}
				refreshBoth()
				return
			}
			if (isMenuKey(input)) {
				markVersusGameOver(playerState, cpuState)
				if (onExit) onExit("menu")
				else exit()
			}
			return
		}

		// Map Ink keys to game actions
		const keyName = getGameKeyName(input, key)

		if (keyName) {
			const action = getInputAction(keyName, 1)
			if (action && !playerState.isGameOver) {
				handleInput(playerState, action)
				processBothVersusEvents(playerState, cpuState)
				setForceUpdatePlayer((prev) => prev + 1)
			}
		}
	})

	// Check for winner
	useEffect(() => {
		const roundWinner = getRoundWinner(playerState, cpuState)
		if (roundWinner && !showWinner) {
			// Stop both games so pieces stop falling
			markVersusGameOver(playerState, cpuState)
			playGameOverSound()
			setMatchWins((current) => addRoundWin(current, roundWinner))
			setWinner(roundWinner)
			setShowWinner(true)
		}
	}, [playerState.isGameOver, cpuState.isGameOver, cpuState, playerState, showWinner])

	return (
		<DualGame
			player1State={playerState}
			player2State={cpuState}
			player1Label="PLAYER"
			player2Label="CPU"
			showWinner={showWinner}
			winner={winner}
			matchWins={matchWins}
			pauseSelectedIndex={pauseOption}
		/>
	)
}
export async function runVsCpu(difficulty: Difficulty, soundEnabled: boolean): Promise<ExitReason> {
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
