import { Box, Text } from "ink"
import { EVENT_COLORS, HUD_COLORS } from "../config/colors.js"
import { formatCompactNumber } from "../game/scoring.js"
import { LINES_PER_LEVEL } from "../utils/constants.js"
import type { GameState } from "../utils/types.js"

interface HUDProps {
	state: GameState
}

export function HUD({ state }: HUDProps) {
	const { score, level, lines, combo, lastClearWasDifficult, garbageQueue } = state
	const hasEvents = combo > 0 || lastClearWasDifficult || garbageQueue > 0
	const levelProgress = `${lines % LINES_PER_LEVEL}/${LINES_PER_LEVEL}`
	let eventText: string | null = null
	let eventColor = EVENT_COLORS.combo

	if (garbageQueue > 0) {
		eventText = `GARB ${garbageQueue}`
		eventColor = EVENT_COLORS.b2b
	} else if (combo > 0 && lastClearWasDifficult) {
		eventText = `C${combo} B2B`
		eventColor = EVENT_COLORS.b2b
	} else if (combo > 0) {
		eventText = `COMBO ${combo}x`
		eventColor = EVENT_COLORS.combo
	} else if (lastClearWasDifficult) {
		eventText = "B2B"
		eventColor = EVENT_COLORS.b2b
	}

	return (
		<Box
			flexDirection="column"
			paddingX={1}
			borderStyle="double"
			borderColor={garbageQueue > 0 ? "red" : "cyan"}
			height={hasEvents ? 8 : 7}
		>
			<Box>
				<Text>{HUD_COLORS.label("GAME STATS")}</Text>
			</Box>

			<Box flexDirection="column">
				<Text>
					{HUD_COLORS.label("Score ")}
					{HUD_COLORS.score(formatCompactNumber(score))}
				</Text>
				<Text>
					{HUD_COLORS.label("Level ")}
					{HUD_COLORS.level(formatCompactNumber(level))}
				</Text>
				<Text>
					{HUD_COLORS.label("Lines ")}
					{HUD_COLORS.lines(formatCompactNumber(lines))}
				</Text>
				<Text>
					{HUD_COLORS.label("Next ")}
					{HUD_COLORS.lines(levelProgress)}
				</Text>
			</Box>

			{eventText && <Text>{eventColor(eventText)}</Text>}
		</Box>
	)
}
