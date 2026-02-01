# COSMIC CHAOS - Tower Defense

A next-gen 3D tower defense game with stunning visual effects, 5 playable heroes, and strategic tower upgrades.

## Features

### Visual Excellence
- **Post-Processing Pipeline** - Bloom, chromatic aberration, vignette
- **GPU Particle System** - 10,000+ particles for explosions and trails
- **Screen Shake** - Satisfying impact feedback
- **Neon Cosmos Aesthetic** - Hot pinks, electric blues, toxic greens

### 5 Playable Heroes
| Hero | Role | Ultimate |
|------|------|----------|
| Captain Zara | Melee Brawler | Orbital Strike |
| Professor Wobblesworth | Support Mage | Black Hole |
| B.O.R.I.S. | Tank | Orbital Drop |
| Glitch | Assassin | System Crash |
| Mama Moonbeam | Healer | Resurrection |

### 6 Unique Enemy Types
- **Blobbert** - Splits into mini-blobs on death
- **Sir Scuttles** - Dodges every 3rd shot
- **Chonkzilla** - Knockback immune tank
- **Floofernaut** - Flying with damage trail
- **Zappy McZapface** - Random teleportation
- **Wormothy** - Burrows underground

### Tower Upgrade System
Each tower has 4 upgrade tiers with branching paths at tier 4:
- **Plasma Spire** → Void Siphon OR Prismatic Array
- **Rail Cannon** → Singularity Rifle OR Swarm Launcher
- **Nova Launcher** → Supernova Core OR Cryo Comet

### Synthesized Audio
- Sci-fi laser sounds
- Explosion effects
- Ability audio cues
- Spatial 3D audio

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Controls

### Desktop
| Action | Input |
|--------|-------|
| Camera | Middle Mouse + Drag / Scroll |
| Move Hero | Right Click |
| Hero Abilities | Q, W, R |
| Select Tower | Click Tower Spot |
| Upgrade Tower | Click Existing Tower |

### Mobile
- Tap to select/place
- Drag to pan camera
- Pinch to zoom
- Ability buttons on screen

## Tech Stack

- **Three.js** + React Three Fiber
- **@react-three/postprocessing** for effects
- **Zustand** for state management
- **Framer Motion** for UI animations
- **Howler.js** for audio
- **TypeScript** throughout

## Project Structure

```
src/
├── core/           # Game loop, audio manager
├── entities/       # Enemy, Tower, Hero, Projectile
├── systems/        # Movement, combat, abilities
├── graphics/       # Renderers + particle effects
│   └── effects/    # Explosions, trails, impacts
├── stores/         # Zustand stores
├── ui/             # React components
└── data/           # JSON configs
```

## Performance

- 60 FPS on desktop
- 30-60 FPS on mobile
- GPU instanced particles
- Object pooling for entities
- Automatic quality detection

## License

MIT
