# Tower Defense Game Design Document
## "COSMIC CHAOS" - Next-Gen Space Fantasy Tower Defense

---

## 1. Vision Statement

An **epic space fantasy territory control tower defense** experience featuring:
- **Three Unique Factions** - StarCraft-inspired races with distinct playstyles and mechanics
- **Territory Control** - Capture and expand zones to grow your empire
- **Faction-Specific Towers** - Each race builds unique structures with special abilities
- **Resource Mechanics** - Zerg creep expansion, Terran supply depots, Protoss pylon power
- **Conquest Mode** - Destroy the enemy base and take over the map
- **Next-generation WebGL graphics** - PBR materials, volumetric lighting, chromatic aberration
- **Playable Heroes** - Move them around the battlefield for strategic advantage
- **Cross-platform** - Buttery smooth on desktop AND mobile

---

## 2. Theme: Space Fantasy

### Setting: "The Neon Nebula"
A vibrant corner of the galaxy where cosmic magic meets advanced technology. Ancient space stations, floating asteroid fortresses, and bioluminescent alien worlds.

### Aesthetic Pillars
- **Neon + Cosmic** - Hot pinks, electric blues, toxic greens against deep space purples
- **Bio-mechanical** - Organic alien tech, pulsing veins, crystalline structures
- **Playful Chaos** - Nothing too serious, everything over-the-top

### Color Palette
```
SPACE BACKGROUNDS
├── Deep Space: #0a0a1a, #1a0a2e, #0f1729
├── Nebula Clouds: #ff006e, #8338ec, #3a86ff
└── Star Fields: #ffffff, #ffd700, #00ffff

HEROES & ALLIES
├── Primary: #00f5d4, #fee440, #f72585
├── Energy: #7fff00, #00ffff, #ff00ff
└── Metals: #c0c0c0, #ffd700, #b8860b

ENEMIES (THE VOID HORDE)
├── Corruption: #4a0080, #2d0050, #1a0030
├── Toxic: #39ff14, #ccff00, #88ff00
├── Rage: #ff0000, #ff4500, #dc143c
└── Bio-glow: #00ff88, #ff0088, #8800ff
```

---

## 3. Faction System (NEW!)

### Overview
Players choose one of three factions, each with unique mechanics, towers, and playstyles. Inspired by StarCraft but with our own cosmic twist.

### THE IRON DOMINION (Terran-inspired)
**Playstyle:** Versatile, defensive, mechanical
**Theme:** Military industrial complex meets space marines

```
FACTION MECHANICS
├── Supply Depots: Build to increase unit/tower cap
├── Bunkers: Load infantry into structures for bonus damage
├── Repair Drones: Structures slowly auto-repair
├── Siege Mode: Some towers can deploy for +damage/-mobility
└── Orbital Drops: Call down reinforcements anywhere you control

BUILDING RULES
├── Build anywhere in controlled territory
├── No special terrain requirements
├── Can lift off and relocate some buildings (slow)
└── Structures have heavy armor, slow to build

COLOR PALETTE
├── Primary: Steel gray (#5C5C5C), Military green (#4A5D23)
├── Accent: Warning orange (#FF6B00), Command blue (#3B82F6)
└── Glow: Industrial yellow (#FFD93D)
```

### THE SWARM COLLECTIVE (Zerg-inspired)
**Playstyle:** Aggressive expansion, overwhelming numbers, organic
**Theme:** Alien hive mind, bio-horror, rapid evolution

```
FACTION MECHANICS
├── CREEP (THE GOO): Must spread creep to build - this is critical!
│   ├── Creep Tumors: Spreads creep in radius, can spawn more tumors
│   ├── Hatcheries: Major creep source, production building
│   ├── Buildings OFF creep: Cannot function, slowly die
│   └── Creep provides: Vision, +movement speed, healing for Swarm units
├── Mutation: Towers can evolve mid-game into different forms
├── Spawn Larvae: All production comes from hatcheries
├── Regeneration: All Swarm units/structures heal over time on creep
└── Burrow: Units can hide underground, ambush enemies

BUILDING RULES
├── MUST build on creep (goo) - no exceptions!
├── Creep spreads slowly from Hatcheries and Creep Tumors
├── Losing creep source = buildings start dying
├── Buildings are cheap but fragile
└── Can recycle buildings back into resources

CREEP EXPANSION SYSTEM
├── Starting: Main Hatchery provides initial creep radius (15 tiles)
├── Creep Tumors: Cost 50 minerals, spread creep +8 tiles, 30s to mature
├── Expansion: Build new Hatchery on existing creep edge to expand
├── Speed: Creep spreads 1 tile per 5 seconds
├── Contested: Enemy buildings/units on creep slow its spread
└── Receding: If creep source destroyed, creep recedes slowly

COLOR PALETTE
├── Primary: Carapace purple (#4A0080), Flesh pink (#FF1493)
├── Creep: Toxic green goo (#39FF14), Slime (#7FFF00)
├── Accent: Bio-luminescent cyan (#00FFFF)
└── Blood: Alien orange (#FF4500)
```

### THE ETERNAL ASCENDANCY (Protoss-inspired)
**Playstyle:** Expensive but powerful, shields, psionic abilities
**Theme:** Ancient aliens, crystal technology, transcendent warriors

