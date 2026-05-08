import { Box, render } from "ink"
import { GameOver } from "../components/GameOver.js"
import { Pause } from "../components/Pause.js"
import type { GameState } from "../utils/types.js"

// Mock game state
const mockState: GameState = {
	mode: "marathon" as const,
	difficulty: "normal",
	randomizer: { bag: [], bagIndex: 0 },
	board: [],
	currentPiece: null,
	holdPiece: null,
	nextQueue: [],
	canHold: true,
	score: 123456,
	level: 12,
	lines: 156,
	combo: 0,
	lastClearWasDifficult: false,
	isPaused: false,
	isGameOver: true,
	lockDelay: 0,
	lockResets: 0,
	gravityAccumulator: 0,
	animations: [],
	events: [],
	garbageQueue: 0,
	garbageSent: 0,
}

console.log("\n╔════════════════════════════════════════════════════════════════════════╗")
console.log("║                     MODAL VISUAL TEST                                    ║")
console.log("╚════════════════════════════════════════════════════════════════════════╝\n")

console.log("Testing GameOver Modal (with solid background):\n")

const { unmount: unmount1 } = render(
	<Box flexDirection="column">
		<GameOver state={mockState} isHighScore={true} />
	</Box>,
)

setTimeout(() => {
	unmount1()

	console.log("\n\nTesting Pause Modal (with solid background):\n")

	const { unmount: unmount2 } = render(
		<Box flexDirection="column">
			<Pause />
		</Box>,
	)

	setTimeout(() => {
		unmount2()
		console.log("\n\n✓ Modal tests complete!\n")
		process.exit(0)
	}, 2000)
}, 2000)
