import { existsSync, mkdirSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { BEEP } from "../utils/constants.js"
import { CUE_COOLDOWNS_MS, CUE_TONES, type SoundCue, type Tone } from "./cues.js"
import { getAudioCommand, spawnAudioCommand } from "./player.js"

export type SoundPlayer = (cue: SoundCue) => void

const SAMPLE_RATE = 44_100
const SOUND_DIR = join(tmpdir(), "tetris-cli-sounds-v1")

let soundEnabled = true
const lastPlayedAt = new Map<SoundCue, number>()
let soundOutput = (chunk: string): void => {
	process.stdout.write(chunk)
}
let soundPlayer: SoundPlayer = playNativeCue

// Enable or disable sound
export function setSoundEnabled(enabled: boolean): void {
	soundEnabled = enabled
	lastPlayedAt.clear()
}

export function isSoundEnabled(): boolean {
	return soundEnabled
}

export function setSoundOutputForTests(output: ((chunk: string) => void) | null): void {
	soundOutput = output ?? ((chunk: string) => process.stdout.write(chunk))
}

export function setSoundPlayerForTests(player: SoundPlayer | null): void {
	soundPlayer = player ?? playNativeCue
	lastPlayedAt.clear()
}

function play(cue: SoundCue): void {
	if (!soundEnabled) return

	const cooldown = CUE_COOLDOWNS_MS[cue] ?? 0
	const now = Date.now()
	if (cooldown > 0 && now - (lastPlayedAt.get(cue) ?? 0) < cooldown) return

	lastPlayedAt.set(cue, now)
	soundPlayer(cue)
}

function playNativeCue(cue: SoundCue): void {
	const filePath = ensureCueFile(cue)
	const command = getAudioCommand(filePath)

	if (!command) {
		soundOutput(BEEP)
		return
	}

	spawnAudioCommand(command, () => {
		soundOutput(BEEP)
	})
}

function ensureCueFile(cue: SoundCue): string {
	mkdirSync(SOUND_DIR, { recursive: true })
	const filePath = join(SOUND_DIR, `${cue}.wav`)

	if (!existsSync(filePath)) {
		writeFileSync(filePath, createWav(CUE_TONES[cue]))
	}

	return filePath
}

function createWav(tones: Tone[]): Buffer {
	const samples = tones.flatMap(createToneSamples)
	const dataSize = samples.length * 2
	const buffer = Buffer.alloc(44 + dataSize)

	buffer.write("RIFF", 0)
	buffer.writeUInt32LE(36 + dataSize, 4)
	buffer.write("WAVE", 8)
	buffer.write("fmt ", 12)
	buffer.writeUInt32LE(16, 16)
	buffer.writeUInt16LE(1, 20)
	buffer.writeUInt16LE(1, 22)
	buffer.writeUInt32LE(SAMPLE_RATE, 24)
	buffer.writeUInt32LE(SAMPLE_RATE * 2, 28)
	buffer.writeUInt16LE(2, 32)
	buffer.writeUInt16LE(16, 34)
	buffer.write("data", 36)
	buffer.writeUInt32LE(dataSize, 40)

	samples.forEach((sample, index) => {
		const clamped = Math.max(-1, Math.min(1, sample))
		buffer.writeInt16LE(Math.round(clamped * 32767), 44 + index * 2)
	})

	return buffer
}

function createToneSamples(tone: Tone): number[] {
	const sampleCount = Math.max(1, Math.floor((tone.durationMs / 1000) * SAMPLE_RATE))
	const attackSamples = Math.floor(0.004 * SAMPLE_RATE)
	const releaseSamples = Math.floor(0.014 * SAMPLE_RATE)
	const samples: number[] = []

	for (let i = 0; i < sampleCount; i++) {
		const attack = attackSamples > 0 ? Math.min(1, i / attackSamples) : 1
		const release = releaseSamples > 0 ? Math.min(1, (sampleCount - i - 1) / releaseSamples) : 1
		const envelope = Math.max(0, Math.min(attack, release))
		const phase = (2 * Math.PI * tone.frequency * i) / SAMPLE_RATE
		samples.push(Math.sin(phase) * tone.volume * envelope)
	}

	return samples
}

// Sound effects
export function playMove(): void {
	play("move")
}

export function playRotate(): void {
	play("rotate")
}

export function playLock(): void {
	play("lock")
}

export function playLineClear(lines: number): void {
	if (lines <= 0) return
	const lineCount = Math.min(4, Math.max(1, Math.floor(lines)))
	play(`line-clear-${lineCount}` as SoundCue)
}

export function playTSpin(): void {
	play("t-spin")
}

export function playGameOver(): void {
	play("game-over")
}

export function playPause(): void {
	play("pause")
}

export function playHardDrop(): void {
	play("hard-drop")
}

export function playGarbageSent(): void {
	play("garbage")
}

export function playB2B(): void {
	play("back-to-back")
}
