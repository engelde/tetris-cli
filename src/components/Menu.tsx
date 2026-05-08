import { Box, Text, useApp, useInput } from "ink"
import { useState } from "react"
import { HUD_COLORS, UI_COLORS } from "../config/colors.js"
import type { Difficulty } from "../utils/types.js"

interface MenuChoice {
	mode: "marathon" | "cpu" | "2p"
	difficulty: Difficulty
	sound: boolean
}

interface MenuProps {
	onSelect: (choice: MenuChoice) => void
	onQuit?: () => void
	bestScore?: number
}

export function Menu({ onSelect, onQuit, bestScore = 0 }: MenuProps) {
	const { exit } = useApp()
	const [selectedMode, setSelectedMode] = useState(0)
	const [selectedDifficulty, setSelectedDifficulty] = useState(1) // Normal
	const [soundEnabled, setSoundEnabled] = useState(true)
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
		<Box flexDirection="column" padding={2} alignItems="center">
			<Box marginBottom={2} flexDirection="column" alignItems="center">
				<Text bold color="cyan">
					{`
████████╗███████╗████████╗██████╗ ██╗███████╗
╚══██╔══╝██╔════╝╚══██╔══╝██╔══██╗██║██╔════╝
   ██║   █████╗     ██║   ██████╔╝██║███████╗
   ██║   ██╔══╝     ██║   ██╔══██╗██║╚════██║
   ██║   ███████╗   ██║   ██║  ██║██║███████║
   ╚═╝   ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚══════╝
					`.trim()}
				</Text>
				<Text bold color="yellow">
					C L I E D I T I O N
				</Text>
				<Text color="green">
					{UI_COLORS.dim("Best Marathon: ")}
					{HUD_COLORS.score(bestScore.toString())}
				</Text>
				<Text>{UI_COLORS.muted("Arcade Tetris for the terminal")}</Text>
			</Box>

			<Box
				borderStyle="double"
				borderColor="cyan"
				paddingX={3}
				paddingY={1}
				flexDirection="column"
				width={48}
			>
				{screen === "mode" ? (
					<>
						<Box marginBottom={1} justifyContent="center">
							<Text>{HUD_COLORS.label("SELECT GAME MODE")}</Text>
						</Box>
						<Box flexDirection="column" marginBottom={1}>
							{modes.map((mode, idx) => (
								<Text key={mode.mode} color={selectedMode === idx ? "green" : "white"}>
									{selectedMode === idx ? "▶ " : "  "}
									{mode.label.padEnd(10)}
									{UI_COLORS.dim(mode.description)}
								</Text>
							))}
						</Box>

						<Box marginTop={1} justifyContent="center">
							<Text>
								{UI_COLORS.normal("Sound: ")}
								{soundEnabled ? HUD_COLORS.score("ON") : UI_COLORS.dim("OFF")}
							</Text>
						</Box>
					</>
				) : (
					<>
						<Box marginBottom={1} justifyContent="center">
							<Text>{HUD_COLORS.label("SELECT DIFFICULTY")}</Text>
						</Box>
						<Box flexDirection="column" alignItems="center" marginBottom={1}>
							{difficulties.map((difficulty, idx) => (
								<Text key={difficulty.value} color={selectedDifficulty === idx ? "green" : "white"}>
									{selectedDifficulty === idx ? "▶ " : "  "}
									{difficulty.label}
								</Text>
							))}
						</Box>
					</>
				)}
			</Box>

			<Box
				marginTop={2}
				borderStyle="single"
				borderColor="gray"
				paddingX={3}
				paddingY={1}
				flexDirection="column"
				alignItems="center"
			>
				<Text bold color="white">
					CONTROLS
				</Text>
				{screen === "mode" ? (
					<Box flexDirection="column" alignItems="center" marginTop={1}>
						<Text>{UI_COLORS.dim("↑/↓ or W/S: Navigate")}</Text>
						<Text>{UI_COLORS.dim("Enter/Space: Select")}</Text>
						<Text>{UI_COLORS.dim("T: Toggle Sound")}</Text>
						<Text>{UI_COLORS.dim("Q: Quit")}</Text>
					</Box>
				) : (
					<Box flexDirection="column" alignItems="center" marginTop={1}>
						<Text>{UI_COLORS.dim("↑/↓ or W/S: Navigate")}</Text>
						<Text>{UI_COLORS.dim("Enter/Space: Start Game")}</Text>
						<Text>{UI_COLORS.dim("Esc: Back")}</Text>
					</Box>
				)}
			</Box>
		</Box>
	)
}
