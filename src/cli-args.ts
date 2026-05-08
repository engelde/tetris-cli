// Parse CLI arguments
import type { Difficulty, GameMode } from "./utils/types.js"

const VALID_MODES: GameMode[] = ["marathon", "cpu", "2p"]
const VALID_DIFFICULTIES: Difficulty[] = ["easy", "normal", "hard"]

export interface CliArgs {
	mode: "marathon" | "cpu" | "2p" | null
	difficulty: "easy" | "normal" | "hard"
	sound: boolean
	help: boolean
	version: boolean
	errors: string[]
}

export function parseArgs(args = process.argv.slice(2)): CliArgs {
	let mode: "marathon" | "cpu" | "2p" | null = null
	let difficulty: "easy" | "normal" | "hard" = "normal"
	let sound = true
	let help = false
	let version = false
	const errors: string[] = []

	for (let i = 0; i < args.length; i++) {
		const arg = args[i]

		switch (arg) {
			case "--mode": {
				const m = args[i + 1]
				if (!m || m.startsWith("-")) {
					errors.push("--mode requires a value: marathon, cpu, or 2p")
				} else if (VALID_MODES.includes(m as GameMode)) {
					mode = m as GameMode
					i++
				} else {
					errors.push(`Unknown mode "${m}". Use marathon, cpu, or 2p.`)
					i++
				}
				break
			}
			case "--difficulty": {
				const d = args[i + 1]
				if (!d || d.startsWith("-")) {
					errors.push("--difficulty requires a value: easy, normal, or hard")
				} else if (VALID_DIFFICULTIES.includes(d as Difficulty)) {
					difficulty = d as Difficulty
					i++
				} else {
					errors.push(`Unknown difficulty "${d}". Use easy, normal, or hard.`)
					i++
				}
				break
			}
			case "--no-sound":
				sound = false
				break
			case "--help":
			case "-h":
				help = true
				break
			case "--version":
			case "-v":
				version = true
				break
			default:
				errors.push(`Unknown option "${arg}". Run with --help for usage.`)
				break
		}
	}

	return { mode, difficulty, sound, help, version, errors }
}

// Show help
export function showHelp(): void {
	console.log(`
tetris-cli - A faithful CLI recreation of Tetris

Usage: npx tetris-cli [options]

Options:
  --mode <mode>        Game mode: marathon, cpu, 2p  (default: interactive menu)
  --difficulty <level>  Difficulty: easy, normal, hard  (default: normal)
  --no-sound            Disable beep sound effects
  --help, -h            Show this help message
  --version, -v         Show version number

Controls (Player 1):
  Move:   A / Left Arrow
  Drop:   S (soft) / W / Space (hard)
  Rotate: K / Z (CW) / J / X (CCW)
  Hold:   H / C
  Pause:  P / Esc
  Quit:   Q / Ctrl+C

Controls (Player 2, 2P mode):
  Move:   Left / Right Arrow
  Drop:   Down (soft) / Up / Space (hard)
  Rotate: , or . (CW) / Slash or > (CCW)
  Hold:   ; / L

Examples:
  npx tetris-cli
  npx tetris-cli --mode cpu --difficulty hard
  npx tetris-cli --mode 2p
`)
}