```
FACTION MECHANICS
├── PYLON POWER: Buildings must be in pylon power radius
│   ├── Pylons project power field (10 tile radius)
│   ├── Buildings outside field: Disabled, shields don't recharge
│   ├── Destroying pylons cripples enemy base
│   └── Pylons can be warped in (faster build if in existing field)
├── Shields: All units/buildings have regenerating shields
├── Warp-In: Build structures anywhere in power field (faster)
├── Chrono Boost: Speed up production/research temporarily
└── Recall: Teleport units back to base in emergency

BUILDING RULES
├── MUST build in pylon power field
├── Pylons are critical infrastructure (protect them!)
├── Buildings are expensive but tanky (shields + armor)
├── Warp-in is instant if in powered area
└── Structures have powerful abilities but high cost

COLOR PALETTE
├── Primary: Royal gold (#FFD700), Void purple (#6B21A8)
├── Shields: Electric blue (#00BFFF), Energy cyan (#00FFFF)
├── Crystal: Pink (#FF69B4), Teal (#008080)
└── Psi: Bright white glow (#FFFFFF)
```

### Faction Selection Screen
```
┌─────────────────────────────────────────────────────────────┐
│                    CHOOSE YOUR FACTION                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│   │   ⚙️ IRON   │  │  🦠 SWARM   │  │ 💎 ETERNAL │        │
│   │  DOMINION   │  │ COLLECTIVE  │  │ ASCENDANCY │        │
│   │             │  │             │  │             │        │
│   │  [Balanced] │  │[Aggressive] │  │  [Powerful] │        │
│   │             │  │             │  │             │        │
│   │ Build       │  │ Spread the  │  │ Pylon power │        │
│   │ anywhere    │  │ creep/goo   │  │ required    │        │
│   │             │  │ to expand   │  │             │        │
│   └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                              │
│   Difficulty:  ★☆☆        ★★☆          ★★★               │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Territory Control System (NEW!)

### Map Structure
```
MAP ZONES
├── Starting Base: Your main structure, lose this = game over
├── Expansion Points: Capturable resource nodes
├── Neutral Zones: Unclaimed territory, free to build
├── Contested Zones: Being fought over
├── Enemy Territory: Must destroy enemy presence to claim
└── Chokepoints: Strategic narrow passages

ZONE STATES
├── Controlled (Green): You own it, can build freely
├── Contested (Yellow): Active combat, limited building
├── Neutral (Gray): Unclaimed, first to build claims it
├── Enemy (Red): Must clear all enemy structures to claim
└── Corrupted (Purple): Special zones with hazards/bonuses
```

### Capturing Territory
```
CAPTURE MECHANICS
├── Build a structure in neutral zone = claim zone
├── Destroy all enemy structures in zone = contested
├── Build your structure in contested zone = claim zone
├── Zones provide resources, vision, and build space
└── Larger zones = more valuable but harder to defend

FACTION-SPECIFIC CAPTURE
├── Iron Dominion: Plant flag, structure lands from orbit
├── Swarm Collective: Spread creep into zone, then build
└── Eternal Ascendancy: Warp in pylon, then power other buildings
```

### Resources & Economy
```
RESOURCES
├── Minerals: Primary resource, gathered from nodes
│   ├── Starting: 500
│   ├── Passive income: 10/second from main base
│   └── Expansion bonus: +5/second per controlled zone
├── Gas (Advanced): Secondary resource for upgrades
│   ├── Starting: 0
│   ├── Requires: Refinery/Extractor/Assimilator on gas node
│   └── Used for: Tier 3+ structures, upgrades, abilities
└── Supply: Unit/structure cap
    ├── Starting: 10/15 (varies by faction)
    ├── Increase: Build supply structures
    └── Max: 200

ECONOMY BUILDINGS
├── Iron Dominion: Command Center, Refinery, Supply Depot
├── Swarm Collective: Hatchery, Extractor, Overlord (mobile supply)
└── Eternal Ascendancy: Nexus, Assimilator, Pylon (power + supply)
```

### Map Example
```
┌────────────────────────────────────────────────────────────────┐
│                         CONQUEST MAP                            │
│                                                                  │
│     [ENEMY BASE]              [Gas]              [ENEMY BASE]   │
│         🔴                      ⛽                    🔴          │
│          │                       │                     │         │
│          ▼                       ▼                     ▼         │
│     ┌─────────┐            ┌─────────┐           ┌─────────┐   │
│     │ ZONE A  │────────────│ ZONE B  │───────────│ ZONE C  │   │
│     │ [Mine]  │            │[Central]│           │ [Mine]  │   │
│     └────┬────┘            └────┬────┘           └────┬────┘   │
│          │                      │                     │         │
│          │      ┌─────────┐     │     ┌─────────┐    │         │
│          └──────│ ZONE D  │─────┴─────│ ZONE E  │────┘         │
│                 │  [Gas]  │           │  [Gas]  │              │
│                 └────┬────┘           └────┬────┘              │
│                      │                     │                    │
│                      ▼                     ▼                    │
│                 ┌─────────┐           ┌─────────┐              │
│                 │ ZONE F  │───────────│ ZONE G  │              │
│                 │ [Mine]  │           │ [Mine]  │              │
│                 └────┬────┘           └────┬────┘              │
│                      │                     │                    │
│                      ▼                     ▼                    │
│                [YOUR BASE]           [YOUR BASE]                │
│                    🟢                     🟢                     │
│                 (1v1 or 2v2 starting positions)                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 5. Victory Conditions (NEW!)

