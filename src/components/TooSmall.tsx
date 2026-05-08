import { Box, Text } from "ink"
import { UI_COLORS } from "../config/colors.js"

interface TooSmallProps {
	minWidth: number
	minHeight: number
	currentWidth: number
	currentHeight: number
}

export function TooSmall({ minWidth, minHeight, currentWidth, currentHeight }: TooSmallProps) {
	return (
		<Box
			flexDirection="column"
			alignItems="center"
			justifyContent="center"
			height="100%"
			padding={2}
		>
			<Text color="red" bold>
				Terminal Too Small
			</Text>
			<Box marginTop={1} flexDirection="column" alignItems="center">
				<Text>
					{UI_COLORS.dim("Current: ")}
					<Text color={currentWidth < minWidth ? "red" : "green"}>{currentWidth}</Text>
					{UI_COLORS.dim(" x ")}
					<Text color={currentHeight < minHeight ? "red" : "green"}>{currentHeight}</Text>
				</Text>
				<Text>
					{UI_COLORS.dim("Required: ")}
					<Text color="green">{minWidth}</Text>
					{UI_COLORS.dim(" x ")}
					<Text color="green">{minHeight}</Text>
				</Text>
			</Box>
			<Box marginTop={2}>
				<Text color="yellow">Please resize your terminal to continue.</Text>
			</Box>
		</Box>
	)
}
