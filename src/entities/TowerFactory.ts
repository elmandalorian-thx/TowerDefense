import type { Tower, TowerType, Vector3D, TowerConfig } from '../types'
import { createTower } from './Tower'
import towersData from '../data/towers.json'

const towerConfigs: Map<TowerType, TowerConfig> = new Map()

// Initialize configs from JSON
for (const config of towersData.towers) {
  towerConfigs.set(config.type as TowerType, config as TowerConfig)
}

export class TowerFactory {
  static create(type: TowerType, position: Vector3D): Tower {
    const config = towerConfigs.get(type)

    if (!config) {
      throw new Error(`Unknown tower type: ${type}`)
    }

    return createTower(type, position, config.stats)
  }

  static getConfig(type: TowerType): TowerConfig | undefined {
    return towerConfigs.get(type)
  }

  static getAllConfigs(): TowerConfig[] {
    return Array.from(towerConfigs.values())
  }

  static getCost(type: TowerType): number {
    const config = towerConfigs.get(type)
    return config?.stats.cost ?? 0
  }
}
