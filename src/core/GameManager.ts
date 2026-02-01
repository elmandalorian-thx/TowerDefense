import { useGameStore } from '../stores/gameStore'
import { WaveManager } from './WaveManager'
import { PathManager } from './PathManager'
import { InputManager } from './InputManager'
import { EnemyMovementSystem } from '../systems/EnemyMovementSystem'
import { EnemyHealthSystem } from '../systems/EnemyHealthSystem'
import { TowerTargetingSystem } from '../systems/TowerTargetingSystem'
import { TowerAttackSystem } from '../systems/TowerAttackSystem'
import { ProjectileSystem } from '../systems/ProjectileSystem'
import { HeroMovementSystem } from '../systems/HeroMovementSystem'
import { HeroAbilitySystem } from '../systems/HeroAbilitySystem'
import { HeroCombatSystem } from '../systems/HeroCombatSystem'
import { HeroFactory } from '../entities/HeroFactory'
import testMap from '../data/maps/testMap.json'

export class GameManager {
  private waveManager: WaveManager
  private pathManager: PathManager
  private inputManager: InputManager
  private enemyMovementSystem: EnemyMovementSystem
  private enemyHealthSystem: EnemyHealthSystem
  private towerTargetingSystem: TowerTargetingSystem
  private towerAttackSystem: TowerAttackSystem
  private projectileSystem: ProjectileSystem
  private heroMovementSystem: HeroMovementSystem
  private heroAbilitySystem: HeroAbilitySystem
  private heroCombatSystem: HeroCombatSystem

  constructor() {
    this.pathManager = new PathManager()
    this.waveManager = new WaveManager()
    this.inputManager = new InputManager()
    this.enemyMovementSystem = new EnemyMovementSystem()
    this.enemyHealthSystem = new EnemyHealthSystem()
    this.towerTargetingSystem = new TowerTargetingSystem()
    this.towerAttackSystem = new TowerAttackSystem()
    this.projectileSystem = new ProjectileSystem()
    this.heroMovementSystem = new HeroMovementSystem()
    this.heroAbilitySystem = new HeroAbilitySystem()
    this.heroCombatSystem = new HeroCombatSystem()
  }

  initialize(): void {
    const store = useGameStore.getState()

    // Load map data
    this.pathManager.setPath(testMap.path)
    store.setPath(testMap.path)
    store.setTowerSpots(testMap.towerSpots)

    // Initialize wave manager
    this.waveManager.initialize()

    // Create hero
    const hero = HeroFactory.create('captainZara', { x: 0, y: 0, z: 5 })
    store.setHero(hero)

    // Initialize input
    this.inputManager.initialize()
  }

  update(delta: number): void {
    const store = useGameStore.getState()

    if (store.gameState !== 'playing') return

    // Update wave spawning
    this.waveManager.update(delta)

    // Update enemies
    this.enemyMovementSystem.update(delta)
    this.enemyHealthSystem.update(delta)

    // Update towers
    this.towerTargetingSystem.update(delta)
    this.towerAttackSystem.update(delta)

    // Update projectiles
    this.projectileSystem.update(delta)

    // Update hero
    this.heroMovementSystem.update(delta)
    this.heroAbilitySystem.update(delta)
    this.heroCombatSystem.update(delta)

    // Check win condition
    this.checkWinCondition()
  }

  private checkWinCondition(): void {
    const store = useGameStore.getState()
    const { currentWave, totalWaves, waveInProgress, enemies, enemiesRemainingInWave } = store

    if (
      currentWave >= totalWaves &&
      !waveInProgress &&
      enemies.length === 0 &&
      enemiesRemainingInWave === 0
    ) {
      store.setGameState('won')
    }
  }

  cleanup(): void {
    this.inputManager.cleanup()
    this.waveManager.cleanup()
  }
}
