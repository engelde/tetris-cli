import { Box, Text, useApp, useInput } from "ink"
import { useState } from "react"
import { HUD_COLORS, UI_COLORS } from "../config/colors.js"
import { useTerminalSize } from "../hooks/useTerminalSize.js"
import type { Difficulty } from "../utils/types.js"
import { TetrisLogo } from "./TetrisLogo.js"

interface MenuChoice {
	mode: "marathon" | "cpu" | "2p"
	difficulty: Difficulty
	sound: boolean
}

interface MenuProps {
	onSelect: (choice: MenuChoice) => void
	onQuit?: () => void
	bestScore?: number
	initialSoundEnabled?: boolean
}

export function Menu({ onSelect, onQuit, bestScore = 0, initialSoundEnabled = true }: MenuProps) {
	const { exit } = useApp()
	const size = useTerminalSize()
	const [selectedMode, setSelectedMode] = useState(0)
	const [selectedDifficulty, setSelectedDifficulty] = useState(1) // Normal
	const [soundEnabled, setSoundEnabled] = useState(initialSoundEnabled)
	const [screen, setScreen] = useState<"mode" | "difficulty">("mode")

	const modes = [
		{ label: "Marathon", mode: "marathon", description: "Classic score chase" },
		{ label: "vs CPU", mode: "cpu", description: "Garbage battle against AI" },
		{ label: "2 Player", mode: "2p", description: "Same-keyboard duel" },
	] as const
	const difficulties: { label: string; value: Difficulty }[] = [
		{ label: "Easy", value: "easy" },
		{ label: "Normal", value: "normal" },
		{ label: "Hard", value: "hard" },
	]

	useInput((input, key) => {
		if (key.ctrl && input === "c") {
			onQuit?.()
			exit()
			return
		}

		if (input === "q" || input === "Q") {
			onQuit?.()
			exit()
			return
		}

		if (screen === "mode") {
			if (key.upArrow || input === "w" || input === "W") {
				setSelectedMode((prev) => Math.max(0, prev - 1))
			} else if (key.downArrow || input === "s" || input === "S") {
				setSelectedMode((prev) => Math.min(modes.length - 1, prev + 1))
			} else if (input === "t" || input === "T") {
				setSoundEnabled((prev) => !prev)
			} else if (key.return || input === " ") {
				// Move to difficulty selection
				setScreen("difficulty")
			}
		} else if (screen === "difficulty") {
			if (key.upArrow || input === "w" || input === "W") {
				setSelectedDifficulty((prev) => Math.max(0, prev - 1))
			} else if (key.downArrow || input === "s" || input === "S") {
				setSelectedDifficulty((prev) => Math.min(difficulties.length - 1, prev + 1))
			} else if (key.return || input === " ") {
				// Start game
				onSelect({
					mode: modes[selectedMode].mode,
					difficulty: difficulties[selectedDifficulty].value,
					sound: soundEnabled,
				})
			} else if (key.escape) {
				// Go back to mode selection
				setScreen("mode")
			}
		}
	})

	return (
		<Box
			width={size.columns || 80}
			height={size.rows || 24}
			flexDirection="column"
			justifyContent="center"
			alignItems="center"
		>
			<Box flexDirection="column" alignItems="center">
				<Box marginBottom={1} flexDirection="column" alignItems="center">
					<TetrisLogo />
					<Text bold color="yellow">
						{"C L I   E D I T I O N"}
					</Text>
					<Text color="green">
						{UI_COLORS.dim("Best Marathon: ")}
						{HUD_COLORS.score(bestScore.toString())}
					</Text>
				</Box>

				<Box borderStyle="double" borderColor="cyan" paddingX={2} flexDirection="column" width={54}>
					{screen === "mode" ? (
						<>
							<Box justifyContent="center">
								<Text>{HUD_COLORS.label("SELECT GAME MODE")}</Text>
							</Box>
							<Box flexDirection="column">
								{modes.map((mode, idx) => (
									<Text key={mode.mode} color={selectedMode === idx ? "green" : "white"}>
										{selectedMode === idx ? "▶ " : "  "}
										{mode.label.padEnd(10)}
										{UI_COLORS.dim(mode.description)}
									</Text>
								))}
							</Box>

							<Box justifyContent="center">
								<Text>
									{UI_COLORS.normal("Sound: ")}
									{soundEnabled ? HUD_COLORS.score("ON") : UI_COLORS.dim("OFF")}
								</Text>
							</Box>
						</>
					) : (
						<>
							<Box justifyContent="center">
								<Text>{HUD_COLORS.label("SELECT DIFFICULTY")}</Text>
							</Box>
							<Box flexDirection="column" alignItems="center">
								{difficulties.map((difficulty, idx) => (
									<Text
										key={difficulty.value}
										color={selectedDifficulty === idx ? "green" : "white"}
									>
										{selectedDifficulty === idx ? "▶ " : "  "}
										{difficulty.label}
									</Text>
								))}
							</Box>
						</>
					)}
				</Box>

				<Box marginTop={1}>
					<Text>
						{screen === "mode"
							? UI_COLORS.dim("↑/↓ W/S Navigate  Enter Select  T Sound  Q Quit")
							: UI_COLORS.dim("↑/↓ W/S Navigate  Enter Start  Esc Back")}
					</Text>
				</Box>
			</Box>
		</Box>
	)
}
