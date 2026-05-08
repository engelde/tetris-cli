import { render } from "ink-testing-library"
import { Menu } from "../components/Menu.js"

// Simple test to visualize the menu
const { lastFrame } = render(<Menu onSelect={(choice) => console.log(choice)} />)

console.log("=== MENU RENDER ===")
console.log(lastFrame())
console.log("===================")
