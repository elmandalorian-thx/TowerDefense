import type { Enemy, EnemyType, Vector3D, EnemyConfig, EnemyBehaviorState } from '../types'
import { createEnemy } from './Enemy'
import enemiesData from '../data/enemies.json'

const enemyConfigs: Map<EnemyType, EnemyConfig> = new Map()

// Initialize configs from JSON
for (const config of enemiesData.enemies) {
  enemyConfigs.set(config.type as EnemyType, config as EnemyConfig)
}

export class EnemyFactory {
  static create(
    type: EnemyType,
    position: Vector3D,
    behaviorStateOverride?: Partial<EnemyBehaviorState>
  ): Enemy {
    const config = enemyConfigs.get(type)

    if (!config) {
      throw new Error(`Unknown enemy type: ${type}`)
    }

    return createEnemy(type, position, config.stats, config.behaviors, behaviorStateOverride)
  }

  /**
   * Create a mini version of an enemy (used for splitting)
   */
  static createMini(
    type: EnemyType,
    position: Vector3D,
    healthPercent: number,
    pathIndex: number,
    pathProgress: number
  ): Enemy {
    const config = enemyConfigs.get(type)

    if (!config) {
      throw new Error(`Unknown enemy type: ${type}`)
    }

    const miniStats = {
      ...config.stats,
      maxHealth: Math.ceil(config.stats.maxHealth * healthPercent),
    }

    const enemy = createEnemy(type, position, miniStats, config.behaviors, { isMini: true })
    enemy.pathIndex = pathIndex
    enemy.pathProgress = pathProgress
    // Mini versions don't split again
    if (enemy.behaviors) {
      enemy.behaviors = { ...enemy.behaviors, splitsOnDeath: false }
    }

    return enemy
  }

  static getConfig(type: EnemyType): EnemyConfig | undefined {
    return enemyConfigs.get(type)
  }

  static getAllConfigs(): EnemyConfig[] {
    return Array.from(enemyConfigs.values())
  }
}
