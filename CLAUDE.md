# COSMIC CHAOS - Developer Guide

## Quick Reference

```bash
npm run dev      # Start dev server at localhost:5173
npm run build    # Production build
npm run preview  # Preview production build
```

---

## Architecture Overview

### State Flow
```
User Input → InputManager → GameManager → Systems → Store → Renderers → Three.js
                                ↓
                           WaveManager
                                ↓
                          EnemyFactory
```

### Update Loop (60fps)
```typescript
GameManager.update(delta):
  1. WaveManager.update()      // Spawn enemies
  2. EnemyMovementSystem()     // Move + teleport + burrow
  3. EnemyHealthSystem()       // Check deaths, split
  4. TowerTargetingSystem()    // Acquire targets
  5. TowerAttackSystem()       // Fire projectiles
  6. ProjectileSystem()        // Move + hit detection
  7. HeroMovementSystem()      // Click-to-move
  8. HeroAbilitySystem()       // Cooldowns + activation
  9. HeroCombatSystem()        // Auto-attack
  10. checkWinCondition()      // Victory check
```

---

## Key Files

### Core
| File | Purpose |
|------|---------|
| `Game.tsx` | Main R3F component, mounts all renderers |
| `GameManager.ts` | Orchestrates update loop |
| `WaveManager.ts` | Wave spawning, auto-progression |
| `AudioManager.ts` | Howler.js wrapper, spatial audio |
| `SynthAudio.ts` | Web Audio API sound generation |

### Stores (Zustand)
| Store | Contents |
|-------|----------|
| `gameStore.ts` | Enemies, towers, hero, currency, lives, waves |
| `effectsStore.ts` | Screen shake, chromatic aberration triggers |

### Systems
| System | Responsibilities |
|--------|------------------|
| `EnemyMovementSystem` | Path following, teleport (Zappy), burrow (Wormothy) |
| `EnemyHealthSystem` | Damage calculation, armor, dodge, split on death |
| `TowerTargetingSystem` | Find targets in range, priority: furthest along path |
| `TowerAttackSystem` | Fire rate, projectile spawning |
| `ProjectileSystem` | Homing, splash damage |
| `HeroMovementSystem` | Right-click movement |
| `HeroAbilitySystem` | Q/W/R abilities, cooldowns |
| `HeroCombatSystem` | Auto-attack nearest enemy |

---

## Entity Types

### Enemies
```typescript
type EnemyType =
  | 'blobbert'      // Splits on death
  | 'sirScuttles'   // Dodges 33%
  | 'chonkzilla'    // 25% armor, no knockback
  | 'floofernaut'   // Flying, damage trail
  | 'zappyMcZapface' // Teleports
  | 'wormothy'      // Burrows
```

### Towers
```typescript
type TowerType = 'plasmaSpire' | 'railCannon' | 'novaLauncher'
type TowerTier = 1 | 2 | 3 | '4A' | '4B'
```

### Heroes
```typescript
type HeroType =
  | 'captainZara'        // Brawler
  | 'professorWobblesworth' // Support
  | 'boris'              // Tank
  | 'glitch'             // Assassin
  | 'mamaMoonbeam'       // Healer
```

---

## Adding New Content

### New Enemy Type
1. Add to `src/data/enemies.json`:
```json
{
  "type": "newEnemy",
  "name": "New Enemy",
  "stats": { "maxHealth": 100, "speed": 3, ... },
  "behaviors": { "canTeleport": true, ... }
}
```
2. Add type to `EnemyType` union in `types/index.ts`
3. Add visual in `EnemyRenderer.tsx`
4. Add behavior logic in `EnemyMovementSystem.ts` / `EnemyHealthSystem.ts`

### New Tower
1. Add to `src/data/towers.json` with upgrade paths
2. Add type to `TowerType` union
3. Add visual in `TowerRenderer.tsx`
4. Add tier 4 special effects if needed

### New Hero
1. Add to `src/data/heroes.json` with abilities
2. Add type to `HeroType` union
3. Add visual in `HeroRenderer.tsx`
4. Add ability effects in `HeroAbilitySystem.ts`

---

## Visual Effects

### Particle System
```typescript
import { emitParticles } from './graphics/ParticleSystem'

emitParticles({
  position: { x: 0, y: 0, z: 0 },
  count: 50,
  color: '#ff006e',
  speed: 5,
  size: 0.1,
  lifetime: 1
})
```

### Screen Effects
```typescript
import { useEffectsStore } from './stores/effectsStore'

// Trigger effects
useEffectsStore.getState().triggerEnemyDeathEffect()
useEffectsStore.getState().triggerUltimateEffect()
useEffectsStore.getState().triggerImpactEffect()
```

### Floating Text
```typescript
window.dispatchEvent(new CustomEvent('floatingText', {
  detail: {
    text: '-50',
    position: { x: 0, y: 1, z: 0 },
    type: 'damage' // 'damage' | 'gold' | 'heal' | 'critical'
  }
}))
```

---

## Audio

### Playing Sounds
```typescript
import { AudioManager } from './core/AudioManager'

AudioManager.getInstance().playTowerFire('plasmaSpire', position)
AudioManager.getInstance().playEnemyDeath('blobbert', position)
AudioManager.getInstance().playAbility('captainZara', 'R')
AudioManager.getInstance().playUISound('click')
```

### Sound Types (Generated)
- `laser` - Sawtooth pitch sweep
- `explosion` - Noise + filter sweep
- `zap` - Square/sine blend
- `chord` - Harmonics + reverb
- `blip` - Short sine
- `fanfare` - Major arpeggio

---

## Color Palette

```css
/* Neon Cosmos Theme */
--cosmic-pink: #ff006e;
--electric-blue: #3a86ff;
--toxic-green: #39ff14;
--neon-purple: #8338ec;
--stellar-yellow: #ffbe0b;
--void-dark: #0a0a1a;
```

---

## Performance Tips

1. **Particles**: Use `emitParticles` sparingly, max 15k total
2. **Enemies**: Object pooling handled in store
3. **Projectiles**: Removed on impact automatically
4. **Effects**: Chromatic aberration is expensive, 0.1s max
5. **Audio**: Sounds are pooled, 8 concurrent max

---

## Common Tasks

### Modify Wave Composition
Edit `src/data/waves.json`:
```json
{
  "id": 1,
  "enemies": [
    { "type": "blobbert", "count": 5, "spawnDelay": 1.5 },
    { "type": "sirScuttles", "count": 3, "spawnDelay": 1.0 }
  ]
}
```

### Adjust Tower Balance
Edit `src/data/towers.json`:
```json
"stats": {
  "damage": 15,
  "range": 6,
  "fireRate": 2,
  "cost": 50
}
```

### Change Hero Ability
Edit `src/data/heroes.json` and implement in `HeroAbilitySystem.ts`

---

## File Counts

| Category | Files | Lines |
|----------|-------|-------|
| Core | 6 | ~800 |
| Entities | 7 | ~400 |
| Systems | 8 | ~1200 |
| Graphics | 12 | ~2500 |
| UI | 15 | ~2000 |
| Data | 6 | ~600 |
| **Total** | **54** | **~7500** |

---

## Dependencies

```json
{
  "@react-three/fiber": "^8.15.12",
  "@react-three/drei": "^9.92.7",
  "@react-three/postprocessing": "^2.16.3",
  "three": "^0.160.0",
  "zustand": "^4.4.7",
  "framer-motion": "^11.0.0",
  "howler": "^2.2.4"
}
```
