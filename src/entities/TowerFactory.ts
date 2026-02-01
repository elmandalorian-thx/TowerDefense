import type { Tower, TowerType, TowerTier, TowerConfig, TowerUpgrade, Vector3D } from '../types'
import { createTower, canUpgradeTo } from './Tower'
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

  static getUpgrade(type: TowerType, tier: TowerTier): TowerUpgrade | undefined {
    const config = towerConfigs.get(type)
    if (!config) return undefined

    switch (tier) {
      case 2:
        return config.upgrades.tier2
      case 3:
        return config.upgrades.tier3
      case '4A':
        return config.upgrades.tier4A
      case '4B':
        return config.upgrades.tier4B
      default:
        return undefined
    }
  }

  static getUpgradeCost(type: TowerType, tier: TowerTier): number {
    const upgrade = this.getUpgrade(type, tier)
    return upgrade?.cost ?? 0
  }

  static getAvailableUpgrades(tower: Tower): TowerUpgrade[] {
    const config = towerConfigs.get(tower.type)
    if (!config) return []

    const upgrades: TowerUpgrade[] = []

    switch (tower.tier) {
      case 1:
        upgrades.push(config.upgrades.tier2)
        break
      case 2:
        upgrades.push(config.upgrades.tier3)
        break
      case 3:
        // Branching point - show both tier 4 options
        upgrades.push(config.upgrades.tier4A)
        upgrades.push(config.upgrades.tier4B)
        break
      // case '4A' and '4B' - max tier, no upgrades
    }

    return upgrades
  }

  static applyUpgrade(tower: Tower, targetTier: TowerTier): Tower | null {
    // Validate the upgrade is valid
    if (!canUpgradeTo(tower.tier, targetTier)) {
      return null
    }

    const config = towerConfigs.get(tower.type)
    if (!config) return null

    const upgrade = this.getUpgrade(tower.type, targetTier)
    if (!upgrade) return null

    // Calculate new stats by applying modifiers
    const updatedTower: Tower = {
      ...tower,
      tier: targetTier,
      totalInvested: tower.totalInvested + upgrade.cost,
    }

    // Apply stat modifiers (multiplicative)
    if (upgrade.statModifiers.damage !== undefined) {
      updatedTower.damage = tower.damage * upgrade.statModifiers.damage
    }
    if (upgrade.statModifiers.range !== undefined) {
      updatedTower.range = tower.range * upgrade.statModifiers.range
    }
    if (upgrade.statModifiers.fireRate !== undefined) {
      updatedTower.fireRate = tower.fireRate * upgrade.statModifiers.fireRate
    }
    if (upgrade.statModifiers.splashRadius !== undefined && tower.splashRadius !== undefined) {
      updatedTower.splashRadius = tower.splashRadius * upgrade.statModifiers.splashRadius
    }

    // Apply special effect
    if (upgrade.specialEffect) {
      updatedTower.specialEffect = upgrade.specialEffect
    }

    // Track which path was taken at tier 4
    if (targetTier === '4A' || targetTier === '4B') {
      updatedTower.upgradePath = targetTier
    }

    return updatedTower
  }

  static getTowerDisplayName(tower: Tower): string {
    const config = towerConfigs.get(tower.type)
    if (!config) return 'Unknown'

    if (tower.tier === 1) return config.name

    const upgrade = this.getUpgrade(tower.type, tower.tier)
    return upgrade?.name ?? config.name
  }

  static getTowerColor(tower: Tower): string {
    const config = towerConfigs.get(tower.type)
    if (!config) return '#ffffff'

    if (tower.tier === 1) return config.stats.color

    const upgrade = this.getUpgrade(tower.type, tower.tier)
    return upgrade?.color ?? config.stats.color
  }

  static getSellValue(tower: Tower): number {
    // Return 60% of total invested
    return Math.floor(tower.totalInvested * 0.6)
  }
}
