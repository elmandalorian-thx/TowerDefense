import type { Enemy, EnemyType, Vector3D, EnemyConfig } from '../types'
import { createEnemy } from './Enemy'
import enemiesData from '../data/enemies.json'

const enemyConfigs: Map<EnemyType, EnemyConfig> = new Map()

// Initialize configs from JSON
for (const config of enemiesData.enemies) {
  enemyConfigs.set(config.type as EnemyType, config as EnemyConfig)
}

export class EnemyFactory {
  static create(type: EnemyType, position: Vector3D): Enemy {
    const config = enemyConfigs.get(type)

    if (!config) {
      throw new Error(`Unknown enemy type: ${type}`)
    }

    return createEnemy(type, position, config.stats)
  }

  static getConfig(type: EnemyType): EnemyConfig | undefined {
    return enemyConfigs.get(type)
  }

  static getAllConfigs(): EnemyConfig[] {
    return Array.from(enemyConfigs.values())
  }
}
