import { useGameStore } from '../stores/gameStore'
import { lerpVector3D, distance2D, angleToTarget } from '../utils/helpers'
import type { PathPoint, Enemy } from '../types'

export class EnemyMovementSystem {
  private gameTime: number = 0

  update(delta: number): void {
    const store = useGameStore.getState()
    const { enemies, path } = store

    this.gameTime += delta

    if (path.length < 2) return

    for (const enemy of enemies) {
      if (enemy.isDead || enemy.reachedEnd) continue

      // Handle special movement behaviors
      this.handleSpecialBehaviors(enemy.id, delta, path)

      // Check if burrowed (skip normal movement)
      const currentEnemy = store.enemies.find((e) => e.id === enemy.id)
      if (currentEnemy?.behaviorState?.isBurrowed) {
        continue
      }

      this.moveEnemy(enemy.id, delta, path)
    }
  }

  private handleSpecialBehaviors(enemyId: string, delta: number, path: PathPoint[]): void {
    const store = useGameStore.getState()
    const enemy = store.enemies.find((e) => e.id === enemyId)

    if (!enemy || !enemy.behaviors) return

    // Handle Teleport (Zappy McZapface)
    if (enemy.behaviors.canTeleport) {
      this.handleTeleport(enemy, path)
    }

    // Handle Burrow (Wormothy)
    if (enemy.behaviors.canBurrow) {
      this.handleBurrow(enemy, delta, path)
    }

    // Handle Trail (Floofernaut)
    if (enemy.behaviors.leavesTrail) {
      this.handleTrail(enemy)
    }
  }

  private handleTeleport(enemy: Enemy, path: PathPoint[]): void {
    const store = useGameStore.getState()
    const behaviors = enemy.behaviors!
    const behaviorState = enemy.behaviorState || {}

    const teleportInterval = behaviors.teleportInterval || 3
    const lastTeleport = behaviorState.lastTeleportTime || 0

    if (this.gameTime - lastTeleport >= teleportInterval) {
      const teleportDistance = behaviors.teleportDistance || 2

      // Calculate new path position (jump forward along path)
      let newPathIndex = enemy.pathIndex + teleportDistance
      let newProgress = enemy.pathProgress

      // Clamp to path bounds
      if (newPathIndex >= path.length - 1) {
        newPathIndex = path.length - 2
        newProgress = 0.9 // Almost at end
      }

      // Calculate new position
      const segmentStart = path[newPathIndex]
      const segmentEnd = path[newPathIndex + 1]
      if (segmentStart && segmentEnd) {
        const newPosition = lerpVector3D(segmentStart, segmentEnd, newProgress)

        store.updateEnemy(enemy.id, {
          position: newPosition,
          pathIndex: newPathIndex,
          pathProgress: newProgress,
          behaviorState: {
            ...behaviorState,
            lastTeleportTime: this.gameTime,
            animationPhase: 1, // Trigger teleport animation
          },
        })
      }
    }
  }

  private handleBurrow(enemy: Enemy, _delta: number, path: PathPoint[]): void {
    const store = useGameStore.getState()
    const behaviors = enemy.behaviors!
    const behaviorState = enemy.behaviorState || {}

    const burrowInterval = behaviors.burrowInterval || 5
    const burrowDuration = behaviors.burrowDuration || 2
    const lastBurrow = behaviorState.lastBurrowTime || 0
    const isBurrowed = behaviorState.isBurrowed || false
    const burrowEndTime = behaviorState.burrowEndTime || 0

    if (isBurrowed) {
      // Check if burrow should end
      if (this.gameTime >= burrowEndTime) {
        // Emerge from burrow
        const burrowDistance = behaviors.burrowDistance || 3

        let newPathIndex = enemy.pathIndex + burrowDistance
        let newProgress = enemy.pathProgress

        // Clamp to path bounds
        if (newPathIndex >= path.length - 1) {
          newPathIndex = path.length - 2
          newProgress = 0.9
        }

        const segmentStart = path[newPathIndex]
        const segmentEnd = path[newPathIndex + 1]
        if (segmentStart && segmentEnd) {
          const newPosition = lerpVector3D(segmentStart, segmentEnd, newProgress)

          store.updateEnemy(enemy.id, {
            position: newPosition,
            pathIndex: newPathIndex,
            pathProgress: newProgress,
            behaviorState: {
              ...behaviorState,
              isBurrowed: false,
              lastBurrowTime: this.gameTime,
              animationPhase: 2, // Emerging animation
            },
          })
        }
      }
    } else {
      // Check if should start burrowing
      if (this.gameTime - lastBurrow >= burrowInterval) {
        store.updateEnemy(enemy.id, {
          behaviorState: {
            ...behaviorState,
            isBurrowed: true,
            burrowEndTime: this.gameTime + burrowDuration,
            animationPhase: 3, // Burrowing animation
          },
        })
      }
    }
  }

  private handleTrail(enemy: Enemy): void {
    const store = useGameStore.getState()
    const behaviorState = enemy.behaviorState || {}

    const lastTrailTime = behaviorState.lastTrailTime || 0
    const trailInterval = 0.5 // Create trail every 0.5 seconds

    if (this.gameTime - lastTrailTime >= trailInterval) {
      // Trail damage would be handled by a separate DamageZoneSystem
      // For now, just update the timing
      store.updateEnemy(enemy.id, {
        behaviorState: {
          ...behaviorState,
          lastTrailTime: this.gameTime,
        },
      })
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

    // Apply dodge offset if dodging (Sir Scuttles)
    const dodgeOffset = enemy.behaviorState?.dodgeOffset || { x: 0, z: 0 }
    const finalPosition = {
      x: newPosition.x + dodgeOffset.x,
      y: newPosition.y,
      z: newPosition.z + dodgeOffset.z,
    }

    // Update animation phase for continuous animations
    const currentAnimPhase = enemy.behaviorState?.animationPhase || 0
    const newAnimPhase = (currentAnimPhase + delta * 5) % (Math.PI * 2)

    store.updateEnemy(enemyId, {
      position: finalPosition,
      pathIndex: newPathIndex,
      pathProgress: newProgress,
      rotation,
      behaviorState: {
        ...enemy.behaviorState,
        animationPhase: newAnimPhase,
      },
    })
  }
}
