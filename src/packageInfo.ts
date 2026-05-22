import { readFileSync } from "node:fs"

interface PackageInfo {
	name: string
	version: string
}

let cachedPackageInfo: PackageInfo | null = null

function readPackageInfo(): PackageInfo {
	if (cachedPackageInfo) return cachedPackageInfo

	const packageJsonUrl = new URL("../package.json", import.meta.url)
	const packageJson = JSON.parse(readFileSync(packageJsonUrl, "utf8")) as Partial<PackageInfo>

	cachedPackageInfo = {
		name: packageJson.name ?? "@engelde/tetris-cli",
		version: packageJson.version ?? "0.0.0",
	}

	return cachedPackageInfo
}

export function getPackageName(): string {
	return readPackageInfo().name
}

export function getPackageVersion(): string {
	return readPackageInfo().version
}
