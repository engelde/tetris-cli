import { Box, Text } from "ink"
import { PIECE_COLORS } from "../config/colors.js"

export const TETRIS_LOGO_ROWS = [
	{ text: "████████╗███████╗████████╗██████╗ ██╗███████╗", color: PIECE_COLORS.I },
	{ text: "╚══██╔══╝██╔════╝╚══██╔══╝██╔══██╗██║██╔════╝", color: PIECE_COLORS.O },
	{ text: "   ██║   █████╗     ██║   ██████╔╝██║███████╗", color: PIECE_COLORS.T },
	{ text: "   ██║   ██╔══╝     ██║   ██╔══██╗██║╚════██║", color: PIECE_COLORS.S },
	{ text: "   ██║   ███████╗   ██║   ██║  ██║██║███████║", color: PIECE_COLORS.Z },
	{ text: "   ╚═╝   ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚══════╝", color: PIECE_COLORS.I },
] as const

export function TetrisLogo() {
	return (
		<Box flexDirection="column" alignItems="center">
			{TETRIS_LOGO_ROWS.map((row) => (
				<Text key={row.text} bold>
					{row.color(row.text)}
				</Text>
			))}
		</Box>
	)
}
