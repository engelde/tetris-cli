import { useEffect, useState } from "react"

interface TerminalSize {
	columns: number
	rows: number
}

export function useTerminalSize(): TerminalSize {
	const [size, setSize] = useState<TerminalSize>({
		columns: process.stdout.columns || 80,
		rows: process.stdout.rows || 24,
	})

	useEffect(() => {
		const onResize = () => {
			const next: TerminalSize = {
				columns: process.stdout.columns || 80,
				rows: process.stdout.rows || 24,
			}
			setSize((prev) => (prev.columns === next.columns && prev.rows === next.rows ? prev : next))
		}

		// Some terminals only emit one of these; dedupe via setSize bail-out
		process.stdout.on("resize", onResize)
		process.on("SIGWINCH", onResize)
		return () => {
			process.stdout.off("resize", onResize)
			process.off("SIGWINCH", onResize)
		}
	}, [])

	return size
}
