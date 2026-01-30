# COSMIC CHAOS - Tower Defense

A 3D tower defense game built with Three.js and React.

![Game Screenshot](docs/screenshot.png)

## Features

- **4 Unique Enemy Types** - From bouncy Blobbberts to massive Chonkzillas
- **3 Tower Types** - Plasma Spires, Rail Cannons, and Nova Launchers
- **Playable Hero** - Captain Zara with click-to-move and powerful abilities
- **5 Challenging Waves** - Escalating difficulty with mixed enemy compositions
- **Strategic Tower Placement** - 8 tower spots to defend your base

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## How to Play

1. **Place Towers** - Click tower spots to build defenses
2. **Manage Resources** - Earn currency by defeating enemies
3. **Control Your Hero** - Right-click to move, Q/W/R for abilities
4. **Survive the Waves** - Don't let enemies reach your base!

## Controls

| Action | Input |
|--------|-------|
| Camera Pan | Middle Mouse Drag |
| Camera Zoom | Mouse Wheel |
| Place Tower | Click Tower Spot + Select Tower |
| Move Hero | Right Click on Ground |
| Hero Abilities | Q, W, R keys |
| Start Wave | Click "Start Wave" Button |

## Tech Stack

- [Vite](https://vitejs.dev/) - Build tool
- [Three.js](https://threejs.org/) - 3D graphics
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) - React renderer for Three.js
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [TypeScript](https://www.typescriptlang.org/) - Type safety

## Project Structure

```
src/
├── core/       # Game loop and managers
├── entities/   # Enemy, Tower, Hero, Projectile classes
├── systems/    # Movement, combat, targeting systems
├── graphics/   # Three.js renderers
├── stores/     # Zustand state
├── ui/         # React UI components
├── data/       # JSON game configs
└── utils/      # Helper functions
```

## License

MIT
