import { create } from 'zustand'
import type { GameStoreState, GameState, Enemy, Tower, Projectile, Hero, TowerSpot, PathPoint, TowerType, TowerTier } from '../types'
import { TowerFactory } from '../entities/TowerFactory'

const initialState = {
  gameState: 'playing' as GameState,
  currency: 200,
  lives: 20,
  maxLives: 20,
  score: 0,

  enemies: [] as Enemy[],
  towers: [] as Tower[],
  projectiles: [] as Projectile[],
  hero: null as Hero | null,

  towerSpots: [] as TowerSpot[],
  path: [] as PathPoint[],

  currentWave: 0,
  totalWaves: 5,
  waveInProgress: false,
  enemiesRemainingInWave: 0,

  selectedTowerType: null as TowerType | null,
  selectedTowerId: null as string | null,
  hoveredSpotId: null as string | null,
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  ...initialState,

  // Game state actions
  setGameState: (state) => set({ gameState: state }),
  setCurrency: (amount) => set({ currency: amount }),
  addCurrency: (amount) => set((state) => ({ currency: state.currency + amount })),
  spendCurrency: (amount) => {
    const { currency } = get()
    if (currency >= amount) {
      set({ currency: currency - amount })
      return true
    }
    return false
  },
  setLives: (lives) => set({ lives }),
  loseLives: (amount) => {
    const { lives, gameState } = get()
    const newLives = Math.max(0, lives - amount)
    set({ lives: newLives })
    if (newLives <= 0 && gameState === 'playing') {
      set({ gameState: 'lost' })
    }
  },
  addScore: (points) => set((state) => ({ score: state.score + points })),

  // Enemy actions
  addEnemy: (enemy) => set((state) => ({ enemies: [...state.enemies, enemy] })),
  updateEnemy: (id, updates) => set((state) => ({
    enemies: state.enemies.map((e) => (e.id === id ? { ...e, ...updates } : e)),
  })),
  removeEnemy: (id) => set((state) => ({
    enemies: state.enemies.filter((e) => e.id !== id),
  })),

  // Tower actions
  addTower: (tower) => set((state) => ({ towers: [...state.towers, tower] })),
  updateTower: (id, updates) => set((state) => ({
    towers: state.towers.map((t) => (t.id === id ? { ...t, ...updates } : t)),
  })),
  removeTower: (id) => set((state) => ({
    towers: state.towers.filter((t) => t.id !== id),
  })),

  // Projectile actions
  addProjectile: (projectile) => set((state) => ({
    projectiles: [...state.projectiles, projectile],
  })),
  removeProjectile: (id) => set((state) => ({
    projectiles: state.projectiles.filter((p) => p.id !== id),
  })),

  // Hero actions
  setHero: (hero) => set({ hero }),
  updateHero: (updates) => set((state) => ({
    hero: state.hero ? { ...state.hero, ...updates } : null,
  })),

  // Map actions
  setTowerSpots: (spots) => set({ towerSpots: spots }),
  occupyTowerSpot: (spotId) => set((state) => ({
    towerSpots: state.towerSpots.map((s) =>
      s.id === spotId ? { ...s, occupied: true } : s
    ),
  })),
  freeTowerSpot: (spotId) => set((state) => ({
    towerSpots: state.towerSpots.map((s) =>
      s.id === spotId ? { ...s, occupied: false } : s
    ),
  })),
  setPath: (path) => set({ path }),

  // Wave actions
  setCurrentWave: (wave) => set({ currentWave: wave }),
  setTotalWaves: (total) => set({ totalWaves: total }),
  setWaveInProgress: (inProgress) => set({ waveInProgress: inProgress }),
  setEnemiesRemainingInWave: (count) => set({ enemiesRemainingInWave: count }),
  decrementEnemiesRemaining: () => set((state) => ({
    enemiesRemainingInWave: Math.max(0, state.enemiesRemainingInWave - 1),
  })),

  // UI actions
  setSelectedTowerType: (type) => set({ selectedTowerType: type }),
  setSelectedTowerId: (id) => set({ selectedTowerId: id }),
  setHoveredSpotId: (id) => set({ hoveredSpotId: id }),

  // Tower upgrade actions
  upgradeTower: (towerId: string, targetTier: TowerTier) => {
    const { towers, currency } = get()
    const tower = towers.find((t) => t.id === towerId)

    if (!tower) return false

    const upgradeCost = TowerFactory.getUpgradeCost(tower.type, targetTier)
    if (currency < upgradeCost) return false

    const upgradedTower = TowerFactory.applyUpgrade(tower, targetTier)
    if (!upgradedTower) return false

    set({
      currency: currency - upgradeCost,
      towers: towers.map((t) => (t.id === towerId ? upgradedTower : t)),
    })
    return true
  },

  sellTower: (towerId: string) => {
    const { towers, towerSpots, currency } = get()
    const tower = towers.find((t) => t.id === towerId)

    if (!tower) return

    const sellValue = TowerFactory.getSellValue(tower)

    // Find and free the tower spot
    const spot = towerSpots.find(
      (s) => s.position.x === tower.position.x && s.position.z === tower.position.z
    )

    set({
      currency: currency + sellValue,
      towers: towers.filter((t) => t.id !== towerId),
      towerSpots: spot
        ? towerSpots.map((s) => (s.id === spot.id ? { ...s, occupied: false } : s))
        : towerSpots,
      selectedTowerId: null,
    })
  },

  // Game actions
  resetGame: () => set({
    ...initialState,
    gameState: 'playing',
  }),
}))
