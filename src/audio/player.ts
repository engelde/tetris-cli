import { spawn } from "node:child_process"
import { existsSync } from "node:fs"
import { delimiter, join } from "node:path"

export interface AudioCommand {
	command: string
	args: string[]
}

let cachedAudioPlayer: ((filePath: string) => AudioCommand | null) | null | undefined

export function getAudioCommand(filePath: string): AudioCommand | null {
	const resolver = getAudioCommandResolver()
	return resolver?.(filePath) ?? null
}

export function spawnAudioCommand(command: AudioCommand, onError: () => void): void {
	try {
		const child = spawn(command.command, command.args, {
			detached: true,
			stdio: "ignore",
			windowsHide: true,
		})
		child.on("error", onError)
		child.unref()
	} catch {
		onError()
	}
}

function getAudioCommandResolver(): ((filePath: string) => AudioCommand | null) | null {
	if (cachedAudioPlayer !== undefined) return cachedAudioPlayer

	if (process.platform === "darwin") {
		const afplay = findExecutable("afplay")
		cachedAudioPlayer = afplay ? (filePath) => ({ command: afplay, args: [filePath] }) : null
		return cachedAudioPlayer
	}

	if (process.platform === "win32") {
		const powershell = findExecutable("powershell.exe") ?? findExecutable("powershell")
		cachedAudioPlayer = powershell
			? (filePath) => ({
					command: powershell,
					args: [
						"-NoProfile",
						"-NonInteractive",
						"-Command",
						"(New-Object Media.SoundPlayer $args[0]).PlaySync()",
						filePath,
					],
				})
			: null
		return cachedAudioPlayer
	}

	const player = findExecutable("paplay") ?? findExecutable("pw-play") ?? findExecutable("aplay")
	cachedAudioPlayer = player ? (filePath) => ({ command: player, args: [filePath] }) : null
	return cachedAudioPlayer
}

function findExecutable(name: string): string | null {
	const paths = (process.env.PATH ?? "").split(delimiter)
	const extensions = process.platform === "win32" ? ["", ".exe", ".cmd", ".bat"] : [""]

	for (const path of paths) {
		for (const extension of extensions) {
			const candidate = join(path, `${name}${extension}`)
			if (existsSync(candidate)) return candidate
		}
	}

	return null
}
