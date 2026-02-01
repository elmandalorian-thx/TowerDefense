# COSMIC CHAOS

### Next-Gen Space Fantasy Tower Defense

A stunning 3D tower defense game featuring GPU-accelerated particle effects, 5 playable heroes, strategic tower upgrades, and a neon cosmos aesthetic.

---

## Screenshots

> *Deploy towers, command heroes, and unleash devastating abilities against the Void Horde!*

---

## Features

### Visual Excellence
| Feature | Description |
|---------|-------------|
| **Post-Processing** | Bloom, chromatic aberration, vignette, HDR |
| **GPU Particles** | 15,000+ particles for explosions, trails, impacts |
| **Screen Shake** | Satisfying impact feedback on hits |
| **Neon Cosmos** | Hot pinks, electric blues, toxic greens |

### 5 Playable Heroes

| Hero | Role | HP | Abilities |
|------|------|-----|-----------|
| **Captain Zara** | Melee Brawler | 300 | Plasma Burst (Q), Energy Shield (W), Orbital Strike (R) |
| **Prof. Wobblesworth** | Support Mage | 400 | Gravity Bubble (Q), Repair Drone (W), Black Hole (R) |
| **B.O.R.I.S.** | Tank | 1500 | Rocket Punch (Q), Fortress Mode (W), Orbital Drop (R) |
| **Glitch** | Assassin | 300 | Phase Shift (Q), Glitch Bomb (W), System Crash (R) |
| **Mama Moonbeam** | Healer | 500 | Healing Ray (Q), Cosmic Shield (W), Resurrection (R) |

### 6 Unique Enemy Types

| Enemy | HP | Special Behavior |
|-------|-----|------------------|
| **Blobbert** | 50 | Splits into 2 mini-blobs on death |
| **Sir Scuttles** | 30 | Dodges every 3rd projectile (33% evasion) |
| **Chonkzilla** | 200 | 25% armor, immune to knockback |
| **Floofernaut** | 80 | Flying, leaves damaging trail |
| **Zappy McZapface** | 100 | Teleports forward every 3 seconds |
| **Wormothy** | 300 | Burrows underground (invulnerable for 2s) |

### Tower Upgrade System

Each tower has **4 upgrade tiers** with **branching paths** at tier 4:

```
PLASMA SPIRE ($50)
├── Tier 2: Enhanced Plasma (+50% damage)
├── Tier 3: Supercharged (+50% attack speed)
└── Tier 4: Choose your path
    ├── A: Void Siphon (life drain, heals nearby tower)
    └── B: Prismatic Array (rainbow laser, random debuffs)

RAIL CANNON ($100)
├── Tier 2: Reinforced Barrel (+30% range)
├── Tier 3: Armor Piercing (ignores armor)
└── Tier 4: Choose your path
    ├── A: Singularity Rifle (creates gravity wells)
    └── B: Swarm Launcher (fires 8 homing missiles)

NOVA LAUNCHER ($75)
├── Tier 2: Bigger Boom (+50% splash radius)
├── Tier 3: Napalm (leaves fire DOT)
└── Tier 4: Choose your path
    ├── A: Supernova Core (radiation zones)
    └── B: Cryo Comet (freezing shots, shatter on death)
```

### Synthesized Audio

- **Procedural Sound Generation** using Web Audio API
- **Spatial 3D Audio** with distance falloff
- **Sound Categories**: Lasers, explosions, abilities, UI feedback
- **Volume Controls**: Master, SFX, Music sliders

### Polished UI

- **Floating Damage Numbers** - Rise and fade with color coding
- **Wave Announcements** - Epic slide-in with boss wave effects
- **Ability Cooldowns** - Circular sweep with ready pulse
- **Gold Popups** - Coin burst at enemy death
- **Tooltips** - Holographic hover info

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/elmandalorian-thx/TowerDefense.git
cd TowerDefense

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## Controls

### Desktop

| Action | Input |
|--------|-------|
| **Camera Pan** | Middle Mouse + Drag |
| **Camera Zoom** | Scroll Wheel |
| **Move Hero** | Right Click on Ground |
| **Hero Abilities** | Q, W, R Keys |
| **Place Tower** | Click Tower Spot → Select Tower |
| **Upgrade Tower** | Click Existing Tower |
| **Switch Hero** | Click Hero Selector |

### Mobile

| Action | Input |
|--------|-------|
| **Camera Pan** | Drag |
| **Camera Zoom** | Pinch |
| **Move Hero** | Tap Ground |
| **Abilities** | Tap Ability Buttons |
| **Place/Upgrade** | Tap Tower Spots/Towers |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Build** | Vite 5 |
| **Language** | TypeScript |
| **3D Engine** | Three.js + React Three Fiber |
| **Post-Processing** | @react-three/postprocessing |
| **State** | Zustand |
| **UI Animations** | Framer Motion |
| **Audio** | Howler.js + Web Audio API |
| **Styling** | CSS with custom properties |

---

## Project Structure

