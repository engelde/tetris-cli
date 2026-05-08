import type { PieceType, RandomizerState } from "../utils/types.js"
import { PIECE_TYPES } from "./piece.js"

// 7-bag randomizer: each bag contains all 7 pieces in random order
// When the bag is empty, a new one is generated

let bag: PieceType[] = []
let bagIndex = 0

function shuffleBag(): PieceType[] {
	const nextBag = [...PIECE_TYPES]
	for (let i = nextBag.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[nextBag[i], nextBag[j]] = [nextBag[j], nextBag[i]]
	}
	return nextBag
}

// Initialize with a shuffled bag
function initializeBag(): void {
	bag = shuffleBag()
	bagIndex = 0
}

export function createRandomizerState(): RandomizerState {
	return {
		bag: shuffleBag(),
		bagIndex: 0,
	}
}

export function nextPieceFromRandomizer(randomizer: RandomizerState): PieceType {
	if (randomizer.bag.length === 0 || randomizer.bagIndex >= randomizer.bag.length) {
		randomizer.bag = shuffleBag()
		randomizer.bagIndex = 0
	}

	const piece = randomizer.bag[randomizer.bagIndex]
	randomizer.bagIndex++
	return piece
}

export function peekFromRandomizer(randomizer: RandomizerState, count: number): PieceType[] {
	const result: PieceType[] = []
	const tempBag = [...randomizer.bag]
	let tempBagIndex = randomizer.bagIndex

	while (result.length < count) {
		if (tempBag.length === 0 || tempBagIndex >= tempBag.length) {
			tempBag.splice(0, tempBag.length, ...shuffleBag())
			tempBagIndex = 0
		}

		result.push(tempBag[tempBagIndex])
		tempBagIndex++
	}

	return result
}

// Get the next piece type from the bag
export function nextPieceType(): PieceType {
	if (bag.length === 0 || bagIndex >= bag.length) {
		initializeBag()
	}
	const piece = bag[bagIndex]
	bagIndex++
	return piece
}

// Peek at upcoming pieces without consuming them
// Returns the next `count` pieces (may generate new bags if needed)
export function peekNext(count: number): PieceType[] {
	return peekFromRandomizer({ bag: [...bag], bagIndex }, count)
}

// Reset the randomizer (for new game)
export function resetRandomizer(): void {
	bag = []
	bagIndex = 0
	initializeBag()
}

// Initialize on module load
initializeBag()
