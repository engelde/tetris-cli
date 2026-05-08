import type { InputAction } from "../utils/types.js"

// Key mappings for Player 1
const P1_KEYS: Record<string, InputAction> = {
	// Movement
	a: "left",
	A: "left",
	LEFT: "left",
	d: "right",
	D: "right",
	RIGHT: "right",
	// Drops
	s: "softDrop",
	S: "softDrop",
	DOWN: "softDrop",
	w: "hardDrop",
	W: "hardDrop",
	UP: "hardDrop",
	" ": "hardDrop", // Space
	SPACE: "hardDrop",
	// Rotation
	k: "rotateCW",
	K: "rotateCW",
	z: "rotateCW",
	Z: "rotateCW",
	j: "rotateCCW",
	J: "rotateCCW",
	x: "rotateCCW",
	X: "rotateCCW",
	// Hold
	h: "hold",
	H: "hold",
	c: "hold",
	C: "hold",
	// Game
	p: "pause",
	P: "pause",
	ESCAPE: "pause",
	q: "quit",
	Q: "quit",
	CTRL_C: "quit",
}

// Key mappings for Player 2
const P2_KEYS: Record<string, InputAction> = {
	// Movement
	LEFT: "left",
	RIGHT: "right",
	// Drops
	DOWN: "softDrop",
	UP: "hardDrop",
	" ": "hardDrop", // Space (shared)
	SPACE: "hardDrop",
	// Rotation (using different keys to avoid conflicts)
	",": "rotateCW",
	"<": "rotateCW", // Shift+,
	"/": "rotateCCW",
	"?": "rotateCCW", // Shift+/
	".": "rotateCW", // Alternative
	">": "rotateCCW",
	// Hold
	";": "hold",
	":": "hold", // Shift+;
	l: "hold",
	L: "hold",
	// Game
	p: "pause",
	P: "pause",
	ESCAPE: "pause",
	q: "quit",
	Q: "quit",
	CTRL_C: "quit",
}

// Parse key event to action for given player
export function getInputAction(key: string, player: 1 | 2): InputAction | null {
	const map = player === 1 ? P1_KEYS : P2_KEYS
	return map[key] || null
}

// Get all possible keys for help display
export function getP1Controls(): { action: InputAction; keys: string }[] {
	return [
		{ action: "left", keys: "A / ←" },
		{ action: "right", keys: "D / →" },
		{ action: "softDrop", keys: "S / ↓" },
		{ action: "hardDrop", keys: "W / ↑ / Space" },
		{ action: "rotateCW", keys: "K / Z" },
		{ action: "rotateCCW", keys: "J / X" },
		{ action: "hold", keys: "H / C" },
		{ action: "pause", keys: "P / Esc" },
		{ action: "quit", keys: "Q / Ctrl+C" },
	]
}

export function getP2Controls(): { action: InputAction; keys: string }[] {
	return [
		{ action: "left", keys: "←" },
		{ action: "right", keys: "→" },
		{ action: "softDrop", keys: "↓" },
		{ action: "hardDrop", keys: "↑ / Space" },
		{ action: "rotateCW", keys: ", / ." },
		{ action: "rotateCCW", keys: "/ / >" },
		{ action: "hold", keys: "; / L" },
		{ action: "pause", keys: "P / Esc" },
		{ action: "quit", keys: "Q / Ctrl+C" },
	]
}
