import type { Hero, HeroType, Vector3D, Ability, AbilityKey } from '../types'
import { generateId } from '../utils/helpers'

export function createHero(
  type: HeroType,
  name: string,
  position: Vector3D,
  stats: {
    maxHealth: number
    speed: number
    damage: number
    attackRange: number
    attackSpeed: number
  },
  abilities: Record<AbilityKey, Omit<Ability, 'currentCooldown'>>
): Hero {
  const fullAbilities: Record<AbilityKey, Ability> = {
    Q: { ...abilities.Q, currentCooldown: 0 },
    W: { ...abilities.W, currentCooldown: 0 },
    R: { ...abilities.R, currentCooldown: 0 },
  }

  return {
    id: generateId(),
    type,
    name,
    position: { ...position },
    rotation: 0,
    health: stats.maxHealth,
    maxHealth: stats.maxHealth,
    speed: stats.speed,
    damage: stats.damage,
    attackRange: stats.attackRange,
    attackSpeed: stats.attackSpeed,
    lastAttackTime: 0,
    targetId: null,
    targetPosition: null,
    abilities: fullAbilities,
    isMoving: false,
  }
}