### Conquest Mode (Primary)
```
WIN CONDITIONS
├── Destroy enemy main base (Command Center/Hatchery/Nexus)
├── Control 75% of map zones for 5 minutes
└── Enemy surrenders

LOSE CONDITIONS
├── Your main base is destroyed
├── Enemy controls 75% of map for 5 minutes
└── You surrender
```

### Defense Mode (Classic Tower Defense)
```
WIN CONDITIONS
├── Survive all waves
├── Destroy the final boss
└── Protect your base HP (starts at 20)

LOSE CONDITIONS
├── Base HP reaches 0
└── Main structure destroyed
```

### Skirmish Mode (Quick Games)
```
VARIANTS
├── King of the Hill: Control center zone longest wins
├── Resource Race: First to 10,000 minerals wins
├── Annihilation: Destroy all enemy structures
└── Timed: Most territory when timer ends wins
```

---

## 6. Tech Stack (Next-Gen Focus)

| Component | Technology | Why |
|-----------|------------|-----|
| **3D Engine** | Three.js r160+ | Flexibility for custom shaders |
| **Rendering** | WebGL 2.0 + WebGPU fallback | Next-gen graphics capabilities |
| **Particles** | Custom GPGPU + Instanced Meshes | 100,000+ particles at 60fps |
| **Post-Processing** | Custom Pipeline | Bloom, chromatic aberration, film grain |
| **Physics** | Rapier.js (WASM) | Fast collision for projectiles |
| **State** | Zustand | Lightweight, perfect for games |
| **UI** | React + Framer Motion | Buttery animations |
| **Audio** | Tone.js + Howler.js | Spatial audio, synth effects |
| **Mobile** | Hammer.js + Custom Gestures | Touch-first design |

### Next-Gen Visual Features
```
RENDERING PIPELINE
├── HDR Rendering with tone mapping
├── Physically Based Rendering (PBR)
├── Screen-Space Reflections (SSR)
├── Volumetric lighting (god rays through nebula)
├── Chromatic aberration on impacts
├── Motion blur on fast projectiles
├── Depth of field (focus on action)
└── Film grain + scanlines (optional retro mode)

SHADER EFFECTS
├── Holographic UI elements
├── Force field distortion
├── Warp/teleport dissolve
├── Energy shield impacts
├── Plasma trail shaders
└── Bioluminescent pulse
```

---

## 4. Heroes System (NEW!)

### Overview
Heroes are **player-controlled units** that can move freely around the map. Tap/click to select, tap/click destination to move. Each hero has unique abilities on cooldowns.

### Hero Roster

#### Captain Zara "Starblade" Nova
**Role:** Melee Brawler | **Difficulty:** Easy
```
STATS
├── Health: 800
├── Damage: 45/hit
├── Attack Speed: 1.2/s
├── Movement: Fast
└── Range: Melee

ABILITIES
├── [Q] Plasma Dash - Dash forward, damaging enemies in path (8s cooldown)
├── [W] Nova Shield - Block 200 damage for 3s (15s cooldown)
└── [R] SUPERNOVA - Massive AOE explosion, stuns all nearby (45s cooldown)

VISUAL
├── Armor: Sleek chrome with pink energy lines
├── Weapon: Dual plasma katanas
├── Particles: Pink energy trails, star bursts on hit
└── Idle: Katanas spin and glow
```

#### Professor Wobblesworth III
**Role:** Support Mage | **Difficulty:** Medium
```
STATS
├── Health: 400
├── Damage: 25/hit
├── Attack Speed: 0.8/s
├── Movement: Medium
└── Range: Long

ABILITIES
├── [Q] Gravity Bubble - Slows enemies in area by 50% (10s cooldown)
├── [W] Repair Drone - Heals nearest tower for 200 HP (20s cooldown)
└── [R] BLACK HOLE - Sucks in all enemies for 4s, then explodes (60s cooldown)

VISUAL
├── Appearance: Floating brain-octopus in a jar with robot legs
├── Weapon: Psychic energy blasts
├── Particles: Purple mind waves, floating equations
└── Idle: Tentacles tap chin thoughtfully, monocle gleams
```

#### B.O.R.I.S. (Big Orbital Riot Infantry System)
**Role:** Tank | **Difficulty:** Easy
```
STATS
├── Health: 1500
├── Damage: 80/hit
├── Attack Speed: 0.5/s
├── Movement: Slow
└── Range: Short

ABILITIES
├── [Q] Rocket Punch - Launches fist, knockback on hit (6s cooldown)
├── [W] Fortress Mode - Immobile but +100% damage, +50% armor (12s cooldown)
└── [R] ORBITAL DROP - Calls down satellite strike on location (50s cooldown)

VISUAL
├── Appearance: Chunky Soviet-style mech with a smiley face screen
├── Weapon: Giant robot fists
├── Particles: Steam vents, sparks, screen emojis
└── Idle: Does little robot dance, screen shows :D
```

