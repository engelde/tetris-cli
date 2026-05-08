import {
	BACK_TO_BACK_MULTIPLIER,
	SCORE_COMBO_MULTIPLIER,
	SCORE_DOUBLE,
	SCORE_SINGLE,
	SCORE_TETRIS,
	SCORE_TRIPLE,
	SCORE_TSPIN_0,
	SCORE_TSPIN_DOUBLE,
	SCORE_TSPIN_MINI_0,
	SCORE_TSPIN_MINI_DOUBLE,
	SCORE_TSPIN_MINI_SINGLE,
	SCORE_TSPIN_SINGLE,
	SCORE_TSPIN_TRIPLE,
} from "../utils/constants.js"
import type { ClearType, ScoreEvent } from "../utils/types.js"

// Calculate score for a line clear action
export function calculateScore(
	clearType: ClearType,
	level: number,
	isB2B: boolean,
	combo: number,
): ScoreEvent {
	let baseScore = 0
	let lines = 0
	let isDifficult = false

	switch (clearType) {
		case "single":
			baseScore = SCORE_SINGLE
			lines = 1
			break
		case "double":
			baseScore = SCORE_DOUBLE
			lines = 2
			break
		case "triple":
			baseScore = SCORE_TRIPLE
			lines = 3
			break
		case "tetris":
			baseScore = SCORE_TETRIS
			lines = 4
			isDifficult = true
			break
		case "tspin-mini-0":
			baseScore = SCORE_TSPIN_MINI_0
			lines = 0
			break
		case "tspin-0":
			baseScore = SCORE_TSPIN_0
			lines = 0
			isDifficult = true
			break
		case "tspin-mini-single":
			baseScore = SCORE_TSPIN_MINI_SINGLE
			lines = 1
			break
		case "tspin-single":
			baseScore = SCORE_TSPIN_SINGLE
			lines = 1
			isDifficult = true
			break
		case "tspin-mini-double":
			baseScore = SCORE_TSPIN_MINI_DOUBLE
			lines = 2
			break
		case "tspin-double":
			baseScore = SCORE_TSPIN_DOUBLE
			lines = 2
			isDifficult = true
			break
		case "tspin-triple":
			baseScore = SCORE_TSPIN_TRIPLE
			lines = 3
			isDifficult = true
			break
	}

	// Apply level multiplier
	let score = baseScore * level

	// Apply Back-to-Back bonus (only on difficult clears)
	if (isDifficult && isB2B) {
		score = Math.round(score * BACK_TO_BACK_MULTIPLIER)
	}

	// Apply combo bonus (only if combo > 0 and lines > 0)
	if (combo > 0 && lines > 0) {
		score += SCORE_COMBO_MULTIPLIER * combo * level
	}

	return {
		type: clearType,
		score,
		lines,
		isB2B: isDifficult,
		combo,
	}
}

// Check if a clear type is "difficult" (qualifies for B2B)
export function isDifficultClear(clearType: ClearType): boolean {
	return ["tetris", "tspin-0", "tspin-single", "tspin-double", "tspin-triple"].includes(clearType)
}

// Get garbage rows to send for a clear type (multiplayer)
export function getGarbageSent(clearType: ClearType, isB2B: boolean): number {
	let garbage = 0

	switch (clearType) {
		case "single":
			garbage = 0
			break
		case "double":
			garbage = 1
			break
		case "triple":
			garbage = 2
			break
		case "tetris":
			garbage = 4
			break
		case "tspin-mini-single":
			garbage = 0
			break
		case "tspin-single":
			garbage = 2
			break
		case "tspin-mini-double":
			garbage = 1
			break
		case "tspin-double":
			garbage = 4
			break
		case "tspin-triple":
			garbage = 6
			break
		case "tspin-mini-0":
		case "tspin-0":
			garbage = 0
			break
	}

	// B2B bonus
	if (isB2B && isDifficultClear(clearType)) {
		if (clearType === "tspin-mini-single" || clearType === "tspin-mini-double") {
			garbage += 1
		} else if (clearType === "tetris" || clearType === "tspin-double") {
			garbage += 2
		} else if (clearType === "tspin-triple") {
			garbage += 3
		}
	}

	return garbage
}

// Format score with commas
export function formatScore(score: number): string {
	return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}
