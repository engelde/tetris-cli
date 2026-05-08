import { render } from "ink-testing-library"
import { Game } from "../components/Game.js"
import { createGameState, spawnPiece } from "../game/engine.js"
import { setTestTerminalSize } from "./terminal-size.js"

setTestTerminalSize(80, 24)

// Create a test game state
const state = createGameState("marathon", "normal")
spawnPiece(state)

// Add some test data
state.score = 12345
state.level = 5
state.lines = 42
state.combo = 3
state.lastClearWasDifficult = true

const { lastFrame } = render(<Game state={state} isHighScore={false} />)

console.log("=== GAME RENDER ===")
console.log(lastFrame())
console.log("===================")