#### Glitch the Unstable
**Role:** Assassin | **Difficulty:** Hard
```
STATS
├── Health: 300
├── Damage: 120/hit (backstab: 300)
├── Attack Speed: 0.6/s
├── Movement: Very Fast
└── Range: Melee

ABILITIES
├── [Q] Phase Shift - Become invisible for 3s, next attack crits (8s cooldown)
├── [W] Glitch Bomb - Teleport to location, leave damage zone (10s cooldown)
└── [R] SYSTEM CRASH - Instantly kill enemy below 20% HP (30s cooldown)

VISUAL
├── Appearance: Corrupted hologram ninja, constantly flickering
├── Weapon: Digital daggers that pixelate
├── Particles: Glitch artifacts, scan lines, data streams
└── Idle: Randomly teleports short distances, leaves afterimages
```

#### Mama Moonbeam
**Role:** Healer | **Difficulty:** Medium
```
STATS
├── Health: 500
├── Damage: 15/hit
├── Attack Speed: 1.0/s
├── Movement: Medium
└── Range: Medium

ABILITIES
├── [Q] Healing Ray - Channel beam that heals hero/tower 50 HP/s (5s cooldown)
├── [W] Cosmic Shield - Give target 3s of invulnerability (25s cooldown)
└── [R] RESURRECTION - Revive all dead soldiers from barracks (90s cooldown)

VISUAL
├── Appearance: Glowing space grandma made of starlight
├── Weapon: Knitting needles that shoot moonbeams
├── Particles: Stars, hearts, cookie crumbs (yes, really)
└── Idle: Knits a tiny sweater, hums space lullaby
```

### Hero Controls

**Desktop:**
- Click hero portrait or press 1-5 to select
- Right-click to move
- Q/W/R for abilities
- Space to cycle heroes

**Mobile:**
- Tap hero portrait to select
- Tap location to move
- Ability buttons on screen (context-sensitive)
- Double-tap hero to center camera

---

## 9. Faction-Specific Towers (UPDATED!)

Each faction has unique towers that fit their playstyle and mechanics.

### IRON DOMINION TOWERS

| Tower | Cost | Role | Damage | Range | Special |
|-------|------|------|--------|-------|---------|
| **Bunker** | 100 | Defense | 15×4 marines | Medium | Load/unload infantry, +armor |
| **Siege Tank** | 250 | Artillery | 80 splash | Long | Siege mode: +100% dmg, immobile |
| **Missile Turret** | 150 | Anti-Air/DPS | 25 rapid | Medium | Detects hidden units |
| **Sensor Tower** | 100 | Utility | 0 | Huge | Reveals map area, detects enemies |
| **Battlecruiser Platform** | 500 | Ultimate | 200 beam | Long | Yamato Cannon ability |

```
IRON DOMINION UPGRADES
├── Bunker → Fortress (adds auto-repair, +2 capacity)
├── Siege Tank → Thor Platform (walking mech, dual cannons)
├── Missile Turret → Planetary Defense Grid (chains to nearby turrets)
└── Battlecruiser → Hyperion Command (calls orbital strikes)

SPECIAL ABILITY: MULE Drop
├── Cost: 50 minerals
├── Effect: Drops mining robot for 30s burst of minerals
└── Cooldown: 60s
```

### SWARM COLLECTIVE TOWERS (Require Creep!)

| Tower | Cost | Role | Damage | Range | Special |
|-------|------|------|--------|-------|---------|
| **Spine Crawler** | 75 | Melee DPS | 40 pierce | Short | Can uproot and move on creep |
| **Spore Crawler** | 75 | Anti-Air | 30 acid | Medium | Detects hidden, slows flyers |
| **Sunken Colony** | 100 | AOE | 50 splash | Medium | Acid pool on death |
| **Nydus Worm** | 200 | Utility | 0 | Map-wide | Teleport units between worms |
| **Bile Launcher** | 300 | Siege | 150 corrosive | Very Long | Melts armor, damages over time |

```
SWARM COLLECTIVE UPGRADES (MUTATIONS)
├── Spine Crawler → Impaler (ranged spines, +50% damage)
├── Spine Crawler → Lurker Den (spawns burrowed lurkers)
├── Spore Crawler → Parasite Spewer (infected enemies fight for you)
├── Sunken Colony → Baneling Nest (spawns suicide bombers)
└── Bile Launcher → Leviathan Maw (massive AOE, destroys buildings)

CRITICAL: CREEP BUILDINGS
├── Hatchery: Main base, spawns larvae, creep source (15 tile radius)
├── Creep Tumor: Cheap, spreads creep +8 tiles, can spawn 1 more tumor
├── Extractor: Gas harvesting (must be on gas node ON creep)
└── Evolution Chamber: Unlocks mutations/upgrades

CREEP STRATEGY
├── Early Game: Spam creep tumors to expand quickly
├── Mid Game: Secure expansion hatcheries
├── Late Game: Creep highways for fast unit movement
└── Defense: Losing creep = losing vision + buildings die
```

### ETERNAL ASCENDANCY TOWERS (Require Pylon Power!)

