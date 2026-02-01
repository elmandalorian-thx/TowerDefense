# COSMIC CHAOS - Tower Defense

## Project Overview
A next-gen tower defense game built with Three.js, React, and TypeScript featuring stunning visual effects, 5 playable heroes, and a branching tower upgrade system.

## Tech Stack
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Three.js** - 3D rendering
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for R3F
- **@react-three/postprocessing** - Post-processing effects
- **React 18** - UI framework
- **Zustand** - State management
- **Framer Motion** - UI animations
- **Howler.js** - Spatial audio

## Project Structure
```
/src
  /core          - Game loop, managers, audio system
  /entities      - Enemy, Tower, Hero, Projectile definitions
  /systems       - Movement, targeting, combat, abilities
  /graphics      - Three.js renderers + effects
    /effects     - Particle effects, screen shake, trails
  /stores        - Zustand state management (game + effects)
  /ui            - React UI components with animations
  /data          - JSON configs for all game entities
  /utils         - Helper functions
  /types         - TypeScript type definitions
```

## Key Commands
- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run preview` - Preview production build

## Game Features

### Enemies (6 types with unique behaviors)
- **Blobbert** - Splits into 2 mini-blobs on death
- **Sir Scuttles** - Dodges every 3rd projectile
- **Chonkzilla** - Knockback immune, 25% armor
- **Floofernaut** - Flying, leaves damage trail
- **Zappy McZapface** - Teleports randomly
- **Wormothy** - Burrows underground

### Towers (3 types with branching upgrades)
- **Plasma Spire** - Fast-firing energy tower
  - Tier 4A: Void Siphon (life drain)
  - Tier 4B: Prismatic Array (rainbow laser)
- **Rail Cannon** - High damage railgun
  - Tier 4A: Singularity Rifle (gravity wells)
  - Tier 4B: Swarm Launcher (homing missiles)
- **Nova Launcher** - Area damage
  - Tier 4A: Supernova Core (radiation zones)
  - Tier 4B: Cryo Comet (freezing shots)

### Heroes (5 playable)
- **Captain Zara** - Melee brawler with Plasma Burst, Energy Shield, Orbital Strike
- **Professor Wobblesworth** - Support mage with Gravity Bubble, Repair Drone, Black Hole
- **B.O.R.I.S.** - Tank with Rocket Punch, Fortress Mode, Orbital Drop
- **Glitch** - Assassin with Phase Shift, Glitch Bomb, System Crash
- **Mama Moonbeam** - Healer with Healing Ray, Cosmic Shield, Resurrection

### Visual Effects
- **Particle System** - GPU-optimized explosions, trails, impacts
- **Post-Processing** - Bloom, chromatic aberration, vignette
- **Screen Shake** - Impact feedback on explosions
- **Floating Text** - Damage numbers, gold popups
- **UI Animations** - Wave announcements, ability cooldowns

### Audio System
- Synthesized sci-fi sound effects
- Spatial audio for 3D positioning
- Volume controls (master, SFX, music)

## Architecture Notes

### State Management
- `gameStore.ts` - Core game state (enemies, towers, heroes, currency)
- `effectsStore.ts` - Visual effects triggers (screen shake, particles)

### Game Loop
`GameManager.ts` orchestrates:
1. Wave spawning with enemy variety
2. Enemy movement with special behaviors
3. Tower targeting with priority system
4. Projectile movement and splash damage
5. Hero abilities with cooldowns
6. Particle effects and audio triggers

### Visual Pipeline
1. Three.js scene with PBR materials
2. Post-processing (bloom, chromatic aberration)
3. Particle system overlays
4. React UI with Framer Motion animations
