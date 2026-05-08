import { render } from "ink-testing-library"
import { DualGame } from "../components/DualGame.js"
import { createGameState, spawnPiece } from "../game/engine.js"
import { setTestTerminalSize } from "./terminal-size.js"

setTestTerminalSize(100, 24)

// Create test states for both players
const player1State = createGameState("2p", "normal")
const player2State = createGameState("2p", "normal")

// Add some pieces to both boards
for (let col = 0; col < 8; col++) {
	player1State.board[23][col] = { type: "I", color: "cyan" }
	player2State.board[23][col] = { type: "Z", color: "red" }
}

spawnPiece(player1State)
spawnPiece(player2State)

// Set different game stats
player1State.score = 5000
player1State.level = 3
player1State.lines = 15
player1State.combo = 2

player2State.score = 7500
player2State.level = 4
player2State.lines = 22
player2State.combo = 4
player2State.lastClearWasDifficult = true

player1State.holdPiece = "T"
player2State.holdPiece = "O"

const { lastFrame } = render(
	<DualGame
		player1State={player1State}
		player2State={player2State}
		player1Label="PLAYER 1"
		player2Label="PLAYER 2"
		showWinner={false}
		winner={null}
	/>,
)

console.log(
	"╔═══════════════════════════════════════════════════════════════════════════════════════╗",
)
console.log(
	"║                        DUAL GAME (2P / VS CPU) VISUAL TEST                              ║",
)
console.log(
	"╚═══════════════════════════════════════════════════════════════════════════════════════╝",
)
console.log()
console.log(lastFrame())
console.log()
console.log(
	"╔═══════════════════════════════════════════════════════════════════════════════════════╗",
)
console.log(
	"║  Features visible:                                                                       ║",
)
console.log(
	"║  ✓ Two game boards side by side                                                          ║",
)
console.log(
	"║  ✓ Hold piece panels for both players                                                    ║",
)
console.log(
	"║  ✓ Next queue for both players                                                           ║",
)
console.log(
	"║  ✓ Individual scores, levels, lines                                                      ║",
)
console.log(
	"║  ✓ Player labels at top                                                                  ║",
)
console.log(
	"║  ✓ Dual control hints at bottom                                                          ║",
)
console.log(
	"╚═══════════════════════════════════════════════════════════════════════════════════════╝",
)