| Tower | Cost | Role | Damage | Range | Special |
|-------|------|------|--------|-------|---------|
| **Photon Cannon** | 150 | DPS | 35 energy | Medium | Shield + HP, auto-targets |
| **Shield Battery** | 100 | Support | 0 (heals) | Short | Restores shields to nearby |
| **Khaydarin Monolith** | 300 | Heavy DPS | 100 beam | Long | Charges up, devastating blast |
| **Stasis Ward** | 150 | Utility | 0 | Medium | Freezes enemies in time bubble |
| **Templar Archives** | 400 | Ultimate | Psi Storm | Huge | Casts psi storm, feedback |

```
ETERNAL ASCENDANCY UPGRADES
├── Photon Cannon → Colossus Walker (mobile, thermal lances)
├── Shield Battery → Nexus Shield (projects shield over whole area)
├── Khaydarin Monolith → Void Ray Platform (stacking damage beam)
└── Templar Archives → Archon Sanctum (merges units into archons)

CRITICAL: PYLON POWER
├── Pylon: Power field (10 tile radius), also provides supply
├── All buildings MUST be in pylon field to function
├── No power = buildings disabled, shields don't regenerate
├── Strategy: Protect pylons, chain power fields carefully
└── Warp Prism (mobile pylon) available for aggressive play

SPECIAL ABILITY: Chrono Boost
├── Cost: 25 minerals
├── Effect: Selected building works 50% faster for 20s
└── Cooldown: 30s per pylon
```

### Tower Comparison Chart

```
                    IRON DOMINION    SWARM COLLECTIVE    ETERNAL ASCENDANCY
────────────────────────────────────────────────────────────────────────────
Build Requirement   Territory        CREEP (goo)         PYLON POWER
Building Speed      Slow             Fast                Instant (warp)
Building Cost       Medium           Cheap               Expensive
Building HP         High             Low                 Medium + Shields
Mobility            Some can lift    Can uproot/move     Stationary
Special             Siege modes      Mutations           Abilities
Weakness            Slow to adapt    Fragile, needs goo  Pylon dependency
────────────────────────────────────────────────────────────────────────────
```

---

## 10. Classic Towers (Neutral/Defense Mode)

For classic tower defense mode, these faction-neutral towers are available:

### Base Towers (Tier 1-3)

| Tower | Role | Damage | Speed | Range | Special |
|-------|------|--------|-------|-------|---------|
| **Plasma Spire** | Energy DPS | 30 plasma | 1.0/s | Medium | Ignores armor |
| **Rail Cannon** | Kinetic DPS | 45 kinetic | 0.7/s | Long | Pierces 2 enemies |
| **Clone Bay** | Blockers | 20 melee | 1.2/s | Short | Spawns 3 space marines |
| **Nova Launcher** | AOE | 70 explosive | 0.4/s | Medium | Splash + burn |

### Tier 4 Branching Upgrades

```
PLASMA SPIRE
├── Path A: "Void Siphon"
│   ├── Fires beam that drains HP and gives to nearby tower
│   ├── Special: Enemies killed explode into mini black holes
│   └── Ultimate: "ENTROPY CASCADE" - Chain reaction across all enemies
│
└── Path B: "Prismatic Array"
    ├── Shoots rainbow laser that applies random debuffs
    ├── Special: Chance to charm enemy to fight for you
    └── Ultimate: "DISCO INFERNO" - Rave mode, all towers +50% speed

RAIL CANNON
├── Path A: "Singularity Rifle"
│   ├── Shots create gravity wells that pull enemies
│   ├── Special: Charged shot (3s) does 500% damage
│   └── Ultimate: "BIG BANG" - One shot, infinite pierce, map-wide
│
└── Path B: "Swarm Launcher"
    ├── Fires cluster of 8 homing micro-missiles
    ├── Special: Missiles leave fire trails
    └── Ultimate: "ROCKET PARTY" - 100 missiles everywhere

CLONE BAY
├── Path A: "Mecha Squad"
│   ├── Spawns 2 mini-mechs with jetpacks
│   ├── Special: Mechs explode on death (friendly fire safe)
│   └── Ultimate: "VOLTRON MODE" - Mechs combine into mega-mech
│
└── Path B: "Xenomorph Den"
    ├── Spawns 4 fast alien dogs that poison
    ├── Special: Dogs multiply when they kill
    └── Ultimate: "QUEEN'S WRATH" - Spawn alien queen boss ally

NOVA LAUNCHER
├── Path A: "Supernova Core"
│   ├── Explosions leave radiation zones
│   ├── Special: Bigger boom radius over time
│   └── Ultimate: "STELLAR COLLAPSE" - Sun-sized explosion
│
└── Path B: "Cryo Comet"
    ├── Freezing shots, slows to 10%
    ├── Special: Frozen enemies shatter on death, AOE damage
    └── Ultimate: "ICE AGE" - Freeze entire map for 5s
```

### Tower Visual Design

| Tower | Colors | Shape | Particles |
|-------|--------|-------|-----------|
| Plasma Spire | Cyan + pink energy | Floating crystal obelisk | Energy spirals, data streams |
| Rail Cannon | Gunmetal + orange heat | Massive industrial barrel | Smoke rings, heat distortion |
| Clone Bay | Green goo + chrome | Organic tubes + vats | Bubbles, DNA helixes, sparks |
| Nova Launcher | Red + yellow + black | Chunky missile platform | Fire trails, warning lights |

---

## 6. Enemies: The Void Horde

### Standard Creatures

