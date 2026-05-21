<div align="center">

<pre>
████████╗███████╗████████╗██████╗ ██╗███████╗
╚══██╔══╝██╔════╝╚══██╔══╝██╔══██╗██║██╔════╝
   ██║   █████╗     ██║   ██████╔╝██║███████╗
   ██║   ██╔══╝     ██║   █╔══██╗██║╚════██║
   ██║   ███████╗   ██║   ██║  ██║██║███████║
   ╚═╝   ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚══════╝
</pre>

**A faithful CLI recreation of Tetris — right in your terminal.** 🎮

[![npm version](https://img.shields.io/npm/v/tetris-cli?color=black&label=npm&style=flat-square)](https://www.npmjs.com/package/tetris-cli)
[![license](https://img.shields.io/npm/l/tetris-cli?color=black&style=flat-square)](LICENSE)
[![node](https://img.shields.io/node/v/tetris-cli?color=black&style=flat-square)](package.json)

<pre>
╔══════════╗ ╔══════════════════════╗ ╔════════════╗
║ HOLD     ║ ║ · · · ██████· · · ·  ║ ║ NEXT       ║
║          ║ ║ · · · · · · · · · ·  ║ ║   ██       ║
╚══════════╝ ║ · · · · · · · · · ·  ║ ║ ██████     ║
      A/D move · · · · · · · · · ·  ║ ║   ████     ║
       K/Z J/X · · · · · · · · · ·  ║ ╚════════════╝
       H/C hold · · · · · · · · · ·  ║
             · · · · · · · · · ·  ║ ╔════════════╗
             · · · · · · · · · ·  ║ ║ STATS      ║
             · · · · · · · · · ·  ║ ║ SC       0 ║
             · · · · · · · · · ·  ║ ║ LV       1 ║
             · · · · · · · · · ·  ║ ║ LN       0 ║
             · · · · · · · · · ·  ║ ║ [      ]   ║
             · · · · · · · · · ·  ║ ╚════════════╝
             · · · · · · · · · ·  ║
             · · · · · · · · · ·  ║ S soft
             · · · · · .. · · · · ║ W/Sp hard
             · · · ······· · · · ·║ P pause/Q quit
             ╚══════════════════════╝
</pre>

*"The classic puzzle game, rebuilt for the terminal."*

</div>

## 🚀 Quick Start

```bash
npx tetris-cli
```

One command. No install. Just play.

> **Want it installed?** Run `npm install -g tetris-cli` then just type `tetris`.

## 🕹️ What Is This?

A faithful recreation of **Tetris** — the puzzle game that defined a genre. Seven pieces, one board, infinite challenge. Built with TypeScript, React, and Ink for smooth 60 FPS terminal rendering.

## ✨ Features

- 🏃 **Marathon** — Classic score chase with increasing speed
- 🤖 **vs CPU** — Battle an AI opponent on Easy, Normal, or Hard
- 👥 **2-Player** — Same-keyboard duel with garbage attacks
- 🎲 **7-Bag Randomizer** — Fair piece distribution every game
- 🔄 **SRS Rotation** — Full wall kicks and spin detection
- 📦 **Hold Piece** — Swap and strategize
- 👻 **Ghost Piece** — See exactly where you'll land
- 🔥 **Combos & Back-to-Back** — Advanced scoring for pros
- 🗑️ **Garbage System** — Send lines to your opponent
- 🏆 **Local High Scores** — Persisted in `~/.tetris-cli-scores.json`
- 🔔 **Sound Effects** — Terminal bell for game events (disable with `--no-sound`)

## 🎮 Controls

### Player 1

| Action | Keys |
|--------|------|
| Move left | `A` / Left Arrow |
| Move right | `D` / Right Arrow |
| Soft drop | `S` / Down Arrow |
| Hard drop | `W` / Up Arrow / Space |
| Rotate clockwise | `K` / `Z` |
| Rotate counter-clockwise | `J` / `X` |
| Hold | `H` / `C` |
| Pause | `P` / Escape |
| Quit | `Q` / Ctrl+C |

### Player 2

| Action | Keys |
|--------|------|
| Move left | Left Arrow |
| Move right | Right Arrow |
| Soft drop | Down Arrow |
| Hard drop | Up Arrow / Space |
| Rotate clockwise | `,` / `.` |
| Rotate counter-clockwise | `/` / `>` |
| Hold | `;` / `L` |

## ⚙️ Options

| Flag | Description | Default |
|------|-------------|---------|
| `--mode <mode>` | `marathon`, `cpu`, or `2p` | Interactive menu |
| `--difficulty <level>` | `easy`, `normal`, or `hard` | `normal` |
| `--no-sound` | Disable terminal bell sounds | Sound enabled |
| `--help`, `-h` | Show help | — |
| `--version`, `-v` | Show version | — |

```bash
# Examples
npx tetris-cli --mode marathon --difficulty easy --no-sound
npx tetris-cli --mode cpu --difficulty hard
npx tetris-cli --mode 2p
```

## 💡 Pro Tips

> 🎯 **Master the hold** — Save an I-piece for the perfect Tetris setup.

> 🔄 **Learn SRS wall kicks** — A well-timed rotation can save a piece from a tight spot.

> ⚡ **Combos add up** — Clearing lines back-to-back sends massive garbage in versus modes.

> 🏓 **Watch the ghost** — The ghost piece shows your landing spot. Use it to plan ahead.

## 🛠️ Development

```bash
git clone https://github.com/engelde/tetris-cli.git
cd tetris-cli
npm install
```

| Command | Description |
|---------|-------------|
| `npm start` | Run the game |
| `npm test` | Run tests |
| `npm run build` | Compile TypeScript |
| `npm run lint` | Lint with Biome |
| `npm run format` | Format with Biome |

[Husky](https://typicode.github.io/husky/) runs linting + tests on pre-commit and enforces [Conventional Commits](https://www.conventionalcommits.org/). CI runs on Node 18 / 20 / 22. Releases via [release-please](https://github.com/googleapis/release-please).

## 📜 Credits

Inspired by the original **Tetris** created by **Alexey Pajitnov** in 1984. This is an independent, open-source recreation with no affiliation with The Tetris Company.

## 📄 License

[MIT](LICENSE)
