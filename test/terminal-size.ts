export function setTestTerminalSize(columns: number, rows: number): void {
	Object.defineProperty(process.stdout, "columns", {
		value: columns,
		configurable: true,
	})
	Object.defineProperty(process.stdout, "rows", {
		value: rows,
		configurable: true,
	})
}

export function resizeTestTerminal(columns: number, rows: number): void {
	setTestTerminalSize(columns, rows)
	process.stdout.emit("resize")
	process.emit("SIGWINCH")
}