| Name | HP | Speed | Armor | Special | Reward | Visual |
|------|-----|-------|-------|---------|--------|--------|
| **Blobbert** | 60 | Fast | 0 | Splits into 2 mini-blobs on death | 3 | Jiggly green cube with googly eyes |
| **Zappy McZapface** | 100 | Normal | 0 | Teleports short distances randomly | 8 | Electric jellyfish with a tiny hat |
| **Chonkzilla** | 400 | Slow | 30 | Immune to knockback | 20 | Absolute unit of a space turtle |
| **Sir Scuttles** | 80 | Very Fast | 5 | Dodges every 3rd shot | 10 | Crab with monocle and top hat |
| **Floofernaut** | 150 | Normal | 0 | Flying, leaves damaging farts | 15 | Fluffy cloud alien with tiny wings |
| **Grumplord** | 250 | Slow | 20 | Buffs nearby enemies +25% damage | 25 | Big grumpy face on legs |
| **Wormothy** | 300 | Normal | 10 | Burrows underground, resurfaces | 18 | Gentleman worm with bow tie |
| **Mimicron** | 120 | Normal | 0 | Copies nearest tower's attack | 30 | Shifty cube that transforms |
| **The Ungrateful Eight** | 80x8 | Fast | 0 | 8 tiny aliens in trenchcoat | 40 | Literally 8 smol aliens stacked |
| **Goopzilla** | 600 | Very Slow | 40 | Leaves slime trail that slows towers | 35 | Giant adorable slime kaiju |

### Mini-Boss Enemies (Every 5 Waves)

**Captain Tentaclés (Wave 5)**
- HP: 2000 | Armor: 15
- Abilities: Ink cloud (obscures vision), Tentacle swipe (AOE)
- Visual: Fancy French octopus with beret and cigarette holder

**DJ Destructo (Wave 10)**
- HP: 3500 | Armor: 10
- Abilities: Drop the bass (shockwave), Sick beats (speeds up all enemies)
- Visual: Robot DJ booth with speakers for arms

**The Commodity (Wave 15)**
- HP: 5000 | Armor: 25
- Abilities: Hostile takeover (disables tower), Market crash (steals gold)
- Visual: Evil corporate cube in a suit with briefcase

### FINAL BOSSES

**KING BLORBULOUS THE MAGNIFICENT**
```
PHASE 1 (100-60% HP)
├── HP: 20,000 | Armor: 30
├── Attack: Belly flop (massive AOE)
├── Summons: Spawns Blobberts from body
└── Visual: Enormous blob king with tiny crown, constantly giggling

PHASE 2 (60-30% HP)
├── Splits into 4 "Blorb Princes"
├── Each prince has 3000 HP
├── Must kill all 4 to continue
└── Visual: Four medium blobs arguing over the crown

PHASE 3 (30-0% HP)
├── Reforms as "MEGA BLORBULOUS"
├── HP: 8000 | Armor: 0 | Speed: Fast
├── Attack: Rolling rampage
└── Visual: Angry determined blob, crown fused to head, anime speed lines
```

**EMPRESS VOID'THULOX**
```
PHASE 1: "The Arrival" (100-70% HP)
├── HP: 30,000 | Armor: 40 | Magic Resist: 40
├── Attack: Void beams from eyes
├── Summons: Portals spawn random enemies
└── Visual: Cosmic horror goddess, beautiful and terrifying

PHASE 2: "The Hunger" (70-40% HP)
├── Consumes dead enemies to heal
├── Creates void zones that damage towers
├── Disable one hero randomly for 10s
└── Visual: Mouth opens revealing galaxy inside

PHASE 3: "The End" (40-0% HP)
├── Screen goes dark, only enemy eyes visible
├── All towers fire blindly (reduced accuracy)
├── Players must use hero abilities to reveal
└── Visual: Reality breaking apart, cosmic horror fully revealed
```

---

## 7. Visual Style Guide: Next-Gen Space Fantasy

### Art Direction

```
CORE AESTHETIC: "Neon Cosmos"
├── Style: Stylized PBR with emissive materials
├── Proportions: Chunky, readable silhouettes
├── Lighting: HDR, volumetric, lots of glow
├── Effects: Over-the-top, screen-filling particles
└── Feel: A Saturday morning cartoon set in a prog rock album cover
```

### Shader Library

**Holographic UI Shader**
```glsl
// Animated scan lines + chromatic offset
vec3 holoEffect(vec2 uv, float time) {
    float scanline = sin(uv.y * 200.0 + time * 5.0) * 0.1;
    float chromatic = 0.003;
    vec3 color;
    color.r = texture2D(tex, uv + vec2(chromatic, 0)).r;
    color.g = texture2D(tex, uv).g;
    color.b = texture2D(tex, uv - vec2(chromatic, 0)).b;
    return color + scanline;
}
```

**Energy Shield Shader**
```glsl
// Fresnel glow with hex pattern
float shield(vec3 normal, vec3 viewDir, vec2 uv, float time) {
    float fresnel = pow(1.0 - dot(normal, viewDir), 3.0);
    float hex = hexPattern(uv * 10.0);
    float pulse = sin(time * 3.0) * 0.5 + 0.5;
    return fresnel * hex * pulse;
}
```

