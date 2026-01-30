// ============ Core Types ============

export type GameState = 'menu' | 'playing' | 'paused' | 'won' | 'lost'

export interface Vector2D {
  x: number
  y: number
}

export interface Vector3D {
  x: number
  y: number
  z: number
}

// ============ Entity Types ============

export interface Entity {
  id: string
  position: Vector3D
  rotation: number
}

// ============ Enemy Types ============

export type EnemyType = 'blobbert' | 'sirScuttles' | 'chonkzilla' | 'floofernaut'

export interface EnemyStats {
  maxHealth: number
  speed: number
  damage: number
  reward: number
  size: number
  color: string
}

export interface Enemy extends Entity {
  type: EnemyType
  health: number
  maxHealth: number
  speed: number
  damage: number
  reward: number
  pathIndex: number
  pathProgress: number
  isDead: boolean
  reachedEnd: boolean
}

export interface EnemyConfig {
  type: EnemyType
  name: string
  stats: EnemyStats
  description: string
}

// ============ Tower Types ============

export type TowerType = 'plasmaSpire' | 'railCannon' | 'novaLauncher'

export interface TowerStats {
  damage: number
  range: number
  fireRate: number
  projectileSpeed: number
  cost: number
  color: string
  splashRadius?: number
}

export interface Tower extends Entity {
  type: TowerType
  damage: number
  range: number
  fireRate: number
  projectileSpeed: number
  lastFireTime: number
  targetId: string | null
  splashRadius?: number
}

export interface TowerConfig {
  type: TowerType
  name: string
  stats: TowerStats
  description: string
}

// ============ Projectile Types ============

export interface Projectile extends Entity {
  sourceId: string
  targetId: string
  damage: number
  speed: number
  splashRadius?: number
  targetPosition: Vector3D
  startPosition: Vector3D
  progress: number
}

// ============ Hero Types ============

export type HeroType = 'captainZara'

export type AbilityKey = 'Q' | 'W' | 'R'

export interface Ability {
  key: AbilityKey
  name: string
  description: string
  cooldown: number
  currentCooldown: number
  damage?: number
  radius?: number
  duration?: number
}

export interface HeroStats {
  maxHealth: number
  speed: number
  damage: number
  attackRange: number
  attackSpeed: number
}

export interface Hero extends Entity {
  type: HeroType
  name: string
  health: number
  maxHealth: number
  speed: number
  damage: number
  attackRange: number
  attackSpeed: number
  lastAttackTime: number
  targetId: string | null
  targetPosition: Vector3D | null
  abilities: Record<AbilityKey, Ability>
  isMoving: boolean
}

export interface HeroConfig {
  type: HeroType
  name: string
  stats: HeroStats
  abilities: Record<AbilityKey, Omit<Ability, 'currentCooldown'>>
  description: string
}

// ============ Map Types ============

export interface PathPoint extends Vector3D {}

export interface TowerSpot {
  id: string
  position: Vector3D
  occupied: boolean
}

export interface MapConfig {
  name: string
  groundSize: Vector2D
  path: PathPoint[]
  towerSpots: TowerSpot[]
  spawnPoint: Vector3D
  basePosition: Vector3D
}

// ============ Wave Types ============

export interface WaveEnemy {
  type: EnemyType
  count: number
  spawnDelay: number
}

export interface Wave {
  id: number
  enemies: WaveEnemy[]
  delayBetweenWaves: number
}

export interface WaveConfig {
  waves: Wave[]
}

// ============ Game Store Types ============

export interface GameStoreState {
  // Game state
  gameState: GameState
  currency: number
  lives: number
  maxLives: number
  score: number

  // Entities
  enemies: Enemy[]
  towers: Tower[]
  projectiles: Projectile[]
  hero: Hero | null

  // Map
  towerSpots: TowerSpot[]
  path: PathPoint[]

  // Wave
  currentWave: number
  totalWaves: number
  waveInProgress: boolean
  enemiesRemainingInWave: number

  // UI state
  selectedTowerType: TowerType | null
  selectedTowerId: string | null
  hoveredSpotId: string | null

  // Actions
  setGameState: (state: GameState) => void
  setCurrency: (amount: number) => void
  addCurrency: (amount: number) => void
  spendCurrency: (amount: number) => boolean
  setLives: (lives: number) => void
  loseLives: (amount: number) => void
  addScore: (points: number) => void

  // Entity actions
  addEnemy: (enemy: Enemy) => void
  updateEnemy: (id: string, updates: Partial<Enemy>) => void
  removeEnemy: (id: string) => void

  addTower: (tower: Tower) => void
  updateTower: (id: string, updates: Partial<Tower>) => void
  removeTower: (id: string) => void

  addProjectile: (projectile: Projectile) => void
  removeProjectile: (id: string) => void

  setHero: (hero: Hero | null) => void
  updateHero: (updates: Partial<Hero>) => void

  // Map actions
  setTowerSpots: (spots: TowerSpot[]) => void
  occupyTowerSpot: (spotId: string) => void
  freeTowerSpot: (spotId: string) => void
  setPath: (path: PathPoint[]) => void

  // Wave actions
  setCurrentWave: (wave: number) => void
  setTotalWaves: (total: number) => void
  setWaveInProgress: (inProgress: boolean) => void
  setEnemiesRemainingInWave: (count: number) => void
  decrementEnemiesRemaining: () => void

  // UI actions
  setSelectedTowerType: (type: TowerType | null) => void
  setSelectedTowerId: (id: string | null) => void
  setHoveredSpotId: (id: string | null) => void

  // Game actions
  resetGame: () => void
}
