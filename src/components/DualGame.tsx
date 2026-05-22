import { Box, Text } from "ink"
import { UI_COLORS } from "../config/colors.js"
import { useTerminalSize } from "../hooks/useTerminalSize.js"
import type { MatchWins } from "../modes/versusRound.js"
import type { GameState } from "../utils/types.js"
import { Backdrop } from "./Backdrop.js"
import { Board } from "./Board.js"
import { HoldPiece } from "./HoldPiece.js"
import { HUD } from "./HUD.js"
import { NextQueue } from "./NextQueue.js"
import { TooSmall } from "./TooSmall.js"
import { VersusPause } from "./VersusPause.js"

interface DualGameProps {
	player1State: GameState
	player2State: GameState
	player1Label: string
	player2Label: string
	showWinner?: boolean
	winner?: "player1" | "player2" | null
	matchWins?: MatchWins
	pauseSelectedIndex?: number
}

export function DualGame({
	player1State,
	player2State,
	player1Label,
	player2Label,
	showWinner = false,
	winner = null,
	matchWins,
	pauseSelectedIndex = 0,
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
						{matchWins && UI_COLORS.dim(` (${matchWins.player1} wins)`)}
						{UI_COLORS.dim("  VS  ")}
						<Text bold color={player2State.isGameOver ? "red" : "green"}>
							{player2Label}
						</Text>
						{matchWins && UI_COLORS.dim(` (${matchWins.player2} wins)`)}
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
			</Box>

			{/* Winner announcement */}
			{showWinner && winner && (
				<Backdrop>
					<Box
						paddingX={4}
						paddingY={0}
						flexDirection="column"
						alignItems="center"
						justifyContent="center"
						borderStyle="double"
						borderColor="yellow"
						backgroundColor="black"
					>
						<Text bold color="yellow">
							ROUND WINNER
						</Text>
						<Text color="white">{winner === "player1" ? player1Label : player2Label} wins</Text>
						{matchWins && (
							<Text color="white">
								{UI_COLORS.dim("Match: ")}
								{player1Label} {matchWins.player1} - {matchWins.player2} {player2Label}
							</Text>
						)}
						<Box marginTop={1}>
							<Text color="white">
								{UI_COLORS.dim("Press ")}
								<Text color="yellow">[R]</Text>
								{UI_COLORS.dim(" next round | ")}
								<Text color="yellow">[M]</Text>
								{UI_COLORS.dim(" for menu | ")}
								<Text color="yellow">[Q]</Text>
								{UI_COLORS.dim(" to quit")}
							</Text>
						</Box>
					</Box>
				</Backdrop>
			)}

			{(player1State.isPaused || player2State.isPaused) && (
				<Backdrop>
					<VersusPause selectedIndex={pauseSelectedIndex} />
				</Backdrop>
			)}
		</Box>
	)
}
