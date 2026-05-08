#!/usr/bin/env node

import { render } from "ink"
import { parseArgs, showHelp } from "./cli-args.js"
import { Menu } from "./components/Menu.js"
import { getBestMarathonScore } from "./game/highScores.js"
import { runMarathon } from "./modes/marathon.js"
import { runVsCpu } from "./modes/vsCpu.js"
import { runVsPlayer } from "./modes/vsPlayer.js"
import type { Difficulty } from "./utils/types.js"

interface MenuChoice {
	mode: "marathon" | "cpu" | "2p"
	difficulty: Difficulty
	sound: boolean
}

async function selectFromMenu(): Promise<MenuChoice | null> {
	let menuChoice: MenuChoice | null = null

	await new Promise<void>((resolve) => {
		const { unmount } = render(
			<Menu
				bestScore={getBestMarathonScore()}
				onSelect={(choice) => {
					menuChoice = choice
					unmount()
					resolve()
				}}
				onQuit={() => {
					unmount()
					resolve()
				}}
			/>,
		)
	})

	return menuChoice
}

async function runSelectedMode(choice: MenuChoice): Promise<"quit" | "restart" | "menu"> {
	if (choice.mode === "marathon") {
		return runMarathon(choice.difficulty, choice.sound)
	}
	if (choice.mode === "cpu") {
		return runVsCpu(choice.difficulty, choice.sound)
	}
	return runVsPlayer(choice.difficulty, choice.sound)
}

// Main entry
async function main() {
	const args = parseArgs()

	if (args.help) {
		showHelp()
		process.exit(0)
	}

	if (args.version) {
		console.log("tetris-cli v1.0.0")
		process.exit(0)
	}

	if (args.errors.length > 0) {
		console.error(args.errors.join("\n"))
		console.error("Run with --help for usage.")
		process.exit(1)
	}

	let currentChoice: MenuChoice | null = args.mode
		? {
				mode: args.mode,
				difficulty: args.difficulty,
				sound: args.sound,
			}
		: null

	while (true) {
		if (!currentChoice) {
			currentChoice = await selectFromMenu()
			if (!currentChoice) break
		}

		const result = await runSelectedMode(currentChoice)
		if (result === "restart") continue
		if (result === "menu") {
			currentChoice = null
			continue
		}
		break
	}
}

main().catch((err) => {
	console.error("Error:", err.message || err)
	process.exit(1)
})
