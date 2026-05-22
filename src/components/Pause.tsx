import { Box, Text } from "ink"

interface ControlsRow {
	label: string
	keys: string[]
}

interface PauseProps {
	selectedIndex: number
}

const CONTROL_ROWS: ControlsRow[] = [
	{ label: "Move", keys: ["A", "D", "←", "→"] },
	{ label: "Soft Drop", keys: ["S", "↓"] },
	{ label: "Hard Drop", keys: ["W", "↑"] },
	{ label: "Rotate CW", keys: ["K", "Z", "Sp"] },
	{ label: "Rotate CCW", keys: ["J", "X"] },
	{ label: "Hold", keys: ["H", "C"] },
]

function KeyBox({ children }: { children: string }) {
	return (
		<Text bold color="yellow">
			{" ["}
			{children}
			{"]"}
		</Text>
	)
}

export function Pause({ selectedIndex }: PauseProps) {
	const options = ["Resume", "Menu", "Quit"]

	return (
		<Box flexDirection="column" alignItems="center">
			<Box
				flexDirection="column"
				alignItems="center"
				borderStyle="double"
				borderColor="yellow"
				backgroundColor="black"
				paddingX={3}
				paddingY={0}
			>
				<Box>
					<Text bold color="yellow">
						PAUSED
					</Text>
				</Box>

				<Box flexDirection="column" width={34}>
					<Box justifyContent="center">
						<Text bold color="cyan">
							CONTROLS
						</Text>
					</Box>
					{CONTROL_ROWS.map((row) => (
						<Box key={row.label} justifyContent="space-between">
							<Text color="white">{row.label}</Text>
							<Box>
								{row.keys.map((key) => (
									<KeyBox key={key}>{key}</KeyBox>
								))}
							</Box>
						</Box>
					))}
				</Box>

				<Box flexDirection="column" alignItems="center">
					{options.map((option, index) => (
						<Text
							key={option}
							color={selectedIndex === index ? "green" : "white"}
							bold={selectedIndex === index}
						>
							{selectedIndex === index ? "▶ " : "  "}
							{option}
						</Text>
					))}
				</Box>
			</Box>
		</Box>
	)
}
