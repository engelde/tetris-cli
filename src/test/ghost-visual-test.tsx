import { render } from "ink-testing-library"
import { Game } from "../components/Game.js"
import { createGameState, spawnPiece } from "../game/engine.js"
import { setTestTerminalSize } from "./terminal-size.js"

setTestTerminalSize(80, 24)

// Create a test game state
const state = createGameState("marathon", "normal")

// Add a floor at the bottom with a gap
for (let col = 0; col < 10; col++) {
	if (col < 4 || col > 5) {
		state.board[23][col] = { type: "Z", color: "red" }
	}
}

// Spawn a piece and position it high up so ghost is visible
spawnPiece(state)

// Move the piece to above the gap so ghost shows in the gap
if (state.currentPiece) {
	state.currentPiece.position = { row: 4, col: 4 }
}

state.score = 100
state.level = 1
state.lines = 0

const { lastFrame } = render(<Game state={state} isHighScore={false} />)

console.log("=== GHOST PIECE TEST ===")
console.log(lastFrame())
console.log("========================")