```
src/
├── core/                    # Game loop & managers
│   ├── Game.tsx            # Main game component
│   ├── GameManager.ts      # Update orchestration
│   ├── WaveManager.ts      # Wave spawning logic
│   ├── AudioManager.ts     # Sound system
│   └── SynthAudio.ts       # Procedural audio generation
│
├── entities/               # Game entity definitions
│   ├── Enemy.ts           # Enemy creation
│   ├── EnemyFactory.ts    # Enemy spawning with behaviors
│   ├── Tower.ts           # Tower creation
│   ├── TowerFactory.ts    # Tower spawning with upgrades
│   ├── Hero.ts            # Hero creation
│   ├── HeroFactory.ts     # Hero spawning
│   └── Projectile.ts      # Projectile creation
│
├── systems/                # Game logic systems
│   ├── EnemyMovementSystem.ts    # Pathing, teleport, burrow
│   ├── EnemyHealthSystem.ts      # Damage, split, dodge
│   ├── TowerTargetingSystem.ts   # Target acquisition
│   ├── TowerAttackSystem.ts      # Firing logic
│   ├── ProjectileSystem.ts       # Projectile movement
│   ├── HeroMovementSystem.ts     # Click-to-move
│   ├── HeroAbilitySystem.ts      # Q/W/R abilities
│   └── HeroCombatSystem.ts       # Auto-attack
│
├── graphics/               # Three.js rendering
│   ├── MapRenderer.tsx         # Ground, path, tower spots
│   ├── EnemyRenderer.tsx       # Enemy models & animations
│   ├── TowerRenderer.tsx       # Tower models & upgrades
│   ├── HeroRenderer.tsx        # Hero models
│   ├── ProjectileRenderer.tsx  # Projectile visuals
│   ├── ParticleSystem.tsx      # GPU instanced particles
│   ├── PostProcessing.tsx      # Bloom, chromatic aberration
│   └── effects/                # Visual effects
│       ├── ExplosionEffect.tsx
│       ├── ProjectileTrail.tsx
│       ├── ImpactEffect.tsx
│       ├── AbilityEffect.tsx
│       └── ScreenShake.ts
│
├── stores/                 # State management
│   ├── gameStore.ts       # Core game state
│   └── effectsStore.ts    # Visual effects triggers
│
├── ui/                     # React UI components
│   ├── components/
│   │   ├── HUD.tsx              # Currency, lives, score
│   │   ├── TowerMenu.tsx        # Tower selection
│   │   ├── TowerUpgradeMenu.tsx # Upgrade UI
│   │   ├── HeroPanel.tsx        # Hero stats & abilities
│   │   ├── HeroSelector.tsx     # Hero switching
│   │   ├── WaveIndicator.tsx    # Wave progress
│   │   ├── GameOverScreen.tsx   # Victory/defeat
│   │   ├── FloatingText.tsx     # Damage numbers
│   │   ├── GoldPopup.tsx        # Currency earned
│   │   ├── WaveAnnouncement.tsx # Wave start
│   │   ├── AbilityButton.tsx    # Cooldown display
│   │   ├── Tooltip.tsx          # Hover info
│   │   └── AudioSettings.tsx    # Volume controls
│   └── styles/
│       └── ui.css              # Neon cosmos styling
│
├── data/                   # JSON configurations
│   ├── enemies.json       # Enemy stats & behaviors
│   ├── towers.json        # Tower stats & upgrades
│   ├── heroes.json        # Hero stats & abilities
│   ├── waves.json         # Wave compositions
│   ├── audio.json         # Sound configurations
│   └── maps/
│       └── testMap.json   # Map layout
│
├── types/                  # TypeScript definitions
│   └── index.ts           # All game types
│
└── utils/                  # Helper functions
    └── helpers.ts         # Math, vectors, utilities
```

---

## Performance

| Metric | Desktop | Mobile |
|--------|---------|--------|
| **Frame Rate** | 60 FPS | 30-60 FPS |
| **Particles** | 15,000 | 5,000 |
| **Load Time** | < 3s | < 5s |
| **Bundle Size** | ~1.4 MB | ~1.4 MB |

---

## Game Design Document

See [GAME_DESIGN_DOCUMENT.md](./GAME_DESIGN_DOCUMENT.md) for the full design specification including:
- Faction system (future)
- Territory control (future)
- Additional heroes and enemies
- Boss encounters
- Visual style guide

---

## Development

```bash
# Development with hot reload
npm run dev

# Type checking
npx tsc --noEmit

# Production build
npm run build

# Preview production build
npm run preview
```

---

## Roadmap

- [ ] Faction System (Iron Dominion, Swarm Collective, Eternal Ascendancy)
- [ ] Territory Control mode
- [ ] Boss encounters (King Blorbulous, Empress Void'thulox)
- [ ] Mobile touch optimization
- [ ] Multiplayer co-op
- [ ] Level editor

---

## Credits

Built with:
- [Three.js](https://threejs.org/) - 3D graphics
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) - React renderer
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Howler.js](https://howlerjs.com/) - Audio

---

## License

MIT License - feel free to use for learning and personal projects.

---

*Made with mass parallelism - 7 AI agents working simultaneously!*