**Void Corruption Shader**
```glsl
// Animated darkness tendrils
vec3 voidEffect(vec2 uv, float time) {
    float noise = fbm(uv * 3.0 + time * 0.5);
    vec3 voidColor = mix(vec3(0.1, 0.0, 0.2), vec3(0.3, 0.0, 0.5), noise);
    float tendrils = smoothstep(0.4, 0.6, noise);
    return voidColor * tendrils;
}
```

### Post-Processing Stack

```
ALWAYS ON
├── HDR Tone Mapping (ACES Filmic)
├── Bloom (threshold: 0.8, intensity: 1.5)
├── Vignette (subtle, 0.3)
└── Color Grading (vibrant, +10 saturation)

ON IMPACT/ABILITY
├── Chromatic Aberration (intensity: 0.02, 0.1s duration)
├── Screen Shake (configurable)
└── Time Dilation (slow-mo on big hits)

OPTIONAL (User Toggle)
├── Film Grain
├── Scan Lines (retro mode)
├── CRT Curve (retro mode)
└── Motion Blur
```

---

## 8. Mobile Optimization

### Touch Controls

```
GESTURES
├── Single Tap: Select / Place tower / Move hero
├── Double Tap: Center camera on hero
├── Drag: Pan camera
├── Pinch: Zoom in/out
├── Long Press: Open context menu (upgrade/sell)
└── Two-finger tap: Pause game

HERO CONTROLS (MOBILE)
├── Drag from hero to location: Move
├── Tap ability button: Activate ability
├── Hold ability button: Show range/preview
└── Swipe between hero portraits: Quick switch
```

### Responsive UI Layout

```
DESKTOP (16:9)
┌────────────────────────────────────────────────────┐
│ [Lives] [Gold] [Wave]              [Speed] [Pause] │
│                                                     │
│                    GAME AREA                        │
│                                                     │
│ [Hero1][Hero2][Hero3][Hero4][Hero5]                │
│                                    [Tower Menu →]  │
└────────────────────────────────────────────────────┘

MOBILE PORTRAIT (9:16)
┌──────────────────────┐
│ [Lives][Gold][Wave]  │
│ [Speed][Pause]       │
│                      │
│      GAME AREA       │
│                      │
│                      │
│ ┌──────────────────┐ │
│ │ [Hero Abilities] │ │
│ │ [Q] [W] [R]      │ │
│ └──────────────────┘ │
│ [H1][H2][H3][H4][H5] │
│ [Tower Menu ↑↑↑↑↑↑]  │
└──────────────────────┘

MOBILE LANDSCAPE (16:9 but smaller)
┌────────────────────────────────────────┐
│[♥][G][W]            [▶][⏸]            │
│                                        │
│ [Q]       GAME AREA              [🗼]  │
│ [W]                              [🗼]  │
│ [R]                              [🗼]  │
│                                  [🗼]  │
│ [H1][H2][H3][H4][H5]                   │
└────────────────────────────────────────┘
```

### Performance Tiers

```
TIER 1: POTATO MODE (Low-end mobile)
├── Resolution: 720p or lower
├── Particles: 5,000 max
├── Shadows: Off
├── Post-processing: Bloom only
├── Target: 30 FPS
└── LOD: Aggressive

TIER 2: STANDARD (Mid-range)
├── Resolution: 1080p
├── Particles: 25,000 max
├── Shadows: Low quality
├── Post-processing: Bloom + vignette
├── Target: 60 FPS
└── LOD: Normal

TIER 3: ULTRA (Desktop/High-end mobile)
├── Resolution: Native (up to 4K)
├── Particles: 100,000 max
├── Shadows: High quality + soft
├── Post-processing: Full stack
├── Target: 60+ FPS
└── LOD: Maximum detail

AUTO-DETECTION
├── Check GPU via WebGL extensions
├── Run benchmark on first load
├── Allow manual override in settings
└── Dynamic adjustment if FPS drops
```

### Mobile-Specific Optimizations

```
RENDERING
├── Texture atlasing (reduce draw calls)
├── Instanced rendering for particles
├── Aggressive frustum culling
├── Lower poly models on mobile
└── Compressed textures (ASTC/ETC2)

MEMORY
├── Object pooling for all entities
├── Unload off-screen assets
├── Stream level assets progressively
└── Cap at 300MB heap

BATTERY
├── Reduce update frequency when paused
├── Lower frame rate option (30fps mode)
├── Pause rendering when tab/app hidden
└── Avoid constant shader compilation
```

---

## 9. Project Structure (Updated)

