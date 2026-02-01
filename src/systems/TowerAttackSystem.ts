import { useGameStore } from '../stores/gameStore'
import { createProjectile } from '../entities/Projectile'
import { angleToTarget } from '../utils/helpers'
import { triggerTowerFireEffect } from '../stores/effectsStore'
import { playTowerFire } from '../core/AudioManager'
import type { Tower, Enemy } from '../types'

export class TowerAttackSystem {
  private gameTime: number = 0

  update(delta: number): void {
    this.gameTime += delta
    const store = useGameStore.getState()
    const { towers, enemies } = store

    for (const tower of towers) {
      if (!tower.targetId) continue

      const target = enemies.find((e) => e.id === tower.targetId)
      if (!target || target.isDead) continue

      this.tryFireTower(tower, target)
    }
  }

  private tryFireTower(tower: Tower, target: Enemy): void {
    const store = useGameStore.getState()
    const fireCooldown = 1 / tower.fireRate
    const timeSinceLastFire = this.gameTime - tower.lastFireTime

    if (timeSinceLastFire < fireCooldown) return

    // Fire!
    const projectile = createProjectile(
      tower.id,
      target.id,
      { ...tower.position, y: tower.position.y + 1 },
      { ...target.position },
      tower.damage,
      tower.projectileSpeed,
      tower.splashRadius
    )

    store.addProjectile(projectile)

    // Trigger subtle visual effect for tower fire
    triggerTowerFireEffect()

    // Play tower fire sound with spatial audio
    playTowerFire(tower.type, tower.position)

    // Update tower rotation to face target
    const rotation = angleToTarget(tower.position, target.position)
    store.updateTower(tower.id, {
      lastFireTime: this.gameTime,
      rotation,
    })
  }
}
