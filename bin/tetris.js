#!/usr/bin/env node

// Gracefully handle uncaught exceptions — restore the terminal before crashing
process.on("uncaughtException", (err) => {
	try {
		process.stdout.write("\x1b[?1049l") // exit alt screen
		process.stdout.write("\x1b[?25h") // show cursor
		process.stdout.write("\x1b[0m") // reset colors
	} catch (_) {
		// ignore write errors during cleanup
	}
	process.stderr.write("\nTetris crashed unexpectedly:\n")
	process.stderr.write(err.stack || err.message || String(err))
	process.stderr.write("\n")
	process.exit(1)
})

process.on("unhandledRejection", (reason) => {
	throw reason instanceof Error ? reason : new Error(String(reason))
})

import("../dist/index.js")
