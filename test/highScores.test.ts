import "./setup"
import assert from "node:assert/strict"
import { mkdtempSync, readFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { describe, test } from "node:test"
import { createGameState } from "../src/game/engine"
import {
	createHighScoreEntry,
	getBestMarathonScore,
	insertMarathonHighScore,
	parseHighScores,
	recordMarathonHighScore,
} from "../src/game/highScores"

describe("High scores", () => {
	test("parses, sorts, and trims marathon scores", () => {
		const raw = JSON.stringify({
			marathon: [
				{ score: 300, level: 3, lines: 20, date: "2026-01-03T00:00:00.000Z" },
				{ score: 100, level: 1, lines: 5, date: "2026-01-01T00:00:00.000Z" },
				{ score: 500, level: 5, lines: 40, date: "2026-01-05T00:00:00.000Z" },
				{ score: Number.NaN, level: 5, lines: 40, date: "bad" },
				null,
				...Array.from({ length: 10 }, (_, idx) => ({
					score: 200 - idx,
					level: 2,
					lines: 10,
					date: `2026-01-${String(idx + 10).padStart(2, "0")}T00:00:00.000Z`,
				})),
			],
		})

		const scores = parseHighScores(raw)

		assert.equal(scores.marathon.length, 10)
		assert.equal(scores.marathon[0].score, 500)
		assert.equal(scores.marathon.at(-1)?.score, 193)
	})

	test("inserts qualifying scores and leaves non-qualifying scores alone", () => {
		const fullTable = {
			marathon: Array.from({ length: 10 }, (_, idx) => ({
				score: 1000 - idx * 100,
				level: 1,
				lines: 0,
				date: "2026-01-01T00:00:00.000Z",
			})),
		}

		const rejected = insertMarathonHighScore(fullTable, {
			score: 50,
			level: 1,
			lines: 0,
			date: "2026-01-01T00:00:00.000Z",
		})
		const accepted = insertMarathonHighScore(fullTable, {
			score: 950,
			level: 4,
			lines: 30,
			date: "2026-01-02T00:00:00.000Z",
		})

		assert.equal(rejected.isHighScore, false)
		assert.equal(rejected.scores, fullTable)
		assert.equal(accepted.isHighScore, true)
		assert.equal(accepted.scores.marathon.length, 10)
		assert.equal(accepted.scores.marathon[1].score, 950)
		assert.equal(accepted.scores.marathon.at(-1)?.score, 200)
	})

	test("records a marathon score to disk", () => {
		const state = createGameState("marathon", "hard")
		state.score = 42_000
		state.level = 8
		state.lines = 70
		const path = join(mkdtempSync(join(tmpdir(), "tetris-cli-scores-")), "scores.json")
		const date = new Date("2026-05-08T12:00:00.000Z")

		const isHighScore = recordMarathonHighScore(state, path, date)
		const saved = JSON.parse(readFileSync(path, "utf8"))

		assert.equal(isHighScore, true)
		assert.deepEqual(saved.marathon, [createHighScoreEntry(state, date)])
		assert.equal(getBestMarathonScore(saved), 42_000)
	})
})
