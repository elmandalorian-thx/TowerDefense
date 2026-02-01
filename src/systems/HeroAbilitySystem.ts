import { useGameStore } from '../stores/gameStore'
import { EnemyHealthSystem } from './EnemyHealthSystem'
import { distance2D } from '../utils/helpers'
import { triggerUltimateEffect } from '../stores/effectsStore'
import { playAbility } from '../core/AudioManager'
import type { AbilityKey, Ability, Vector3D, HeroType, Enemy, Tower } from '../types'

// Track active effects
interface ActiveEffect {
  type: string
  startTime: number
  duration: number
  data?: Record<string, unknown>
}

export class HeroAbilitySystem {
  private pendingAbility: AbilityKey | null = null
  private activeEffects: ActiveEffect[] = []
  private slowedEnemies: Map<string, { originalSpeed: number; endTime: number }> = new Map()
  private borisOriginalDamage: number | null = null

  constructor() {
    // Listen for ability key presses
    window.addEventListener('heroAbility', ((e: CustomEvent) => {
      this.pendingAbility = e.detail.key as AbilityKey
    }) as EventListener)
  }

  update(delta: number): void {
    const store = useGameStore.getState()
    const { hero } = store

    if (!hero) return

    // Update cooldowns
    const updatedAbilities = { ...hero.abilities }
    let abilitiesChanged = false

    for (const key of ['Q', 'W', 'R'] as AbilityKey[]) {
      if (updatedAbilities[key].currentCooldown > 0) {
        updatedAbilities[key] = {
          ...updatedAbilities[key],
          currentCooldown: Math.max(0, updatedAbilities[key].currentCooldown - delta),
        }
        abilitiesChanged = true
      }
    }

    if (abilitiesChanged) {
      store.updateHero({ abilities: updatedAbilities })
    }

    // Handle pending ability
    if (this.pendingAbility) {
      this.executeAbility(this.pendingAbility, hero.type)
      this.pendingAbility = null
    }

    // Update active effects
    this.updateActiveEffects()
  }

  private updateActiveEffects(): void {
    const now = Date.now()
    const store = useGameStore.getState()
    const { enemies, hero } = store

    // Update slowed enemies
    for (const [enemyId, slowData] of this.slowedEnemies.entries()) {
      if (now >= slowData.endTime) {
        // Restore original speed
        const enemy = enemies.find(e => e.id === enemyId)
        if (enemy && !enemy.isDead) {
          store.updateEnemy(enemyId, { speed: slowData.originalSpeed })
        }
        this.slowedEnemies.delete(enemyId)
      }
    }

    // Check BORIS fortress mode ending
    if (hero && hero.type === 'boris' && this.borisOriginalDamage !== null) {
      const fortressActive = hero.abilities.W.currentCooldown > hero.abilities.W.cooldown - (hero.abilities.W.duration || 0)
      if (!fortressActive) {
        store.updateHero({ damage: this.borisOriginalDamage })
        this.borisOriginalDamage = null
      }
    }

    // Remove expired effects
    this.activeEffects = this.activeEffects.filter(effect => {
      const elapsed = (now - effect.startTime) / 1000
      return elapsed < effect.duration
    })
  }

  private executeAbility(key: AbilityKey, heroType: HeroType): void {
    const store = useGameStore.getState()
    const { hero, enemies, towers } = store

    if (!hero) return

    const ability = hero.abilities[key]
    if (ability.currentCooldown > 0) return

    // Play ability sound
    playAbility(key, hero.type)

    // Execute hero-specific abilities
    switch (heroType) {
      case 'captainZara':
        this.executeCaptainZaraAbility(key, hero.position, ability, enemies)
        break
      case 'professorWobblesworth':
        this.executeProfessorWobblesworthAbility(key, hero.position, ability, enemies, towers)
        break
      case 'boris':
        this.executeBorisAbility(key, hero.position, ability, enemies)
        break
      case 'glitch':
        this.executeGlitchAbility(key, hero.position, ability, enemies)
        break
      case 'mamaMoonbeam':
        this.executeMamaMoonbeamAbility(key, hero.position, ability)
        break
    }

    // Trigger ultimate effects for R abilities
    if (key === 'R') {
      triggerUltimateEffect()
    }

    // Start cooldown
    const updatedAbilities = {
      ...hero.abilities,
      [key]: { ...ability, currentCooldown: ability.cooldown },
    }
    store.updateHero({ abilities: updatedAbilities })
  }

