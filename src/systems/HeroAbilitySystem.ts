import { useGameStore } from '../stores/gameStore'
import { EnemyHealthSystem } from './EnemyHealthSystem'
import { distance2D } from '../utils/helpers'
import type { AbilityKey, Ability, Vector3D } from '../types'

export class HeroAbilitySystem {
  private pendingAbility: AbilityKey | null = null

  constructor() {
    // Listen for ability key presses
    window.addEventListener('heroAbility', ((e: CustomEvent) => {
      this.pendingAbility = e.detail.key as AbilityKey
    }) as EventListener)
  }

  update(delta: number): void {
    const store = useGameStore.getState()
    const { hero } = store

    if (!hero) return

    // Update cooldowns
    const updatedAbilities = { ...hero.abilities }
    let abilitiesChanged = false

    for (const key of ['Q', 'W', 'R'] as AbilityKey[]) {
      if (updatedAbilities[key].currentCooldown > 0) {
        updatedAbilities[key] = {
          ...updatedAbilities[key],
          currentCooldown: Math.max(0, updatedAbilities[key].currentCooldown - delta),
        }
        abilitiesChanged = true
      }
    }

    if (abilitiesChanged) {
      store.updateHero({ abilities: updatedAbilities })
    }

    // Handle pending ability
    if (this.pendingAbility) {
      this.executeAbility(this.pendingAbility)
      this.pendingAbility = null
    }
  }

  private executeAbility(key: AbilityKey): void {
    const store = useGameStore.getState()
    const { hero, enemies } = store

    if (!hero) return

    const ability = hero.abilities[key]
    if (ability.currentCooldown > 0) return

    switch (key) {
      case 'Q':
        this.executePlasmaBurst(hero.position, ability, enemies)
        break
      case 'W':
        this.executeEnergyShield(ability)
        break
      case 'R':
        this.executeOrbitalStrike(hero.position, ability, enemies)
        break
    }

    // Start cooldown
    const updatedAbilities = {
      ...hero.abilities,
      [key]: { ...ability, currentCooldown: ability.cooldown },
    }
    store.updateHero({ abilities: updatedAbilities })
  }

  private executePlasmaBurst(
    position: Vector3D,
    ability: Ability,
    enemies: ReturnType<typeof useGameStore.getState>['enemies']
  ): void {
    const radius = ability.radius || 2
    const damage = ability.damage || 80

    for (const enemy of enemies) {
      if (enemy.isDead) continue

      const dist = distance2D(position, enemy.position)
      if (dist <= radius) {
        EnemyHealthSystem.damageEnemy(enemy.id, damage)
      }
    }
  }

  private executeEnergyShield(_ability: Ability): void {
    // For now, just a visual effect - actual shield mechanic would need more state
    const store = useGameStore.getState()
    const { hero } = store

    if (!hero) return

    // Could add a shield state to hero, for now just heal a bit
    const newHealth = Math.min(hero.maxHealth, hero.health + 50)
    store.updateHero({ health: newHealth })
  }

  private executeOrbitalStrike(
    position: Vector3D,
    ability: Ability,
    enemies: ReturnType<typeof useGameStore.getState>['enemies']
  ): void {
    const radius = ability.radius || 4
    const damage = ability.damage || 200

    for (const enemy of enemies) {
      if (enemy.isDead) continue

      const dist = distance2D(position, enemy.position)
      if (dist <= radius) {
        // Damage falls off with distance
        const falloff = 1 - dist / (radius * 1.5)
        const actualDamage = Math.floor(damage * falloff)
        EnemyHealthSystem.damageEnemy(enemy.id, actualDamage)
      }
    }
  }

}
