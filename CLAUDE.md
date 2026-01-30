# COSMIC CHAOS - Tower Defense

## Project Overview
A tower defense game built with Three.js, React, and TypeScript. Players defend their base from waves of cosmic creatures using towers and a playable hero.

## Tech Stack
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Three.js** - 3D rendering
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for R3F
- **React 18** - UI framework
- **Zustand** - State management

## Project Structure
```
/src
  /core          - Game loop, managers (Game.ts, GameManager.ts, WaveManager.ts, etc.)
  /entities      - Entity definitions (Enemy.ts, Tower.ts, Hero.ts, Projectile.ts)
  /systems       - Game systems (movement, targeting, combat, abilities)
  /graphics      - Three.js renderers for each entity type
  /stores        - Zustand state management
  /ui            - React UI components (HUD, menus, panels)
  /data          - JSON configs for enemies, towers, heroes, waves, maps
  /utils         - Helper functions
  /types         - TypeScript type definitions
```

## Key Commands
- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run preview` - Preview production build

## Game Entities

### Enemies (4 types)
- **Blobbert** - Slow, resilient blob
- **Sir Scuttles** - Fast, fragile crab
- **Chonkzilla** - Massive tank unit
- **Floofernaut** - Balanced floating alien

### Towers (3 types)
- **Plasma Spire** - Fast-firing, moderate damage
- **Rail Cannon** - Slow, high damage, long range
- **Nova Launcher** - Area damage with splash

### Hero
- **Captain Zara** - Click-to-move hero with 3 abilities:
  - Q: Plasma Burst (AoE damage)
  - W: Energy Shield (defense buff)
  - R: Orbital Strike (massive AoE)

## Architecture Notes

### State Management
All game state flows through Zustand store (`gameStore.ts`). UI components subscribe to relevant state slices.

### Game Loop
`GameManager.ts` orchestrates the update loop:
1. Wave spawning
2. Enemy movement along path
3. Tower targeting and firing
4. Projectile movement
5. Hero actions
6. Health/damage resolution

### Rendering
Each entity type has a dedicated renderer component that reads from the store and renders Three.js objects.
