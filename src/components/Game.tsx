import { Box, Text } from "ink"
import { HUD_COLORS, UI_COLORS } from "../config/colors.js"
import { useTerminalSize } from "../hooks/useTerminalSize.js"
import type { GameState } from "../utils/types.js"
import { Backdrop } from "./Backdrop.js"
import { Board } from "./Board.js"
import { GameOver } from "./GameOver.js"
import { HoldPiece } from "./HoldPiece.js"
import { HUD } from "./HUD.js"
import { NextQueue } from "./NextQueue.js"
import { Pause } from "./Pause.js"
import { TooSmall } from "./TooSmall.js"

interface GameProps {
	state: GameState
	isHighScore?: boolean
	pauseSelectedIndex?: number
}

export function Game({ state, isHighScore = false, pauseSelectedIndex = 0 }: GameProps) {
	const size = useTerminalSize()
	const minWidth = 58
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
				<Box marginBottom={0}>
					<Text>
						{UI_COLORS.highlight("TETRIS CLI")}
						{UI_COLORS.dim("  |  ")}
						{HUD_COLORS.label(state.difficulty.toUpperCase())}
						{UI_COLORS.dim("  |  ")}
						{UI_COLORS.muted(state.isPaused ? "PAUSED" : "LIVE")}
					</Text>
				</Box>

				{/* Main game area */}
				<Box>
					{/* Left panel: Hold piece */}
					<Box width={12} marginRight={1} flexDirection="column" alignItems="flex-end">
						<HoldPiece holdPiece={state.holdPiece} canHold={state.canHold} />
					</Box>

					{/* Center: Game board */}
					<Box>
						<Board state={state} />
					</Box>

					{/* Right panel: Next queue and stats */}
					<Box width={14} marginLeft={1} flexDirection="column">
						<NextQueue nextQueue={state.nextQueue} />
						<Box marginTop={1}>
							<HUD state={state} />
						</Box>
					</Box>
				</Box>
			</Box>

			{/* Pause overlay */}
			{state.isPaused && (
				<Backdrop>
					<Pause selectedIndex={pauseSelectedIndex} />
				</Backdrop>
			)}

			{/* Game over overlay */}
			{state.isGameOver && (
				<Backdrop>
					<GameOver state={state} isHighScore={isHighScore} />
				</Backdrop>
			)}
		</Box>
	)
}