```
/TowerDefense
├── /public
│   └── /assets
│       ├── /models
│       │   ├── /towers      # glTF tower models
│       │   ├── /enemies     # glTF enemy models
│       │   ├── /heroes      # glTF hero models
│       │   └── /environment # Maps, props
│       ├── /textures
│       │   ├── /pbr         # Albedo, normal, roughness, emissive
│       │   └── /particles   # Particle sprites
│       ├── /audio
│       │   ├── /sfx         # Sound effects
│       │   └── /music       # Background tracks
│       └── /fonts
├── /src
│   ├── /core
│   │   ├── Game.ts
│   │   ├── SceneManager.ts
│   │   ├── InputManager.ts      # Desktop input
│   │   ├── TouchManager.ts      # Mobile input (NEW)
│   │   ├── AudioManager.ts
│   │   └── PerformanceManager.ts # Auto-quality (NEW)
│   │
│   ├── /ecs
│   │   ├── /components
│   │   │   ├── Transform.ts
│   │   │   ├── Health.ts
│   │   │   ├── Tower.ts
│   │   │   ├── Enemy.ts
│   │   │   ├── Hero.ts          # NEW
│   │   │   ├── Abilities.ts     # NEW
│   │   │   └── ...
│   │   ├── /systems
│   │   │   ├── HeroControlSystem.ts   # NEW
│   │   │   ├── AbilitySystem.ts       # NEW
│   │   │   ├── MovementSystem.ts
│   │   │   ├── TargetingSystem.ts
│   │   │   └── ...
│   │   └── World.ts
│   │
│   ├── /entities
│   │   ├── /towers
│   │   ├── /enemies
│   │   ├── /heroes             # NEW
│   │   │   ├── HeroFactory.ts
│   │   │   ├── CaptainZara.ts
│   │   │   ├── ProfessorWobblesworth.ts
│   │   │   ├── Boris.ts
│   │   │   ├── Glitch.ts
│   │   │   └── MamaMoonbeam.ts
│   │   └── /projectiles
│   │
│   ├── /graphics
│   │   ├── /shaders
│   │   │   ├── pbr.vert/.frag
│   │   │   ├── holographic.frag
│   │   │   ├── shield.frag
│   │   │   ├── void.frag
│   │   │   └── /gpgpu
│   │   ├── /particles
│   │   │   ├── GPGPUParticles.ts
│   │   │   └── /presets
│   │   │       ├── plasma.ts
│   │   │       ├── explosion.ts
│   │   │       ├── warp.ts
│   │   │       ├── void.ts
│   │   │       └── ...
│   │   ├── /effects
│   │   │   ├── PostProcessing.ts
│   │   │   ├── Bloom.ts
│   │   │   ├── ChromaticAberration.ts
│   │   │   └── ScreenShake.ts
│   │   └── QualityManager.ts    # NEW - LOD, quality tiers
│   │
│   ├── /ui
│   │   ├── /components
│   │   │   ├── HUD.tsx
│   │   │   ├── HeroPanel.tsx    # NEW
│   │   │   ├── AbilityBar.tsx   # NEW
│   │   │   ├── TowerMenu.tsx
│   │   │   └── ...
│   │   ├── /screens
│   │   └── /mobile              # NEW
│   │       ├── TouchHUD.tsx
│   │       ├── VirtualJoystick.tsx
│   │       └── MobileMenu.tsx
│   │
│   ├── /data
│   │   ├── towers.json
│   │   ├── enemies.json
│   │   ├── heroes.json          # NEW
│   │   └── waves.json
│   │
│   └── /utils
│       ├── objectPool.ts
│       ├── deviceDetection.ts   # NEW
│       └── ...
│
├── package.json
└── vite.config.ts
```

---

## 10. Development Phases (Updated)

### Phase 1: Foundation (Weeks 1-3)
- Project scaffolding
- Three.js scene with PBR pipeline
- Basic ECS framework
- Input system (desktop + touch)
- Device detection and quality tiers

### Phase 2: Core Gameplay (Weeks 4-6)
- Path system
- Enemy spawning and movement
- Tower placement
- Basic combat loop
- Win/lose conditions

### Phase 3: Hero System (Weeks 7-9) **NEW**
- Hero movement and controls
- Ability system with cooldowns
- All 5 heroes implemented
- Hero UI (selection, abilities)
- Mobile hero controls

### Phase 4: Tower System (Weeks 10-12)
- All 4 base towers
- Upgrade paths (Tier 1-4)
- Special and ultimate abilities
- Tower UI

### Phase 5: Enemy Variety (Weeks 13-15)
- All 10 standard enemies
- Mini-bosses
- Final bosses with phases
- Status effects

### Phase 6: Visual Polish (Weeks 16-19)
- PBR materials and lighting
- All shaders (holographic, shield, void)
- Particle system + all presets
- Post-processing stack
- Performance optimization pass

### Phase 7: UI/UX (Weeks 20-22)
- Desktop UI
- Mobile UI (responsive)
- Menus and screens
- Audio implementation
- Haptic feedback (mobile)

### Phase 8: Content & Polish (Weeks 23-26)
- 8+ levels across different space environments
- Wave balancing
- Economy tuning
- Cross-platform testing
- Performance final pass
- Launch prep

---

## 11. Performance Targets

| Metric | Desktop | Mobile |
|--------|---------|--------|
| Frame Rate | 60+ FPS | 30-60 FPS |
| Load Time | < 3s | < 5s |
| Bundle Size | < 3MB | < 3MB |
| Memory | < 500MB | < 300MB |
| Particles | 100K | 5K-25K |

---

## 12. Inspirations

- **Kingdom Rush** - Core tower defense mechanics, upgrade paths
- **Destiny 2** - Space fantasy aesthetic, chunky guns
- **Guardians of the Galaxy** - Colorful space, humor
- **Transistor** - Neon colors, beautiful particle effects
- **Hades** - Snappy combat feel, character personality
- **Monument Valley** - Clean mobile UI, touch-first design

---

*Document Updated: 2026-01-30*
*Game Codename: COSMIC CHAOS*
*Platforms: Desktop + Mobile*
