import type { Difficulty } from "../utils/types.js"

// Gravity table (frames per drop at 60 FPS)
// Index = level (0-indexed), value = frames per cell drop
// Level 1 = index 0, Level 2 = index 1, etc.
export const GRAVITY_TABLE: number[] = [
	48, // Level 1 (0)
	43, // Level 2 (1)
	38, // Level 3 (2)
	33, // Level 4 (3)
	28, // Level 5 (4)
	23, // Level 6 (5)
	18, // Level 7 (6)
	13, // Level 8 (7)
	8, // Level 9 (8)
	6, // Level 10-12 (9-11)
	6, // Level 10-12
	6, // Level 10-12
	5, // Level 13-15 (12-14)
	5, // Level 13-15
	5, // Level 13-15
	4, // Level 16-18 (15-17)
	4, // Level 16-18
	4, // Level 16-18
	3, // Level 19+ (18+)
	3, // Level 19+
	3, // Level 19+
	3, // Level 19+
	3, // Level 19+
	3, // Level 19+
	3, // Level 19+
	3, // Level 19+
	3, // Level 19+
	2, // Level 29+ (28+)
	2, // Level 29+
	1, // Level 39+ hard cap (29+)
]

// Get gravity frames for a given level (1-indexed)
export function getGravityFrames(level: number): number {
	const index = Math.max(0, Math.min(level - 1, GRAVITY_TABLE.length - 1))
	return GRAVITY_TABLE[index]
}

// Lines needed per level up
export const LINES_PER_LEVEL = 10

// Difficulty configurations
export interface DifficultyConfig {
	startLevel: number
	gravityMultiplier: number
	label: string
}

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
	easy: {
		startLevel: 1,
		gravityMultiplier: 0.75,
		label: "Easy",
	},
	normal: {
		startLevel: 1,
		gravityMultiplier: 1.0,
		label: "Normal",
	},
	hard: {
		startLevel: 5,
		gravityMultiplier: 1.25,
		label: "Hard",
	},
}

// Get frames per drop for current level with difficulty multiplier
export function getEffectiveGravity(level: number, difficulty: Difficulty): number {
	const frames = getGravityFrames(level)
	const config = DIFFICULTY_CONFIGS[difficulty]
	return Math.max(1, Math.round(frames * config.gravityMultiplier))
}

// CPU Difficulty configuration
export interface CpuDifficultyConfig {
	randomness: number // 0-1, chance of making non-optimal move
	placementSpeed: number // ms per move evaluation (lower = faster)
	useTSpins: boolean
	useFlatHeuristic: boolean
	lookAhead: number // How many pieces ahead to consider (for future)
}

export const CPU_DIFFICULTY_CONFIGS: Record<Difficulty, CpuDifficultyConfig> = {
	easy: {
		randomness: 0.4,
		placementSpeed: 500,
		useTSpins: false,
		useFlatHeuristic: false,
		lookAhead: 1,
	},
	normal: {
		randomness: 0.2,
		placementSpeed: 300,
		useTSpins: false,
		useFlatHeuristic: true,
		lookAhead: 1,
	},
	hard: {
		randomness: 0.05,
		placementSpeed: 200,
		useTSpins: true,
		useFlatHeuristic: true,
		lookAhead: 2,
	},
}
