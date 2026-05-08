import { Box, Text } from "ink"
import { UI_COLORS } from "../config/colors.js"

export function Pause() {
	return (
		<Box flexDirection="column" alignItems="center">
			<Box
				flexDirection="column"
				alignItems="center"
				justifyContent="center"
				borderStyle="double"
				borderColor="yellow"
				backgroundColor="black"
				paddingX={4}
				paddingY={2}
			>
				<Box marginBottom={1}>
					<Text bold color="yellow">
						PAUSED
					</Text>
				</Box>
				<Box marginBottom={1}>
					<Text>{UI_COLORS.muted("Board held. Take a breath.")}</Text>
				</Box>

				<Box marginY={1} flexDirection="column" alignItems="center">
					<Text>
						<Text color="green">▶</Text> {UI_COLORS.normal("Press ")}
						<Text color="yellow">[P]</Text>
						{UI_COLORS.normal(" to resume")}
					</Text>
					<Text>
						<Text color="red">×</Text> {UI_COLORS.normal("Press ")}
						<Text color="yellow">[Q]</Text>
						{UI_COLORS.normal(" to quit")}
					</Text>
				</Box>
			</Box>
		</Box>
	)
}
