import { useGameStore } from '../stores/gameStore'
import { EnemyHealthSystem } from './EnemyHealthSystem'
import { distance2D, angleToTarget } from '../utils/helpers'

export class HeroCombatSystem {
  private gameTime: number = 0

  update(delta: number): void {
    this.gameTime += delta
    const store = useGameStore.getState()
    const { hero, enemies } = store

    if (!hero || hero.isMoving) return

    // Find nearest enemy in range
    let nearestEnemy = null
    let nearestDist = Infinity

    for (const enemy of enemies) {
      if (enemy.isDead) continue

      const dist = distance2D(hero.position, enemy.position)
      if (dist <= hero.attackRange && dist < nearestDist) {
        nearestDist = dist
        nearestEnemy = enemy
      }
    }

    if (nearestEnemy) {
      // Auto-attack
      const attackCooldown = 1 / hero.attackSpeed
      const timeSinceLastAttack = this.gameTime - hero.lastAttackTime

      if (timeSinceLastAttack >= attackCooldown) {
        EnemyHealthSystem.damageEnemy(nearestEnemy.id, hero.damage)

        const rotation = angleToTarget(hero.position, nearestEnemy.position)
        store.updateHero({
          lastAttackTime: this.gameTime,
          targetId: nearestEnemy.id,
          rotation,
        })
      }
    } else {
      if (hero.targetId) {
        store.updateHero({ targetId: null })
      }
    }
  }
}
