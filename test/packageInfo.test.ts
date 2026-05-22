import "./setup"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { describe, test } from "node:test"
import { getPackageName, getPackageVersion } from "../src/packageInfo"

const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"))

describe("Package metadata", () => {
	test("reads the public package name and version from package.json", () => {
		assert.equal(getPackageName(), packageJson.name)
		assert.equal(getPackageVersion(), packageJson.version)
		assert.equal(getPackageName(), "@engelde/tetris-cli")
		assert.equal(getPackageVersion(), "1.0.0")
	})
})
