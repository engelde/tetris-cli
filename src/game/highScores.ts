import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { HIGH_SCORE_FILE } from "../utils/constants.js"
import type { GameState } from "../utils/types.js"

export const MAX_HIGH_SCORES = 10

export interface HighScoreEntry {
	score: number
	level: number
	lines: number
	date: string
}

export interface HighScoreFile {
	marathon: HighScoreEntry[]
}

export function emptyHighScores(): HighScoreFile {
	return { marathon: [] }
}

function isHighScoreEntry(value: unknown): value is HighScoreEntry {
	if (!value || typeof value !== "object") return false
	const entry = value as Partial<HighScoreEntry>
	return (
		typeof entry.score === "number" &&
		Number.isFinite(entry.score) &&
		typeof entry.level === "number" &&
		Number.isFinite(entry.level) &&
		typeof entry.lines === "number" &&
		Number.isFinite(entry.lines) &&
		typeof entry.date === "string"
	)
}

export function normalizeHighScores(value: unknown): HighScoreFile {
	const marathon =
		value && typeof value === "object" && "marathon" in value
			? (value as { marathon?: unknown }).marathon
			: []

	return {
		marathon: Array.isArray(marathon)
			? marathon
					.filter(isHighScoreEntry)
					.sort((a, b) => b.score - a.score)
					.slice(0, MAX_HIGH_SCORES)
			: [],
	}
}

export function parseHighScores(raw: string): HighScoreFile {
	return normalizeHighScores(JSON.parse(raw))
}

export function readHighScores(path = HIGH_SCORE_FILE): HighScoreFile {
	try {
		if (!existsSync(path)) return emptyHighScores()
		return parseHighScores(readFileSync(path, "utf8"))
	} catch (_err) {
		return emptyHighScores()
	}
}

export function getBestMarathonScore(scores = readHighScores()): number {
	return scores.marathon[0]?.score ?? 0
}

export function createHighScoreEntry(state: GameState, date = new Date()): HighScoreEntry {
	return {
		score: state.score,
		level: state.level,
		lines: state.lines,
		date: date.toISOString(),
	}
}

export function isMarathonHighScore(
	scores: HighScoreFile,
	entry: Pick<HighScoreEntry, "score">,
	limit = MAX_HIGH_SCORES,
): boolean {
	if (scores.marathon.length < limit) return true
	return entry.score > (scores.marathon.at(-1)?.score ?? 0)
}

export function insertMarathonHighScore(
	scores: HighScoreFile,
	entry: HighScoreEntry,
	limit = MAX_HIGH_SCORES,
): { scores: HighScoreFile; isHighScore: boolean } {
	if (!isMarathonHighScore(scores, entry, limit)) {
		return { scores, isHighScore: false }
	}

	return {
		scores: {
			marathon: [...scores.marathon, entry].sort((a, b) => b.score - a.score).slice(0, limit),
		},
		isHighScore: true,
	}
}

export function recordMarathonHighScore(
	state: GameState,
	path = HIGH_SCORE_FILE,
	date = new Date(),
): boolean {
	try {
		const currentScores = readHighScores(path)
		const result = insertMarathonHighScore(currentScores, createHighScoreEntry(state, date))
		if (result.isHighScore) {
			writeFileSync(path, JSON.stringify(result.scores, null, 2))
		}
		return result.isHighScore
	} catch (_err) {
		return false
	}
}
