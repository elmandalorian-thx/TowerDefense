import { useGameStore } from '../stores/gameStore'

export class EnemyHealthSystem {
  update(_delta: number): void {
    const store = useGameStore.getState()
    const { enemies } = store

    for (const enemy of enemies) {
      if (enemy.health <= 0 && !enemy.isDead) {
        this.killEnemy(enemy.id)
      }
    }
  }

  private killEnemy(enemyId: string): void {
    const store = useGameStore.getState()
    const enemy = store.enemies.find((e) => e.id === enemyId)

    if (!enemy) return

    store.updateEnemy(enemyId, { isDead: true })
    store.addCurrency(enemy.reward)
    store.addScore(enemy.reward * 10)
    store.removeEnemy(enemyId)
    store.decrementEnemiesRemaining()
  }

  static damageEnemy(enemyId: string, damage: number): void {
    const store = useGameStore.getState()
    const enemy = store.enemies.find((e) => e.id === enemyId)

    if (!enemy || enemy.isDead) return

    const newHealth = Math.max(0, enemy.health - damage)
    store.updateEnemy(enemyId, { health: newHealth })
  }
}
