export type SoundCue =
	| "move"
	| "rotate"
	| "lock"
	| "hard-drop"
	| "line-clear-1"
	| "line-clear-2"
	| "line-clear-3"
	| "line-clear-4"
	| "t-spin"
	| "game-over"
	| "pause"
	| "garbage"
	| "back-to-back"

export interface Tone {
	frequency: number
	durationMs: number
	volume: number
}

export const CUE_COOLDOWNS_MS: Partial<Record<SoundCue, number>> = {
	move: 45,
	rotate: 55,
	lock: 70,
	"hard-drop": 90,
}

export const CUE_TONES: Record<SoundCue, Tone[]> = {
	move: [{ frequency: 196, durationMs: 32, volume: 0.09 }],
	rotate: [
		{ frequency: 392, durationMs: 28, volume: 0.1 },
		{ frequency: 523.25, durationMs: 32, volume: 0.09 },
	],
	lock: [{ frequency: 130.81, durationMs: 42, volume: 0.1 }],
	"hard-drop": [
		{ frequency: 246.94, durationMs: 32, volume: 0.12 },
		{ frequency: 123.47, durationMs: 48, volume: 0.11 },
	],
	"line-clear-1": [
		{ frequency: 329.63, durationMs: 45, volume: 0.13 },
		{ frequency: 493.88, durationMs: 65, volume: 0.13 },
	],
	"line-clear-2": [
		{ frequency: 329.63, durationMs: 42, volume: 0.13 },
		{ frequency: 493.88, durationMs: 42, volume: 0.13 },
		{ frequency: 659.25, durationMs: 70, volume: 0.13 },
	],
	"line-clear-3": [
		{ frequency: 329.63, durationMs: 38, volume: 0.13 },
		{ frequency: 493.88, durationMs: 38, volume: 0.13 },
		{ frequency: 659.25, durationMs: 38, volume: 0.13 },
		{ frequency: 880, durationMs: 76, volume: 0.12 },
	],
	"line-clear-4": [
		{ frequency: 493.88, durationMs: 42, volume: 0.14 },
		{ frequency: 659.25, durationMs: 42, volume: 0.14 },
		{ frequency: 987.77, durationMs: 46, volume: 0.13 },
		{ frequency: 1318.51, durationMs: 95, volume: 0.12 },
	],
	"t-spin": [
		{ frequency: 587.33, durationMs: 34, volume: 0.12 },
		{ frequency: 880, durationMs: 34, volume: 0.12 },
		{ frequency: 1174.66, durationMs: 80, volume: 0.11 },
	],
	"game-over": [
		{ frequency: 392, durationMs: 90, volume: 0.13 },
		{ frequency: 293.66, durationMs: 110, volume: 0.12 },
		{ frequency: 196, durationMs: 160, volume: 0.12 },
	],
	pause: [
		{ frequency: 261.63, durationMs: 42, volume: 0.1 },
		{ frequency: 329.63, durationMs: 60, volume: 0.09 },
	],
	garbage: [
		{ frequency: 146.83, durationMs: 45, volume: 0.12 },
		{ frequency: 146.83, durationMs: 65, volume: 0.1 },
	],
	"back-to-back": [
		{ frequency: 659.25, durationMs: 42, volume: 0.13 },
		{ frequency: 987.77, durationMs: 42, volume: 0.13 },
		{ frequency: 1318.51, durationMs: 85, volume: 0.12 },
	],
}