  // ==================== Captain Zara Abilities ====================

  private executeCaptainZaraAbility(
    key: AbilityKey,
    position: Vector3D,
    ability: Ability,
    enemies: Enemy[]
  ): void {
    switch (key) {
      case 'Q':
        this.executePlasmaBurst(position, ability, enemies)
        break
      case 'W':
        this.executeEnergyShield()
        break
      case 'R':
        this.executeOrbitalStrike(position, ability, enemies)
        break
    }
  }

  private executePlasmaBurst(
    position: Vector3D,
    ability: Ability,
    enemies: Enemy[]
  ): void {
    const radius = ability.radius || 2
    const damage = ability.damage || 80

    for (const enemy of enemies) {
      if (enemy.isDead) continue

      const dist = distance2D(position, enemy.position)
      if (dist <= radius) {
        EnemyHealthSystem.damageEnemy(enemy.id, damage)
      }
    }
  }

  private executeEnergyShield(): void {
    const store = useGameStore.getState()
    const { hero } = store

    if (!hero) return

    // Heal a bit when activating shield
    const newHealth = Math.min(hero.maxHealth, hero.health + 50)
    store.updateHero({ health: newHealth })
  }

  private executeOrbitalStrike(
    position: Vector3D,
    ability: Ability,
    enemies: Enemy[]
  ): void {
    const radius = ability.radius || 4
    const damage = ability.damage || 200

    for (const enemy of enemies) {
      if (enemy.isDead) continue

      const dist = distance2D(position, enemy.position)
      if (dist <= radius) {
        // Damage falls off with distance
        const falloff = 1 - dist / (radius * 1.5)
        const actualDamage = Math.floor(damage * falloff)
        EnemyHealthSystem.damageEnemy(enemy.id, actualDamage)
      }
    }
  }

  // ==================== Professor Wobblesworth III Abilities ====================

  private executeProfessorWobblesworthAbility(
    key: AbilityKey,
    position: Vector3D,
    ability: Ability,
    enemies: Enemy[],
    towers: Tower[]
  ): void {
    switch (key) {
      case 'Q':
        this.executeGravityBubble(position, ability, enemies)
        break
      case 'W':
        this.executeRepairDrone(position, towers)
        break
      case 'R':
        this.executeBlackHole(position, ability, enemies)
        break
    }
  }

  private executeGravityBubble(
    position: Vector3D,
    ability: Ability,
    enemies: Enemy[]
  ): void {
    const store = useGameStore.getState()
    const radius = ability.radius || 4
    const slowPercent = (ability.slowPercent || 50) / 100
    const duration = (ability.duration || 5) * 1000 // Convert to ms
    const now = Date.now()

    for (const enemy of enemies) {
      if (enemy.isDead) continue

      const dist = distance2D(position, enemy.position)
      if (dist <= radius) {
        // Check if already slowed
        if (!this.slowedEnemies.has(enemy.id)) {
          this.slowedEnemies.set(enemy.id, {
            originalSpeed: enemy.speed,
            endTime: now + duration
          })
          // Apply slow
          const newSpeed = enemy.speed * (1 - slowPercent)
          store.updateEnemy(enemy.id, { speed: newSpeed })
        }
      }
    }
  }

