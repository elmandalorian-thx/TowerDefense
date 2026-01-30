import { useGameStore } from '../stores/gameStore'
import { distance2D } from '../utils/helpers'
import type { Enemy, Tower } from '../types'

export class TowerTargetingSystem {
  update(_delta: number): void {
    const store = useGameStore.getState()
    const { towers, enemies } = store

    for (const tower of towers) {
      this.updateTowerTarget(tower, enemies)
    }
  }

  private updateTowerTarget(tower: Tower, enemies: Enemy[]): void {
    const store = useGameStore.getState()

    // Check if current target is still valid
    if (tower.targetId) {
      const currentTarget = enemies.find((e) => e.id === tower.targetId)
      if (currentTarget && !currentTarget.isDead && !currentTarget.reachedEnd) {
        const dist = distance2D(tower.position, currentTarget.position)
        if (dist <= tower.range) {
          return // Keep current target
        }
      }
      // Target invalid, clear it
      store.updateTower(tower.id, { targetId: null })
    }

    // Find new target - prioritize enemies closest to the base (furthest along path)
    let bestTarget: Enemy | null = null
    let bestProgress = -1

    for (const enemy of enemies) {
      if (enemy.isDead || enemy.reachedEnd) continue

      const dist = distance2D(tower.position, enemy.position)
      if (dist > tower.range) continue

      // Calculate total progress (pathIndex + pathProgress)
      const totalProgress = enemy.pathIndex + enemy.pathProgress
      if (totalProgress > bestProgress) {
        bestProgress = totalProgress
        bestTarget = enemy
      }
    }

    if (bestTarget) {
      store.updateTower(tower.id, { targetId: bestTarget.id })
    }
  }
}
