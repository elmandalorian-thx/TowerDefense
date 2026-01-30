import type { Enemy, EnemyType, Vector3D } from '../types'
import { generateId } from '../utils/helpers'

export function createEnemy(
  type: EnemyType,
  position: Vector3D,
  stats: {
    maxHealth: number
    speed: number
    damage: number
    reward: number
  }
): Enemy {
  return {
    id: generateId(),
    type,
    position: { ...position },
    rotation: 0,
    health: stats.maxHealth,
    maxHealth: stats.maxHealth,
    speed: stats.speed,
    damage: stats.damage,
    reward: stats.reward,
    pathIndex: 0,
    pathProgress: 0,
    isDead: false,
    reachedEnd: false,
  }
}