  private executeRepairDrone(
    position: Vector3D,
    towers: Tower[]
  ): void {
    const store = useGameStore.getState()

    // Find nearest tower
    let nearestTower: Tower | null = null
    let nearestDist = Infinity

    for (const tower of towers) {
      const dist = distance2D(position, tower.position)
      if (dist < nearestDist) {
        nearestDist = dist
        nearestTower = tower
      }
    }

    if (nearestTower) {
      // Towers don't have HP in this system, but we can add currency as tower repair bonus
      store.addCurrency(20)
      store.addScore(50)
    }
  }

  private executeBlackHole(
    position: Vector3D,
    ability: Ability,
    enemies: Enemy[]
  ): void {
    const store = useGameStore.getState()
    const radius = ability.radius || 5
    const damage = ability.damage || 300

    // First, pull enemies toward center (update their positions)
    for (const enemy of enemies) {
      if (enemy.isDead) continue

      const dist = distance2D(position, enemy.position)
      if (dist <= radius && dist > 0.5) {
        // Calculate pull direction
        const dx = position.x - enemy.position.x
        const dz = position.z - enemy.position.z
        const pullStrength = 0.5 // How much to pull toward center

        const newX = enemy.position.x + dx * pullStrength
        const newZ = enemy.position.z + dz * pullStrength

        store.updateEnemy(enemy.id, {
          position: { x: newX, y: enemy.position.y, z: newZ }
        })
      }
    }

    // Then deal damage after a brief delay (simulated by dealing damage now)
    setTimeout(() => {
      const currentEnemies = useGameStore.getState().enemies
      for (const enemy of currentEnemies) {
        if (enemy.isDead) continue

        const dist = distance2D(position, enemy.position)
        if (dist <= radius) {
          // More damage at center
          const centerBonus = 1 + (1 - dist / radius) * 0.5
          EnemyHealthSystem.damageEnemy(enemy.id, Math.floor(damage * centerBonus))
        }
      }
    }, 500)
  }

  // ==================== B.O.R.I.S. Abilities ====================

  private executeBorisAbility(
    key: AbilityKey,
    position: Vector3D,
    ability: Ability,
    enemies: Enemy[]
  ): void {
    switch (key) {
      case 'Q':
        this.executeRocketPunch(position, ability, enemies)
        break
      case 'W':
        this.executeFortressMode(ability)
        break
      case 'R':
        this.executeOrbitalDrop(position, ability, enemies)
        break
    }
  }

  private executeRocketPunch(
    position: Vector3D,
    ability: Ability,
    enemies: Enemy[]
  ): void {
    const store = useGameStore.getState()
    const hero = store.hero
    if (!hero) return

    const radius = ability.radius || 3
    const damage = ability.damage || 120
    const knockbackForce = ability.knockbackForce || 5

    // Get hero facing direction
    const facingX = Math.sin(hero.rotation)
    const facingZ = Math.cos(hero.rotation)

    for (const enemy of enemies) {
      if (enemy.isDead) continue

      const dist = distance2D(position, enemy.position)
      if (dist <= radius) {
        // Check if enemy is roughly in front of hero (cone attack)
        const toEnemyX = enemy.position.x - position.x
        const toEnemyZ = enemy.position.z - position.z
        const dotProduct = facingX * toEnemyX + facingZ * toEnemyZ

        if (dotProduct > 0 || dist < 1) { // In front or very close
          // Deal damage
          EnemyHealthSystem.damageEnemy(enemy.id, damage)

          // Apply knockback
          const knockbackX = toEnemyX * knockbackForce / Math.max(dist, 0.5)
          const knockbackZ = toEnemyZ * knockbackForce / Math.max(dist, 0.5)

          store.updateEnemy(enemy.id, {
            position: {
              x: enemy.position.x + knockbackX,
              y: enemy.position.y,
              z: enemy.position.z + knockbackZ
            }
          })
        }
      }
    }
  }

