import type { Projectile, Vector3D } from '../types'
import { generateId } from '../utils/helpers'

export function createProjectile(
  sourceId: string,
  targetId: string,
  startPosition: Vector3D,
  targetPosition: Vector3D,
  damage: number,
  speed: number,
  splashRadius?: number
): Projectile {
  return {
    id: generateId(),
    sourceId,
    targetId,
    position: { ...startPosition },
    rotation: 0,
    startPosition: { ...startPosition },
    targetPosition: { ...targetPosition },
    damage,
    speed,
    splashRadius,
    progress: 0,
  }
}
