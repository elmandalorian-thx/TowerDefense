import type { Hero, HeroType, Vector3D, HeroConfig, Ability, AbilityKey } from '../types'
import { createHero } from './Hero'
import heroesData from '../data/heroes.json'

const heroConfigs: Map<HeroType, HeroConfig> = new Map()

// Initialize configs from JSON
for (const config of heroesData.heroes) {
  heroConfigs.set(config.type as HeroType, config as HeroConfig)
}

export class HeroFactory {
  static create(type: HeroType, position: Vector3D): Hero {
    const config = heroConfigs.get(type)

    if (!config) {
      throw new Error(`Unknown hero type: ${type}`)
    }

    return createHero(
      type,
      config.name,
      position,
      config.stats,
      config.abilities as Record<AbilityKey, Omit<Ability, 'currentCooldown'>>
    )
  }

  static getConfig(type: HeroType): HeroConfig | undefined {
    return heroConfigs.get(type)
  }

  static getAllConfigs(): HeroConfig[] {
    return Array.from(heroConfigs.values())
  }
}