  private executeFortressMode(ability: Ability): void {
    const store = useGameStore.getState()
    const { hero } = store

    if (!hero) return

    const damageBoost = (ability.damageBoost || 100) / 100

    // Store original damage if not already stored
    if (this.borisOriginalDamage === null) {
      this.borisOriginalDamage = hero.damage
    }

    // Double damage while in fortress mode
    store.updateHero({
      damage: Math.floor(hero.damage * (1 + damageBoost)),
      speed: 0 // Immobile while in fortress mode
    })

    // Restore speed after duration
    setTimeout(() => {
      const currentHero = useGameStore.getState().hero
      if (currentHero && currentHero.type === 'boris') {
        store.updateHero({ speed: 2 }) // Restore original BORIS speed
      }
    }, (ability.duration || 6) * 1000)
  }

  private executeOrbitalDrop(
    position: Vector3D,
    ability: Ability,
    enemies: Enemy[]
  ): void {
    const radius = ability.radius || 6
    const damage = ability.damage || 500

    // Massive damage in a large area
    for (const enemy of enemies) {
      if (enemy.isDead) continue

      const dist = distance2D(position, enemy.position)
      if (dist <= radius) {
        // Full damage at center, reduced at edges
        const falloff = 1 - (dist / radius) * 0.5
        EnemyHealthSystem.damageEnemy(enemy.id, Math.floor(damage * falloff))
      }
    }
  }

  // ==================== Glitch the Unstable Abilities ====================

  private executeGlitchAbility(
    key: AbilityKey,
    position: Vector3D,
    ability: Ability,
    enemies: Enemy[]
  ): void {
    switch (key) {
      case 'Q':
        this.executePhaseShift(ability)
        break
      case 'W':
        this.executeGlitchBomb(position, ability, enemies)
        break
      case 'R':
        this.executeSystemCrash(position, ability, enemies)
        break
    }
  }

  private executePhaseShift(ability: Ability): void {
    // The invisibility effect is handled in the renderer
    // Here we just track that phase shift is active for the crit
    this.activeEffects.push({
      type: 'phaseShift',
      startTime: Date.now(),
      duration: ability.duration || 3,
      data: { critMultiplier: ability.critMultiplier || 3 }
    })
  }

  private executeGlitchBomb(
    position: Vector3D,
    ability: Ability,
    enemies: Enemy[]
  ): void {
    const store = useGameStore.getState()
    const { hero } = store

    if (!hero) return

    const damage = ability.damage || 150
    const radius = ability.radius || 3
    const teleportRange = ability.teleportRange || 8

    // Find nearest enemy within teleport range
    let nearestEnemy: Enemy | null = null
    let nearestDist = teleportRange

    for (const enemy of enemies) {
      if (enemy.isDead) continue
      const dist = distance2D(position, enemy.position)
      if (dist < nearestDist) {
        nearestDist = dist
        nearestEnemy = enemy
      }
    }

    // Teleport to enemy location (or random direction if no enemy)
    let newX: number, newZ: number
    if (nearestEnemy) {
      newX = nearestEnemy.position.x
      newZ = nearestEnemy.position.z
    } else {
      // Random teleport within range
      const angle = Math.random() * Math.PI * 2
      newX = position.x + Math.cos(angle) * teleportRange * 0.5
      newZ = position.z + Math.sin(angle) * teleportRange * 0.5
    }

    // Teleport hero
    store.updateHero({
      position: { x: newX, y: 0, z: newZ }
    })

    // Deal damage at new location
    const newPosition = { x: newX, y: 0, z: newZ }
    for (const enemy of enemies) {
      if (enemy.isDead) continue
      const dist = distance2D(newPosition, enemy.position)
      if (dist <= radius) {
        EnemyHealthSystem.damageEnemy(enemy.id, damage)
      }
    }
  }

