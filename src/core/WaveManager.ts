import { useGameStore } from '../stores/gameStore'
import { EnemyFactory } from '../entities/EnemyFactory'
import wavesData from '../data/waves.json'
import testMap from '../data/maps/testMap.json'
import type { Wave, WaveEnemy, EnemyType } from '../types'

export class WaveManager {
  private waves: Wave[] = []
  private currentWaveIndex: number = 0
  private spawnQueue: { type: EnemyType; delay: number }[] = []
  private spawnTimer: number = 0
  private waveDelayTimer: number = 0
  private isSpawning: boolean = false
  private betweenWaves: boolean = true

  initialize(): void {
    this.waves = wavesData.waves as Wave[]
    const store = useGameStore.getState()
    store.setTotalWaves(this.waves.length)
    store.setCurrentWave(0)
  }

  startNextWave(): void {
    const store = useGameStore.getState()

    if (this.currentWaveIndex >= this.waves.length) return
    if (store.waveInProgress) return

    const wave = this.waves[this.currentWaveIndex]
    this.spawnQueue = this.buildSpawnQueue(wave.enemies)

    store.setCurrentWave(this.currentWaveIndex + 1)
    store.setWaveInProgress(true)
    store.setEnemiesRemainingInWave(this.spawnQueue.length)

    this.isSpawning = true
    this.betweenWaves = false
    this.spawnTimer = 0
  }

  private buildSpawnQueue(enemies: WaveEnemy[]): { type: EnemyType; delay: number }[] {
    const queue: { type: EnemyType; delay: number }[] = []

    for (const group of enemies) {
      for (let i = 0; i < group.count; i++) {
        queue.push({
          type: group.type,
          delay: i === 0 ? 0 : group.spawnDelay,
        })
      }
    }

    return queue
  }

  update(delta: number): void {
    const store = useGameStore.getState()

    if (this.betweenWaves) {
      // Auto-start first wave
      if (this.currentWaveIndex === 0) {
        this.waveDelayTimer += delta
        if (this.waveDelayTimer >= 2) {
          this.startNextWave()
        }
      }
      return
    }

    if (!this.isSpawning) {
      // Check if wave is complete
      if (store.enemies.length === 0 && store.enemiesRemainingInWave === 0) {
        this.onWaveComplete()
      }
      return
    }

    this.spawnTimer += delta

    if (this.spawnQueue.length > 0) {
      const nextSpawn = this.spawnQueue[0]

      if (this.spawnTimer >= nextSpawn.delay) {
        this.spawnEnemy(nextSpawn.type)
        this.spawnQueue.shift()
        this.spawnTimer = 0
      }
    } else {
      this.isSpawning = false
    }
  }

  private spawnEnemy(type: EnemyType): void {
    const store = useGameStore.getState()
    const enemy = EnemyFactory.create(type, testMap.spawnPoint)
    store.addEnemy(enemy)
  }

  private onWaveComplete(): void {
    const store = useGameStore.getState()
    store.setWaveInProgress(false)

    this.currentWaveIndex++

    if (this.currentWaveIndex < this.waves.length) {
      this.betweenWaves = true
      this.waveDelayTimer = 0

      // Auto-start next wave after delay
      const previousWave = this.waves[this.currentWaveIndex - 1]
      setTimeout(() => {
        if (store.gameState === 'playing') {
          this.startNextWave()
        }
      }, previousWave.delayBetweenWaves * 1000)
    }
  }

  getCurrentWaveIndex(): number {
    return this.currentWaveIndex
  }

  getTotalWaves(): number {
    return this.waves.length
  }
}
