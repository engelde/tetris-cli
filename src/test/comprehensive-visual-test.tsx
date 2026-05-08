import { render } from "ink-testing-library"
import { Game } from "../components/Game.js"
import { createGameState, spawnPiece } from "../game/engine.js"
import { setTestTerminalSize } from "./terminal-size.js"

setTestTerminalSize(80, 24)

// Create a test game state with all features visible
const state = createGameState("marathon", "normal")

// Create an interesting board state with various patterns
// Bottom rows - tetris setup
for (let col = 0; col < 10; col++) {
	if (col !== 9) {
		// Leave one column for tetris
		state.board[23][col] = { type: "I", color: "cyan" }
		state.board[22][col] = { type: "O", color: "yellow" }
		state.board[21][col] = { type: "T", color: "magenta" }
	}
}

// Add some middle patterns
for (let col = 0; col < 8; col++) {
	state.board[20][col] = { type: "S", color: "green" }
}

for (let col = 2; col < 10; col++) {
	state.board[19][col] = { type: "Z", color: "red" }
}

// Spawn piece
spawnPiece(state)

// Set game state to show various features
state.score = 123456
state.level = 12
state.lines = 156
state.combo = 5
state.lastClearWasDifficult = true
state.garbageQueue = 3
state.holdPiece = "T"
state.canHold = true

const { lastFrame } = render(<Game state={state} isHighScore={false} />)

console.log("╔════════════════════════════════════════════════════════════════════════╗")
console.log("║                   TETRIS CLI - COMPREHENSIVE VISUAL TEST                  ║")
console.log("╚════════════════════════════════════════════════════════════════════════╝")
console.log()
console.log(lastFrame())
console.log()
console.log("╔════════════════════════════════════════════════════════════════════════╗")
console.log("║  Features visible:                                                        ║")
console.log("║  ✓ Hold piece preview (left panel)                                        ║")
console.log("║  ✓ Main board with colored pieces                                         ║")
console.log("║  ✓ Current piece with ghost piece below it                                ║")
console.log("║  ✓ Next queue showing 3 upcoming pieces (right panel)                     ║")
console.log("║  ✓ Score, Level, Lines stats                                              ║")
console.log("║  ✓ Combo counter (5x)                                                     ║")
console.log("║  ✓ B2B (Back-to-Back) indicator                                           ║")
console.log("║  ✓ Incoming garbage warning (3 lines)                                     ║")
console.log("║  ✓ Control hints at bottom                                                ║")
console.log("╚════════════════════════════════════════════════════════════════════════╝")
