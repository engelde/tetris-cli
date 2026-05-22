import { useEffect, useRef } from "react"
import { gameTick } from "../game/engine.js"
import type { GameState } from "../utils/types.js"

interface UseGameLoopOptions {
	state: GameState
	onUpdate: () => void
	fps?: number
}

export function useGameLoop({ state, onUpdate, fps = 60 }: UseGameLoopOptions) {
	const lastTimeRef = useRef<number>(Date.now())
	const frameRef = useRef<NodeJS.Timeout | null>(null)
	const onUpdateRef = useRef(onUpdate)
	const fpsRef = useRef(fps)

	useEffect(() => {
		onUpdateRef.current = onUpdate
		fpsRef.current = fps
	}, [onUpdate, fps])

	useEffect(() => {
		if (state.isGameOver || state.isPaused) {
			return
		}

		lastTimeRef.current = Date.now()

		const loop = () => {
			const now = Date.now()
			const dt = now - lastTimeRef.current
			lastTimeRef.current = now

			// Update game state
			gameTick(state, dt)
			onUpdateRef.current()

			// Schedule next frame
			if (!state.isGameOver && !state.isPaused) {
				frameRef.current = setTimeout(loop, 1000 / fpsRef.current)
			}
		}

		// Start the loop
		loop()

		// Cleanup
		return () => {
			if (frameRef.current) {
				clearTimeout(frameRef.current)
			}
		}
	}, [state, state.isGameOver, state.isPaused])
}
