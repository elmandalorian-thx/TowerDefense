# Tower Defense Game Design Document
## "Chrono Guardians" - A Kingdom Rush-Inspired WebGL Tower Defense

---

## 1. Vision Statement

An epic, vibrant tower defense game featuring:
- **Stunning WebGL 3D graphics** with toon shading
- **Heavy particle effects** for explosions, magic, and abilities
- **Kingdom Rush-style mechanics** with branching upgrade paths
- **Super stylistic design** - chunky, colorful, memorable

---

## 2. Tech Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| **3D Engine** | Three.js | 93K+ GitHub stars, ~150KB bundle, maximum flexibility |
| **Language** | TypeScript | Type safety for complex game logic |
| **Build Tool** | Vite | Fast HMR, excellent DX |
| **Particles** | three.quarks + Custom GPGPU | CPU for small effects, GPU for massive effects |
| **State** | Zustand | Lightweight, React-compatible |
| **UI** | React + React Three Fiber | Menus/HUD overlay |
| **Audio** | Howler.js | Cross-browser audio |
| **Animation** | GSAP + Three.js AnimationMixer | Smooth tweens and skeletal animation |

---

## 3. Architecture: Entity-Component-System (ECS)

```
┌─────────────────────────────────────────────────────────────────┐
│                           WORLD                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                      ENTITIES                            │    │
│  │   Tower  │  Enemy  │ Projectile │  Effect │  Soldier    │    │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                     COMPONENTS                           │    │
│  │  Transform │ Health │ Renderable │ Tower │ Enemy │ etc. │    │
│  └─────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                      SYSTEMS                             │    │
│  │  Movement │ Targeting │ Combat │ Projectile │ Particle  │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Tower Types & Upgrade Trees

### Base Towers (Tier 1-3)

| Tower | Role | Damage | Attack Speed | Range | Special |
|-------|------|--------|--------------|-------|---------|
| **Arcane Spire** | Magic DPS | 25 magic | 1.0/s | Medium | Ignores armor |
| **Ballista Tower** | Physical DPS | 35 physical | 0.8/s | Long | Armor pierce |
| **Barracks** | Crowd Control | 15 melee | 1.2/s | Short | Spawns 3 soldiers |
| **Cannon Fortress** | AOE Damage | 60 physical | 0.5/s | Medium | Splash damage |

### Tier 4 Branching Upgrades (Kingdom Rush Style)

```
ARCANE SPIRE
├── Path A: "Void Weaver"
│   ├── Damage: 45 → 55 → 65
│   ├── Special: Void Rift (AOE slow + damage)
│   └── Ultimate: "Dimensional Tear" - Black hole pulls enemies
│
└── Path B: "Storm Caller"
    ├── Damage: 35 → 40 → 45
    ├── Special: Chain Lightning (bounces 4 targets)
    └── Ultimate: "Thunder God's Wrath" - Screen-wide storm

BALLISTA TOWER
├── Path A: "Siege Crossbow"
│   ├── Damage: 80 → 100 → 120
│   ├── Special: Piercing Shot (line damage)
│   └── Ultimate: "Dragon Slayer" - Massive crit
│
└── Path B: "Twin Repeater"
    ├── Damage: 25 → 30 → 35
    ├── Special: Rapid Fire (3x speed for 3s)
    └── Ultimate: "Arrow Storm" - Area rain

BARRACKS
├── Path A: "Holy Paladins"
│   ├── Soldiers: 3 Paladins with shields
│   ├── Special: Divine Shield (3s immunity)
│   └── Ultimate: "Judgement" - AOE holy + heal
│
└── Path B: "Shadow Assassins"
    ├── Soldiers: 2 Assassins (high dmg, low HP)
    ├── Special: Backstab (execute < 20% HP)
    └── Ultimate: "Death Mark" - Target takes 3x damage

CANNON FORTRESS
├── Path A: "Inferno Mortar"
│   ├── Damage: 100 → 130 → 160
│   ├── Special: Napalm (burning ground)
│   └── Ultimate: "Meteor Strike" - Massive fire AOE
│
└── Path B: "Tesla Coil"
    ├── Damage: 40 → 50 → 60
    ├── Special: EMP Pulse (stuns mechanical)
    └── Ultimate: "Overcharge" - Continuous beam
