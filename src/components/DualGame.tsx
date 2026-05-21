import { Box, Text } from "ink"
import { UI_COLORS } from "../config/colors.js"
import { useTerminalSize } from "../hooks/useTerminalSize.js"
import type { GameState } from "../utils/types.js"
import { Backdrop } from "./Backdrop.js"
import { Board } from "./Board.js"
import { HoldPiece } from "./HoldPiece.js"
import { HUD } from "./HUD.js"
import { NextQueue } from "./NextQueue.js"
import { Pause } from "./Pause.js"
import { TooSmall } from "./TooSmall.js"

interface DualGameProps {
	player1State: GameState
	player2State: GameState
	player1Label: string
	player2Label: string
	controlsHint?: string
	showWinner?: boolean
	winner?: "player1" | "player2" | null
}

export function DualGame({
	player1State,
	player2State,
	player1Label,
	player2Label,
	controlsHint = "P1 WASD J/K H/C | P2 arrows ,/. / > ;/L | P pause | Q quit",
	showWinner = false,
	winner = null,
}: DualGameProps) {
	const size = useTerminalSize()
	const minWidth = 86
	const minHeight = 24

	if (size.columns < minWidth || size.rows < minHeight) {
		return (
			<TooSmall
				minWidth={minWidth}
				minHeight={minHeight}
				currentWidth={size.columns}
				currentHeight={size.rows}
			/>
		)
	}

	return (
		<Box width={size.columns} height={size.rows} justifyContent="center" alignItems="center">
			<Box flexDirection="column" alignItems="center" justifyContent="center">
				{/* Header with player labels */}
				<Box width="100%" justifyContent="center">
					<Text>
						<Text bold color={player1State.isGameOver ? "red" : "cyan"}>
							{player1Label}
						</Text>
						{UI_COLORS.dim("  VS  ")}
						<Text bold color={player2State.isGameOver ? "red" : "green"}>
							{player2Label}
						</Text>
						{UI_COLORS.dim(`   ${controlsHint}`)}
					</Text>
				</Box>

				{/* Main game areas side by side */}
				<Box>
					{/* Player 1 */}
					<Box>
						<Box>
							<Board state={player1State} />
						</Box>
						<Box width={15} marginLeft={1} flexDirection="column">
							<HoldPiece holdPiece={player1State.holdPiece} canHold={player1State.canHold} />
							<NextQueue nextQueue={player1State.nextQueue} />
							<HUD state={player1State} />
						</Box>
					</Box>

					{/* Separator */}
					<Box width={2} />

					{/* Player 2 */}
					<Box>
						<Box>
							<Board state={player2State} />
						</Box>
						<Box width={15} marginLeft={1} flexDirection="column">
							<HoldPiece holdPiece={player2State.holdPiece} canHold={player2State.canHold} />
							<NextQueue nextQueue={player2State.nextQueue} />
							<HUD state={player2State} />
						</Box>
					</Box>
				</Box>

				{/* Winner announcement */}
				{showWinner && winner && (
					<Box
						position="absolute"
						marginTop={10}
						paddingX={4}
						paddingY={1}
						flexDirection="column"
						alignItems="center"
						justifyContent="center"
						borderStyle="double"
						borderColor="yellow"
						backgroundColor="black"
					>
						<Text bold color="yellow">
							🏆 {winner === "player1" ? player1Label : player2Label} WINS! 🏆
						</Text>
						<Box marginTop={1}>
							<Text color="white">
								{UI_COLORS.dim("Press ")}
								<Text color="yellow">[R]</Text>
								{UI_COLORS.dim(" to restart | ")}
								<Text color="yellow">[M]</Text>
								{UI_COLORS.dim(" for menu | ")}
								<Text color="yellow">[Q]</Text>
								{UI_COLORS.dim(" to quit")}
							</Text>
						</Box>
					</Box>
				)}

				{(player1State.isPaused || player2State.isPaused) && (
					<Backdrop>
						<Pause />
					</Backdrop>
				)}
			</Box>
		</Box>
	)
}
