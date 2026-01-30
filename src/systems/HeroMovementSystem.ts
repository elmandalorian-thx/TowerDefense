import { useGameStore } from '../stores/gameStore'
import { distance2D, normalizeVector3D, subtractVectors, addVectors, scaleVector, angleToTarget } from '../utils/helpers'

export class HeroMovementSystem {
  update(delta: number): void {
    const store = useGameStore.getState()
    const { hero } = store

    if (!hero || !hero.targetPosition || !hero.isMoving) return

    const dist = distance2D(hero.position, hero.targetPosition)

    if (dist < 0.1) {
      // Reached destination
      store.updateHero({
        position: hero.targetPosition,
        targetPosition: null,
        isMoving: false,
      })
      return
    }

    // Move towards target
    const direction = normalizeVector3D(subtractVectors(hero.targetPosition, hero.position))
    const moveDistance = hero.speed * delta
    const actualMove = Math.min(moveDistance, dist)

    const newPosition = addVectors(hero.position, scaleVector(direction, actualMove))
    newPosition.y = 0 // Keep on ground

    const rotation = angleToTarget(hero.position, hero.targetPosition)

    store.updateHero({
      position: newPosition,
      rotation,
    })
  }

  static setMoveTarget(x: number, z: number): void {
    const store = useGameStore.getState()
    const { hero } = store

    if (!hero) return

    store.updateHero({
      targetPosition: { x, y: 0, z },
      isMoving: true,
    })
  }
}