```

### Tower Visual Design Language

| Tower | Colors | Shape | Particles |
|-------|--------|-------|-----------|
| Arcane Spire | Purple, cyan, gold | Spiraling crystal | Floating runes, sparkles |
| Ballista | Wood, brass, red | Mechanical, gears | Wood splinters, arrow trails |
| Barracks | Steel, leather, faction | Fortress-like, flags | Dust clouds, weapon swings |
| Cannon | Dark iron, orange flames | Chunky, industrial | Explosions, smoke plumes |

---

## 5. Enemy Types

### Standard Enemies

| Enemy | HP | Speed | Armor | Special | Reward |
|-------|-----|-------|-------|---------|--------|
| **Goblin Scout** | 80 | Fast | 0 | None | 5g |
| **Orc Grunt** | 200 | Normal | 10 | None | 10g |
| **Armored Knight** | 400 | Slow | 40 | High armor | 25g |
| **Shadow Stalker** | 120 | Very Fast | 0 | Phase shift (invuln) | 15g |
| **Troll Berserker** | 600 | Normal | 15 | Regeneration | 30g |
| **Dark Mage** | 150 | Normal | 0 | Buffs allies | 20g |
| **Wyvern** | 250 | Fast | 10 | Flying | 35g |
| **Golem** | 1000 | Very Slow | 60 | Immune to slow | 50g |
| **Necromancer** | 200 | Slow | 0 | Resurrects enemies | 40g |
| **Plague Rat** | 40 | Very Fast | 0 | Spawns on death | 3g |

### Boss Enemies

**Thornback the Destroyer (Wave 10)**
- HP: 5000, Armor: 30
- Abilities: Ground Pound, Thick Hide, Enrage at 25%
- Visual: Massive ogre with crystal growths

**Vexara the Storm Queen (Wave 20)**
- HP: 8000, Flying, Magic Resist: 50
- Abilities: Lightning Shield, Summon Tempest, Thunder Strike
- Visual: Ethereal harpy with lightning wings

**The Lich King (Final Boss)**
- HP: 15000, Armor: 20, Magic Resist: 30
- Abilities: Death Coil, Raise Dead, Frost Nova, Soul Harvest
- Visual: Towering skeletal figure with phylactery

---

## 6. Visual Style Guide

### Art Direction: "Vibrant Fantasy"

```
CORE AESTHETIC
├── Style: Stylized 3D with toon/cel shading
├── Proportions: Chunky, exaggerated (Blizzard-inspired)
├── Colors: Saturated, high contrast, clear silhouettes
└── Feel: Epic but approachable

COLOR PALETTE
├── Primary: Rich blues, warm golds, forest greens
├── Enemies: Corrupted purples, sickly greens, angry reds
├── Magic: Cyan, magenta, electric yellow
├── UI: Parchment tan, ink black, gold accents
└── Environment: Lush greens, earthy browns, sky blues
```

### Shading Model

- **Base**: Cel-shaded with 3-4 color bands
- **Outlines**: Dark edge detection (1-2px)
- **Highlights**: Sharp specular on metals
- **Shadows**: Soft ambient occlusion
- **Post-Process**: Bloom on magic/fire effects

### Camera Setup

- **Type**: Orthographic with slight perspective
- **Angle**: 45-60 degrees from horizontal
- **Controls**: Pan (drag), Zoom (scroll), no rotation
- **FOV**: ~35 degrees (compressed, strategic view)

---

## 7. Particle Effects System

### Architecture

```
PARTICLE SYSTEM
├── three.quarks (CPU - small effects)
│   ├── Tower attack impacts
│   ├── Enemy death pops
│   ├── Gold pickup sparkles
│   └── UI feedback
│
└── Custom GPGPU (GPU - massive effects)
    ├── Explosions (1000+ particles)
    ├── Magic spells and ultimates
    ├── Environmental effects
    └── Boss special attacks
