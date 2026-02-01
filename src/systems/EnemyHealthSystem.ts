import { useGameStore } from '../stores/gameStore'
import { triggerEnemyDeathEffect } from '../stores/effectsStore'
import { EnemyFactory } from '../entities/EnemyFactory'
import { playEnemyDeath } from '../core/AudioManager'
import type { Enemy } from '../types'

export class EnemyHealthSystem {
  update(_delta: number): void {
    const store = useGameStore.getState()
    const { enemies } = store

    for (const enemy of enemies) {
      if (enemy.health <= 0 && !enemy.isDead) {
        this.killEnemy(enemy.id)
      }
    }
  }

  private killEnemy(enemyId: string): void {
    const store = useGameStore.getState()
    const enemy = store.enemies.find((e) => e.id === enemyId)

    if (!enemy) return

    store.updateEnemy(enemyId, { isDead: true })
    store.addCurrency(enemy.reward)
    store.addScore(enemy.reward * 10)

    // Handle split on death (Blobbert behavior)
    if (enemy.behaviors?.splitsOnDeath && !enemy.behaviorState?.isMini) {
      this.spawnSplitEnemies(enemy)
    }

    store.removeEnemy(enemyId)
    store.decrementEnemiesRemaining()

    // Trigger visual effects for enemy death
    triggerEnemyDeathEffect()

    // Play enemy death sound with spatial audio
    playEnemyDeath(enemy.type, enemy.position)
  }

  private spawnSplitEnemies(enemy: Enemy): void {
    const store = useGameStore.getState()
    const splitCount = enemy.behaviors?.splitCount || 2
    const healthPercent = enemy.behaviors?.splitHealthPercent || 0.25

    for (let i = 0; i < splitCount; i++) {
      // Offset position slightly so they don't stack
      const angleOffset = (i / splitCount) * Math.PI * 2
      const offsetDistance = 0.3
      const offsetX = Math.cos(angleOffset) * offsetDistance
      const offsetZ = Math.sin(angleOffset) * offsetDistance

      const spawnPosition = {
        x: enemy.position.x + offsetX,
        y: enemy.position.y,
        z: enemy.position.z + offsetZ,
      }

      const miniEnemy = EnemyFactory.createMini(
        enemy.type,
        spawnPosition,
        healthPercent,
        enemy.pathIndex,
        enemy.pathProgress
      )

      store.addEnemy(miniEnemy)
      // Don't increment enemies remaining since these are bonus spawns
    }
  }

  /**
   * Attempt to damage an enemy, respecting evasion and armor
   * Returns the actual damage dealt (0 if evaded)
   */
  static damageEnemy(enemyId: string, damage: number, ignoreArmor: boolean = false): number {
    const store = useGameStore.getState()
    const enemy = store.enemies.find((e) => e.id === enemyId)

    if (!enemy || enemy.isDead) return 0

    // Check if burrowed (invulnerable)
    if (enemy.behaviorState?.isBurrowed) {
      return 0
    }

    // Check evasion (Sir Scuttles behavior)
    if (enemy.behaviors?.canDodge) {
      const projectilesReceived = (enemy.behaviorState?.projectilesReceived || 0) + 1
      const dodgeChance = enemy.behaviors.dodgeChance || 0.33

      // Dodge every Nth projectile (deterministic based on count)
      const shouldDodge = projectilesReceived % Math.round(1 / dodgeChance) === 0

      if (shouldDodge) {
        // Trigger dodge animation with random sidestep
        const dodgeDirection = Math.random() > 0.5 ? 1 : -1
        const dodgeAmount = 0.4

        store.updateEnemy(enemyId, {
          behaviorState: {
            ...enemy.behaviorState,
            projectilesReceived,
            isDodging: true,
            dodgeOffset: {
              x: dodgeDirection * dodgeAmount * Math.cos(enemy.rotation),
              z: dodgeDirection * dodgeAmount * Math.sin(enemy.rotation),
            },
          },
        })

        // Clear dodge offset after a short delay (handled by animation system)
        setTimeout(() => {
          const currentStore = useGameStore.getState()
          const currentEnemy = currentStore.enemies.find((e) => e.id === enemyId)
          if (currentEnemy) {
            currentStore.updateEnemy(enemyId, {
              behaviorState: {
                ...currentEnemy.behaviorState,
                isDodging: false,
                dodgeOffset: { x: 0, z: 0 },
              },
            })
          }
        }, 200)

        return 0 // Evaded!
      }

      // Update projectile count even if not dodging
      store.updateEnemy(enemyId, {
        behaviorState: {
          ...enemy.behaviorState,
          projectilesReceived,
        },
      })
    }

    // Apply armor reduction (Chonkzilla behavior)
    let actualDamage = damage
    if (enemy.behaviors?.armorPercent && !ignoreArmor) {
      actualDamage = Math.floor(damage * (1 - enemy.behaviors.armorPercent))
    }

    const newHealth = Math.max(0, enemy.health - actualDamage)
    store.updateEnemy(enemyId, { health: newHealth })

    return actualDamage
  }

  /**
   * Check if an enemy can be knocked back
   */
  static canKnockback(enemyId: string): boolean {
    const store = useGameStore.getState()
    const enemy = store.enemies.find((e) => e.id === enemyId)

    if (!enemy) return false

    // Chonkzilla is immune to knockback
    if (enemy.behaviors?.knockbackImmune) {
      return false
    }

    // Burrowed enemies can't be knocked back
    if (enemy.behaviorState?.isBurrowed) {
      return false
    }

    return true
  }

  /**
   * Check if an enemy is targetable (not burrowed)
   */
  static isTargetable(enemy: Enemy): boolean {
    // Burrowed enemies are invulnerable
    if (enemy.behaviorState?.isBurrowed) {
      return false
    }

    return !enemy.isDead && !enemy.reachedEnd
  }
}
