import { BEEP } from "../utils/constants.js"

let soundEnabled = true

// Enable or disable sound
export function setSoundEnabled(enabled: boolean): void {
	soundEnabled = enabled
}

export function isSoundEnabled(): boolean {
	return soundEnabled
}

// Play a terminal beep
function beep(): void {
	if (!soundEnabled) return
	process.stdout.write(BEEP)
}

// Sound effects
export function playMove(): void {
	// Light click for movement
	beep()
}

export function playRotate(): void {
	// Two quick beeps for rotation
	if (!soundEnabled) return
	process.stdout.write(BEEP)
	setTimeout(() => process.stdout.write(BEEP), 30)
}

export function playLock(): void {
	// Single beep on piece lock
	beep()
}

export function playLineClear(lines: number): void {
	if (!soundEnabled) return
	// Rising pitch based on lines cleared
	const beeps = Math.min(lines, 4)
	for (let i = 0; i < beeps; i++) {
		setTimeout(() => process.stdout.write(BEEP), i * 50)
	}
}

export function playTSpin(): void {
	if (!soundEnabled) return
	// Special triple beep for T-Spin
	process.stdout.write(BEEP)
	setTimeout(() => process.stdout.write(BEEP), 40)
	setTimeout(() => process.stdout.write(BEEP), 80)
}

export function playGameOver(): void {
	if (!soundEnabled) return
	// Descending beeps
	process.stdout.write(BEEP)
	setTimeout(() => process.stdout.write(BEEP), 100)
	setTimeout(() => process.stdout.write(BEEP), 200)
}

export function playPause(): void {
	if (!soundEnabled) return
	process.stdout.write(BEEP)
}

export function playHardDrop(): void {
	if (!soundEnabled) return
	// Quick double beep
	process.stdout.write(BEEP)
	setTimeout(() => process.stdout.write(BEEP), 20)
}

export function playGarbageSent(): void {
	if (!soundEnabled) return
	// Low beep
	process.stdout.write(BEEP)
}

export function playB2B(): void {
	if (!soundEnabled) return
	// Special fanfare for back-to-back
	process.stdout.write(BEEP)
	setTimeout(() => process.stdout.write(BEEP), 30)
	setTimeout(() => process.stdout.write(BEEP), 60)
	setTimeout(() => process.stdout.write(BEEP), 90)
}
