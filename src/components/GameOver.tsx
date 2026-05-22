import { Box, Text } from "ink"
import { HUD_COLORS, UI_COLORS } from "../config/colors.js"
import { formatCompactNumber } from "../game/scoring.js"
import type { GameState } from "../utils/types.js"

interface GameOverProps {
	state: GameState
	isHighScore?: boolean
}

export function GameOver({ state, isHighScore = false }: GameOverProps) {
	return (
		<Box flexDirection="column" alignItems="center">
			<Box
				flexDirection="column"
				alignItems="center"
				borderStyle="double"
				borderColor="red"
				backgroundColor="black"
				paddingX={4}
				paddingY={0}
			>
				<Text bold color="red">
					GAME OVER
				</Text>
				<Text>{UI_COLORS.muted("Final board locked")}</Text>

				{/* High score celebration */}
				{isHighScore && (
					<Box flexDirection="column" alignItems="center">
						<Text bold color="yellow">
							NEW HIGH SCORE
						</Text>
						<Text color="yellow">★ ★ ★ ★ ★</Text>
					</Box>
				)}

				{/* Stats box */}
				<Box marginY={1} paddingX={2} flexDirection="column">
					<Box>
						<Text>
							<Text color="yellow">★</Text> {HUD_COLORS.label("Score: ")}
							{HUD_COLORS.score(formatCompactNumber(state.score))}
						</Text>
					</Box>
					<Box>
						<Text>
							<Text color="green">▶</Text> {HUD_COLORS.label("Level: ")}
							{HUD_COLORS.level(formatCompactNumber(state.level))}
						</Text>
					</Box>
					<Box>
						<Text>
							<Text color="cyan">◆</Text> {HUD_COLORS.label("Lines: ")}
							{HUD_COLORS.lines(formatCompactNumber(state.lines))}
						</Text>
					</Box>
				</Box>

				{/* Instructions */}
				<Box flexDirection="column" alignItems="center">
					<Text>
						{UI_COLORS.dim("Press ")}
						<Text color="yellow">[R]</Text>
						{UI_COLORS.dim(" to restart")}
					</Text>
					<Text>
						{UI_COLORS.dim("Press ")}
						<Text color="yellow">[M]</Text>
						{UI_COLORS.dim(" for menu")}
					</Text>
					<Text>
						{UI_COLORS.dim("Press ")}
						<Text color="yellow">[Q]</Text>
						{UI_COLORS.dim(" to quit")}
					</Text>
				</Box>
			</Box>
		</Box>
	)
}
