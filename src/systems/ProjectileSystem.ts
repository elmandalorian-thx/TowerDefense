import { useGameStore } from '../stores/gameStore'
import { EnemyHealthSystem } from './EnemyHealthSystem'
import { lerpVector3D, distance2D, distance3D } from '../utils/helpers'
import { triggerImpactEffect } from '../stores/effectsStore'
import type { Projectile, Enemy } from '../types'

export class ProjectileSystem {
  update(delta: number): void {
    const store = useGameStore.getState()
    const { projectiles, enemies } = store

    for (const projectile of projectiles) {
      this.updateProjectile(projectile, delta, enemies)
    }
  }

  private updateProjectile(projectile: Projectile, delta: number, enemies: Enemy[]): void {
    const store = useGameStore.getState()

    // Update target position if target still exists
    const target = enemies.find((e) => e.id === projectile.targetId)
    if (target && !target.isDead) {
      store.removeProjectile(projectile.id)

      // Re-add with updated target position
      const updatedProjectile: Projectile = {
        ...projectile,
        targetPosition: { ...target.position },
      }

      // Calculate movement
      const totalDistance = distance3D(projectile.startPosition, updatedProjectile.targetPosition)
      const moveDistance = projectile.speed * delta
      const progressIncrease = totalDistance > 0 ? moveDistance / totalDistance : 1

      updatedProjectile.progress = Math.min(1, projectile.progress + progressIncrease)
      updatedProjectile.position = lerpVector3D(
        projectile.startPosition,
        updatedProjectile.targetPosition,
        updatedProjectile.progress
      )

      // Check if hit
      const distToTarget = distance2D(updatedProjectile.position, target.position)
      if (distToTarget < 0.5 || updatedProjectile.progress >= 1) {
        this.onProjectileHit(updatedProjectile, enemies)
        return
      }

      store.addProjectile(updatedProjectile)
    } else {
      // Target is gone, continue to last known position
      const totalDistance = distance3D(projectile.startPosition, projectile.targetPosition)
      const moveDistance = projectile.speed * delta
      const progressIncrease = totalDistance > 0 ? moveDistance / totalDistance : 1

      const newProgress = Math.min(1, projectile.progress + progressIncrease)
      const newPosition = lerpVector3D(
        projectile.startPosition,
        projectile.targetPosition,
        newProgress
      )

      if (newProgress >= 1) {
        // Reached destination without target
        if (projectile.splashRadius) {
          this.applySplashDamage(projectile, enemies)
        }
        store.removeProjectile(projectile.id)
        return
      }

      // Remove and re-add since we don't have updateProjectile
      store.removeProjectile(projectile.id)
      store.addProjectile({
        ...projectile,
        position: newPosition,
        progress: newProgress,
      })
    }
  }

  private onProjectileHit(projectile: Projectile, enemies: Enemy[]): void {
    // Trigger impact visual effect
    triggerImpactEffect()

    if (projectile.splashRadius) {
      this.applySplashDamage(projectile, enemies)
    } else {
      // Single target damage
      EnemyHealthSystem.damageEnemy(projectile.targetId, projectile.damage)
    }
  }

  private applySplashDamage(projectile: Projectile, enemies: Enemy[]): void {
    const splashRadius = projectile.splashRadius || 0

    for (const enemy of enemies) {
      if (enemy.isDead) continue

      const dist = distance2D(projectile.position, enemy.position)
      if (dist <= splashRadius) {
        // Damage falls off with distance
        const falloff = 1 - dist / splashRadius
        const damage = Math.floor(projectile.damage * falloff)
        EnemyHealthSystem.damageEnemy(enemy.id, damage)
      }
    }
  }
}
