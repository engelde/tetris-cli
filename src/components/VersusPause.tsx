import { Box, Text } from "ink"

interface ControlsRow {
	label: string
	keys: string[]
}

interface VersusPauseProps {
	selectedIndex: number
}

const P1_ROWS: ControlsRow[] = [
	{ label: "Move", keys: ["A", "D"] },
	{ label: "Soft Drop", keys: ["S"] },
	{ label: "Hard Drop", keys: ["W"] },
	{ label: "Rotate CW", keys: ["K", "Z"] },
	{ label: "Rotate CCW", keys: ["J", "X"] },
	{ label: "Hold", keys: ["H", "C"] },
]

const P2_ROWS: ControlsRow[] = [
	{ label: "Move", keys: ["←", "→"] },
	{ label: "Soft Drop", keys: ["↓"] },
	{ label: "Hard Drop", keys: ["↑", "Space"] },
	{ label: "Rotate CW", keys: [",", "."] },
	{ label: "Rotate CCW", keys: ["/", ">"] },
	{ label: "Hold", keys: [";", "L"] },
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

function ControlsColumn({
	title,
	color,
	rows,
}: {
	title: string
	color: string
	rows: ControlsRow[]
}) {
	return (
		<Box flexDirection="column" width={26}>
			<Box justifyContent="center">
				<Text bold color={color}>
					{title}
				</Text>
			</Box>
			{rows.map((row) => (
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
	)
}

export function VersusPause({ selectedIndex }: VersusPauseProps) {
	const options = ["Resume", "Menu", "Quit"]

	return (
		<Box flexDirection="column" alignItems="center">
			<Box
				flexDirection="column"
				alignItems="center"
				borderStyle="double"
				borderColor="yellow"
				backgroundColor="black"
				paddingX={2}
				paddingY={0}
			>
				<Box>
					<Text bold color="yellow">
						PAUSED
					</Text>
				</Box>

				<Box>
					<ControlsColumn title="PLAYER 1" color="cyan" rows={P1_ROWS} />
					<Box width={2} />
					<ControlsColumn title="PLAYER 2" color="green" rows={P2_ROWS} />
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
