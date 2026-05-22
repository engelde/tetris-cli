import { render, useApp, useInput } from "ink"
import { useEffect, useState } from "react"
import { playGameOver as playGameOverSound, playPause, setSoundEnabled } from "../audio/sound.js"
import { DualGame } from "../components/DualGame.js"
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

export interface VsPlayerAppProps {
	difficulty: Difficulty
	soundEnabled: boolean
	onExit?: (reason: ExitReason) => void
}

export function VsPlayerApp({ difficulty, soundEnabled, onExit }: VsPlayerAppProps) {
	const { exit } = useApp()

	const [round, setRound] = useState<VersusRound>(() => {
		setSoundEnabled(soundEnabled)
		return createVersusRound("2p", difficulty)
	})
	const { player1State: state1, player2State: state2 } = round
	const [_forceUpdate1, setForceUpdate1] = useState(0)
	const [_forceUpdate2, setForceUpdate2] = useState(0)
	const [matchWins, setMatchWins] = useState<MatchWins>({ player1: 0, player2: 0 })
	const [winner, setWinner] = useState<RoundWinner | null>(null)
	const [showWinner, setShowWinner] = useState(false)
	const [pauseOption, setPauseOption] = useState(0)

	const refreshBoth = () => {
		setForceUpdate1((prev) => prev + 1)
		setForceUpdate2((prev) => prev + 1)
	}

	const startNextRound = () => {
		setWinner(null)
		setShowWinner(false)
		setPauseOption(0)
		setRound(createVersusRound("2p", difficulty))
	}

	// Game loops for both players
	useGameLoop({
		state: state1,
		onUpdate: () => {
			processBothVersusEvents(state1, state2)
			setForceUpdate1((prev) => prev + 1)
		},
		fps: 60,
	})

	useGameLoop({
		state: state2,
		onUpdate: () => {
			processBothVersusEvents(state1, state2)
			setForceUpdate2((prev) => prev + 1)
		},
		fps: 60,
	})

	// Handle input
	useInput((input, key) => {
		// Quit on Ctrl+C or Q
		if (isCtrlC(input, key)) {
			markVersusGameOver(state1, state2)
			if (onExit) onExit("quit")
			else exit()
			return
		}

		if (state1.isGameOver || state2.isGameOver) {
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
			markVersusGameOver(state1, state2)
			if (onExit) onExit("quit")
			else exit()
			return
		}

		// Pause (affects both players)
		if (isPauseKey(input, key)) {
			setVersusPaused(state1, state2, !state1.isPaused)
			setPauseOption(0)
			playPause()
			refreshBoth()
			return
		}

		if (state1.isPaused || state2.isPaused) {
			const navigation = getPauseNavigation(input, key)
			if (navigation === "up" || navigation === "down") {
				setPauseOption((prev) => movePauseSelection(prev, navigation))
				refreshBoth()
				return
			}
			if (navigation === "select") {
				const action = getPauseMenuAction(pauseOption)
				if (action === "resume") {
					setVersusPaused(state1, state2, false)
					playPause()
				} else if (action === "menu") {
					markVersusGameOver(state1, state2)
					if (onExit) onExit("menu")
					else exit()
				} else {
					markVersusGameOver(state1, state2)
					if (onExit) onExit("quit")
					else exit()
				}
				refreshBoth()
				return
			}
			if (isMenuKey(input)) {
				markVersusGameOver(state1, state2)
				if (onExit) onExit("menu")
				else exit()
			}
			return
		}

		// Map Ink keys to game actions for both players
		const keyName = getGameKeyName(input, key)

		if (keyName) {
			// Player 1 controls (WASD, J/K, H/C, Z/X) — no arrow keys, no space in 2P
			const action1 = getInputAction(keyName, 1, "versus")
			if (action1 && !state1.isGameOver) {
				handleInput(state1, action1)
				processBothVersusEvents(state1, state2)
				setForceUpdate1((prev) => prev + 1)
			}

			// Player 2 controls (Arrow keys, comma/period, slash/greater, semicolon/L, space)
			const action2 = getInputAction(keyName, 2)
			if (action2 && !state2.isGameOver) {
				handleInput(state2, action2)
				processBothVersusEvents(state1, state2)
				setForceUpdate2((prev) => prev + 1)
			}
		}
	})

	// Check for winner
	useEffect(() => {
		const roundWinner = getRoundWinner(state1, state2)
		if (roundWinner && !showWinner) {
			// Stop both games so pieces stop falling
			markVersusGameOver(state1, state2)
			playGameOverSound()
			setMatchWins((current) => addRoundWin(current, roundWinner))
			setWinner(roundWinner)
			setShowWinner(true)
		}
	}, [state1.isGameOver, state2.isGameOver, state1, state2, showWinner])

	return (
		<DualGame
			player1State={state1}
			player2State={state2}
			player1Label="PLAYER 1"
			player2Label="PLAYER 2"
			showWinner={showWinner}
			winner={winner}
			matchWins={matchWins}
			pauseSelectedIndex={pauseOption}
		/>
	)
}

// Run 2-player mode
export async function runVsPlayer(
	difficulty: Difficulty,
	soundEnabled: boolean,
): Promise<ExitReason> {
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
