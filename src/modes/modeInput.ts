export interface ModeInputKey {
	ctrl?: boolean
	escape?: boolean
	return?: boolean
	leftArrow?: boolean
	rightArrow?: boolean
	upArrow?: boolean
	downArrow?: boolean
}

export type PauseNavigation = "up" | "down" | "select"

export function isCtrlC(input: string, key: ModeInputKey): boolean {
	return Boolean(key.ctrl && input === "c")
}

export function isQuitKey(input: string): boolean {
	return input === "q" || input === "Q"
}

export function isMenuKey(input: string): boolean {
	return input === "m" || input === "M"
}

export function isRestartKey(input: string): boolean {
	return input === "r" || input === "R"
}

export function isPauseKey(input: string, key: ModeInputKey): boolean {
	return input === "p" || input === "P" || Boolean(key.escape)
}

export function getPauseNavigation(input: string, key: ModeInputKey): PauseNavigation | null {
	if (key.upArrow || input === "w" || input === "W") return "up"
	if (key.downArrow || input === "s" || input === "S") return "down"
	if (key.return) return "select"
	return null
}

export function getGameKeyName(input: string, key: ModeInputKey): string | null {
	if (key.leftArrow) return "LEFT"
	if (key.rightArrow) return "RIGHT"
	if (key.upArrow) return "UP"
	if (key.downArrow) return "DOWN"
	if (input === " ") return "SPACE"
	return input ? input.toUpperCase() : null
}
