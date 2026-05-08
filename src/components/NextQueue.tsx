import { Box, Text } from "ink"
import { HUD_COLORS } from "../config/colors.js"
import type { PieceType } from "../utils/types.js"
import { renderPiecePreview } from "./PiecePreview.js"

interface NextQueueProps {
	nextQueue: PieceType[]
}

export function NextQueue({ nextQueue }: NextQueueProps) {
	// Show up to 3 pieces
	const displayQueue = nextQueue.slice(0, 3).map((pieceType, index) => ({
		id: `next-${index + 1}`,
		pieceType,
	}))

	return (
		<Box flexDirection="column" paddingX={1} borderStyle="double" borderColor="cyan" height={9}>
			<Box>
				<Text>{HUD_COLORS.label("NEXT")}</Text>
			</Box>

			{displayQueue.map(({ id, pieceType }, pieceIndex) => (
				<Box key={id} flexDirection="column">
					{renderPiecePreview(pieceType).map((line, lineIdx) => (
						<Text key={`${id}-${lineIdx === 0 ? "top" : "bottom"}`} dimColor={pieceIndex > 0}>
							{line}
						</Text>
					))}
				</Box>
			))}
		</Box>
	)
}
