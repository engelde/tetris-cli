import { Box, Text } from "ink"
import { HUD_COLORS, UI_COLORS } from "../config/colors.js"
import type { PieceType } from "../utils/types.js"
import { renderPiecePreview } from "./PiecePreview.js"

interface HoldPieceProps {
	holdPiece: PieceType | null
	canHold: boolean
}

export function HoldPiece({ holdPiece, canHold }: HoldPieceProps) {
	const emptyPreview = ["            ", "            "]
	const preview = (holdPiece ? renderPiecePreview(holdPiece) : emptyPreview).map((line, index) => ({
		id: index === 0 ? "top" : "bottom",
		line,
	}))

	return (
		<Box
			flexDirection="column"
			paddingX={1}
			borderStyle="double"
			borderColor={canHold ? "cyan" : "gray"}
			height={6}
		>
			<Box>
				<Text>{HUD_COLORS.label("HOLD")}</Text>
			</Box>

			<Box flexDirection="column">
				{preview.map(({ id, line }) => (
					<Text key={`hold-${id}`} dimColor={!canHold}>
						{holdPiece ? line : UI_COLORS.muted(line)}
					</Text>
				))}
			</Box>
		</Box>
	)
}
