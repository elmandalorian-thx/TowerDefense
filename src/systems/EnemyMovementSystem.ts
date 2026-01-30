import { useGameStore } from '../stores/gameStore'
import { lerpVector3D, distance2D, angleToTarget } from '../utils/helpers'
import type { PathPoint } from '../types'

export class EnemyMovementSystem {
  update(delta: number): void {
    const store = useGameStore.getState()
    const { enemies, path } = store

    if (path.length < 2) return

    for (const enemy of enemies) {
      if (enemy.isDead || enemy.reachedEnd) continue

      this.moveEnemy(enemy.id, delta, path)
    }
  }

  private moveEnemy(enemyId: string, delta: number, path: PathPoint[]): void {
    const store = useGameStore.getState()
    const enemy = store.enemies.find((e) => e.id === enemyId)

    if (!enemy) return

    const currentPoint = path[enemy.pathIndex]
    const nextPoint = path[enemy.pathIndex + 1]

    if (!nextPoint) {
      // Reached the end
      store.updateEnemy(enemyId, { reachedEnd: true })
      store.loseLives(enemy.damage)
      store.removeEnemy(enemyId)
      store.decrementEnemiesRemaining()
      return
    }

    // Calculate movement
    const segmentLength = distance2D(currentPoint, nextPoint)
    const moveDistance = enemy.speed * delta
    const progressIncrease = moveDistance / segmentLength

    let newProgress = enemy.pathProgress + progressIncrease
    let newPathIndex = enemy.pathIndex

    // Check if we've moved past the current segment
    while (newProgress >= 1 && newPathIndex < path.length - 2) {
      newProgress -= 1
      newPathIndex++
    }

    if (newPathIndex >= path.length - 1) {
      // Reached the end
      store.updateEnemy(enemyId, { reachedEnd: true })
      store.loseLives(enemy.damage)
      store.removeEnemy(enemyId)
      store.decrementEnemiesRemaining()
      return
    }

    // Calculate new position
    const segmentStart = path[newPathIndex]
    const segmentEnd = path[newPathIndex + 1]
    const newPosition = lerpVector3D(segmentStart, segmentEnd, newProgress)

    // Calculate rotation to face movement direction
    const rotation = angleToTarget(segmentStart, segmentEnd)

    store.updateEnemy(enemyId, {
      position: newPosition,
      pathIndex: newPathIndex,
      pathProgress: newProgress,
      rotation,
    })
  }
}
