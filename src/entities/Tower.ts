import type { Tower, TowerType, TowerTier, TowerSpecialEffect, Vector3D } from '../types'

// Re-export TowerSpecialEffect to avoid unused import warning
export type { TowerSpecialEffect }
import { generateId } from '../utils/helpers'

export function createTower(
  type: TowerType,
  position: Vector3D,
  stats: {
    damage: number
    range: number
    fireRate: number
    projectileSpeed: number
    cost: number
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
    // Upgrade tracking
    tier: 1,
    upgradePath: undefined,
    specialEffect: 'none',
    totalInvested: stats.cost,
  }
}

export function getTierNumber(tier: TowerTier): number {
  if (tier === 1) return 1
  if (tier === 2) return 2
  if (tier === 3) return 3
  return 4 // '4A' or '4B'
}

export function getNextAvailableTiers(currentTier: TowerTier): TowerTier[] {
  switch (currentTier) {
    case 1:
      return [2]
    case 2:
      return [3]
    case 3:
      return ['4A', '4B'] // Branching point
    case '4A':
    case '4B':
      return [] // Max tier
    default:
      return []
  }
}

export function canUpgradeTo(currentTier: TowerTier, targetTier: TowerTier): boolean {
  const availableTiers = getNextAvailableTiers(currentTier)
  return availableTiers.includes(targetTier)
}