  private executeSystemCrash(
    position: Vector3D,
    ability: Ability,
    enemies: Enemy[]
  ): void {
    const radius = ability.radius || 8
    const executeThreshold = (ability.executeThreshold || 20) / 100

    // Execute all enemies below threshold in radius
    for (const enemy of enemies) {
      if (enemy.isDead) continue

      const dist = distance2D(position, enemy.position)
      if (dist <= radius) {
        const healthPercent = enemy.health / enemy.maxHealth
        if (healthPercent <= executeThreshold) {
          // Instant kill
          EnemyHealthSystem.damageEnemy(enemy.id, enemy.health + 1000)
        }
      }
    }
  }

  // ==================== Mama Moonbeam Abilities ====================

  private executeMamaMoonbeamAbility(
    key: AbilityKey,
    position: Vector3D,
    ability: Ability
  ): void {
    switch (key) {
      case 'Q':
        this.executeHealingRay(ability)
        break
      case 'W':
        this.executeCosmicShield(ability)
        break
      case 'R':
        this.executeResurrection(position, ability)
        break
    }
  }

  private executeHealingRay(ability: Ability): void {
    const store = useGameStore.getState()
    const { hero } = store

    if (!hero) return

    const healPerSecond = ability.healPerSecond || 50
    const duration = ability.duration || 4

    // Heal hero over time
    let elapsed = 0
    const interval = setInterval(() => {
      const currentHero = useGameStore.getState().hero
      if (!currentHero) {
        clearInterval(interval)
        return
      }

      elapsed += 0.25
      if (elapsed >= duration) {
        clearInterval(interval)
        return
      }

      const healAmount = healPerSecond * 0.25
      const newHealth = Math.min(currentHero.maxHealth, currentHero.health + healAmount)
      store.updateHero({ health: newHealth })
    }, 250)
  }

  private executeCosmicShield(ability: Ability): void {
    const store = useGameStore.getState()
    const { hero } = store

    if (!hero) return

    // Make hero temporarily invulnerable by boosting health way up
    const originalHealth = hero.health
    const duration = (ability.duration || 3) * 1000

    // Grant temporary massive health boost
    store.updateHero({ health: hero.maxHealth * 10 })

    // Restore after duration
    setTimeout(() => {
      const currentHero = useGameStore.getState().hero
      if (currentHero) {
        // Restore to original health (or max if it was healing)
        store.updateHero({
          health: Math.min(currentHero.maxHealth, originalHealth + 100)
        })
      }
    }, duration)
  }

  private executeResurrection(
    position: Vector3D,
    ability: Ability
  ): void {
    const store = useGameStore.getState()

    // This ability would revive dead friendly units
    // Since we don't have friendly units in the current game,
    // we'll give a large bonus instead (heal + currency + score)

    const radius = ability.radius || 10

    // Heal hero significantly
    const currentHero = store.hero
    if (currentHero) {
      const healAmount = currentHero.maxHealth * 0.5
      store.updateHero({
        health: Math.min(currentHero.maxHealth, currentHero.health + healAmount)
      })
    }

    // Give bonus resources
    store.addCurrency(100)
    store.addScore(200)

    // Also deal holy damage to enemies in the area
    const { enemies } = store
    for (const enemy of enemies) {
      if (enemy.isDead) continue
      const dist = distance2D(position, enemy.position)
      if (dist <= radius) {
        EnemyHealthSystem.damageEnemy(enemy.id, 50)
      }
    }
  }

  // Check if Glitch has phase shift crit available
  hasPhaseShiftCrit(): boolean {
    const effect = this.activeEffects.find(e => e.type === 'phaseShift')
    return !!effect
  }

  // Get phase shift crit multiplier and consume it
  consumePhaseShiftCrit(): number {
    const effectIndex = this.activeEffects.findIndex(e => e.type === 'phaseShift')
    if (effectIndex >= 0) {
      const effect = this.activeEffects[effectIndex]
      this.activeEffects.splice(effectIndex, 1)
      return (effect.data?.critMultiplier as number) || 3
    }
    return 1
  }
}