```

### Key Effect Presets

| Effect | Particle Count | Colors | Behavior |
|--------|----------------|--------|----------|
| Explosion | 500 | White → Orange → Red → Black | Radial burst, gravity |
| Arcane Orb | 200 | Cyan → Purple → Dark | Spiral around projectile |
| Lightning | 100 | Electric blue, white core | Branching, flickering |
| Fire | 300 | Yellow → Orange → Black | Rising, turbulent |
| Ice | 150 | White → Cyan → Blue | Crystalline, sharp |
| Death | 50 | Enemy color → Black | Soul wisps rising |

### Performance Budget

- **Target**: 60 FPS on mid-range hardware
- **Max particles**: 50,000 simultaneous
- **Max draw calls**: 10 for particles
- **GPU compute time**: < 2ms per frame

---

## 8. Project Structure

```
/TowerDefense
├── /public
│   └── /assets
│       ├── /models      # glTF tower, enemy, environment
│       ├── /textures    # Atlases, normal maps
│       ├── /particles   # Particle texture sheets
│       └── /audio       # SFX and music
├── /src
│   ├── /core            # Game, SceneManager, InputManager, AudioManager
│   ├── /ecs
│   │   ├── /components  # Transform, Health, Tower, Enemy, etc.
│   │   ├── /systems     # Movement, Targeting, Combat, Particle, etc.
│   │   └── World.ts
│   ├── /entities
│   │   ├── /towers      # TowerFactory, ArcaneTower, etc.
│   │   ├── /enemies     # EnemyFactory, all enemy types
│   │   └── /projectiles
│   ├── /gameplay        # WaveManager, PathManager, EconomyManager
│   ├── /graphics
│   │   ├── /shaders     # toon.vert/frag, outline, particle, GPGPU
│   │   ├── /particles   # ParticleManager, GPGPUParticles, presets
│   │   └── /effects     # PostProcessing, Bloom, Outline
│   ├── /ui
│   │   ├── /components  # HUD, TowerMenu, UpgradePanel
│   │   └── /screens     # MainMenu, LevelSelect, Victory/Defeat
│   ├── /data            # JSON configs for towers, enemies, waves
│   └── /utils           # ObjectPool, math, eventEmitter
└── package.json
```

---

## 9. Development Phases

### Phase 1: Foundation (Weeks 1-3)
- Project scaffolding with Vite + TypeScript
- Three.js scene setup with camera controls
- Basic ECS framework
- Asset loading pipeline

### Phase 2: Core Gameplay (Weeks 4-6)
- Path system with waypoints
- Enemy spawning and movement
- Tower placement system
- Basic targeting and combat
- Health and damage systems
- Win/lose conditions

### Phase 3: Tower System (Weeks 7-9)
- All 4 base tower types
- Tier 1-3 upgrades
- Tier 4 branching paths
- Special and ultimate abilities
- Tower placement UI

### Phase 4: Enemy Variety (Weeks 10-11)
- All 10 standard enemy types
- Enemy abilities and behaviors
- Status effect system
- Boss enemies with phases

### Phase 5: Visual Polish (Weeks 12-14)
- Toon shader implementation
- Outline post-processing
- Particle system integration
- All particle presets
- Bloom and visual effects
- 3D models and environment

### Phase 6: UI/UX (Weeks 15-16)
- Main menu and level select
- In-game HUD
- Tower build and upgrade UI
- Victory/defeat screens
- Sound and music

### Phase 7: Content & Balance (Weeks 17-18)
- 5+ playable levels
- Wave compositions
- Difficulty tuning
- Economy balancing

### Phase 8: Polish & Launch (Weeks 19-20)
- Performance optimization
- Cross-browser testing
- Mobile touch controls
- Deployment

---

## 10. Performance Targets

| Metric | Target |
|--------|--------|
| Frame Rate | 60 FPS |
| Load Time | < 5 seconds |
| Bundle Size | < 2MB gzipped |
| Memory | < 500MB |
| Draw Calls | < 100 |

---

## 11. Key Technical Decisions

1. **Three.js over Babylon.js** - Smaller bundle, more flexibility, larger community
2. **ECS over OOP inheritance** - Better for tower defense entity composition
3. **GPGPU particles** - Required for "heavy particle effects" with 1000+ particles
4. **Zustand over Redux** - Lightweight, perfect for game state
5. **React for UI only** - Game logic in vanilla TS, React for overlays

---

## 12. Inspirations & References

- **Kingdom Rush** - Upgrade paths, tower variety, wave design
- **Blizzard Art Style** - Chunky proportions, vibrant colors
- **Supercell Games** - Clean UI, satisfying feedback
- **Ori and the Blind Forest** - Particle effects, visual polish

---

*Document created: 2026-01-30*
*Game Codename: Chrono Guardians*
