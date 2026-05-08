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
