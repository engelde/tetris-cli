import { Box } from "ink"
import type React from "react"
import { useTerminalSize } from "../hooks/useTerminalSize.js"

interface BackdropProps {
	children: React.ReactNode
}

export function Backdrop({ children }: BackdropProps) {
	const { columns, rows } = useTerminalSize()

	return (
		<Box
			position="absolute"
			width={columns}
			height={rows}
			backgroundColor="black"
			justifyContent="center"
			alignItems="center"
		>
			{children}
		</Box>
	)
}
