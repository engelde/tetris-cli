import { Box, Text } from "ink"
import { EVENT_COLORS, HUD_COLORS } from "../config/colors.js"
import { formatScore } from "../game/scoring.js"
import type { GameState } from "../utils/types.js"

interface HUDProps {
	state: GameState
}

export function HUD({ state }: HUDProps) {
	const { score, level, lines, combo, lastClearWasDifficult, garbageQueue } = state
	const hasEvents = combo > 0 || lastClearWasDifficult || garbageQueue > 0
	const progress = Math.min(10, lines % 10)
	const progressCells = Math.min(progress, 6)
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
				<Text>{HUD_COLORS.label("STATS")}</Text>
			</Box>

			<Box flexDirection="column">
				<Text>
					{HUD_COLORS.label("SC ")}
					{HUD_COLORS.score(formatScore(score).padStart(7))}
				</Text>
				<Text>
					{HUD_COLORS.label("LV ")}
					{HUD_COLORS.level(level.toString().padStart(7))}
				</Text>
				<Text>
					{HUD_COLORS.label("LN ")}
					{HUD_COLORS.lines(lines.toString().padStart(7))}
				</Text>
				<Text>
					{HUD_COLORS.label(`[${"=".repeat(progressCells)}${" ".repeat(6 - progressCells)}]`)}
				</Text>
			</Box>

			{eventText && <Text>{eventColor(eventText)}</Text>}
		</Box>
	)
}
