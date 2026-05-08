import { render } from "ink-testing-library"
import { Game } from "../components/Game.js"
import { createGameState, spawnPiece } from "../game/engine.js"
import { setTestTerminalSize } from "./terminal-size.js"

setTestTerminalSize(80, 24)

// Create a test game state
const state = createGameState("marathon", "normal")

// Add some test pieces to the board bottom
for (let row = 19; row >= 17; row--) {
	for (let col = 0; col < 10; col++) {
		if (col < 3 || col > 6) {
			state.board[row + 4][col] = { type: "I", color: "cyan" }
		}
	}
}

// Add a partial row
for (let col = 0; col < 5; col++) {
	state.board[21][col] = { type: "O", color: "yellow" }
}

spawnPiece(state)

state.score = 12345
state.level = 5
state.lines = 42

const { lastFrame } = render(<Game state={state} isHighScore={false} />)

console.log("=== FULL GAME BOARD ===")
console.log(lastFrame())
console.log("=======================")
