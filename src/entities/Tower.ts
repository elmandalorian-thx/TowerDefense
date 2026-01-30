import type { Tower, TowerType, Vector3D } from '../types'
import { generateId } from '../utils/helpers'

export function createTower(
  type: TowerType,
  position: Vector3D,
  stats: {
    damage: number
    range: number
    fireRate: number
    projectileSpeed: number
    splashRadius?: number
  }
): Tower {
  return {
    id: generateId(),
    type,
    position: { ...position },
    rotation: 0,
    damage: stats.damage,
    range: stats.range,
    fireRate: stats.fireRate,
    projectileSpeed: stats.projectileSpeed,
    lastFireTime: 0,
    targetId: null,
    splashRadius: stats.splashRadius,
  }
}
