import { create } from 'zustand'

export type EffectTrigger = 'enemyDeath' | 'ultimateAbility' | 'towerFire' | 'impact'

interface ChromaticAberrationState {
  active: boolean
  intensity: number
  startTime: number
  duration: number
}

interface EffectsStoreState {
  // Chromatic aberration state
  chromaticAberration: ChromaticAberrationState

  // Screen shake intensity (managed separately via ScreenShake.ts)
  screenShakeActive: boolean

  // Actions
  triggerChromaticAberration: (intensity: number, duration: number) => void
  updateChromaticAberration: (delta: number) => number
  setScreenShakeActive: (active: boolean) => void
  triggerEffect: (trigger: EffectTrigger) => void
}

// Effect configurations for different triggers
const EFFECT_CONFIGS: Record<EffectTrigger, { chromaIntensity: number; chromaDuration: number; shakeIntensity: 'subtle' | 'medium' | 'heavy' | null }> = {
  enemyDeath: {
    chromaIntensity: 0.003,
    chromaDuration: 0.1,
    shakeIntensity: 'subtle',
  },
  ultimateAbility: {
    chromaIntensity: 0.015,
    chromaDuration: 0.3,
    shakeIntensity: 'heavy',
  },
  towerFire: {
    chromaIntensity: 0.001,
    chromaDuration: 0.05,
    shakeIntensity: null, // No shake for tower fire
  },
  impact: {
    chromaIntensity: 0.005,
    chromaDuration: 0.1,
    shakeIntensity: 'medium',
  },
}

export const useEffectsStore = create<EffectsStoreState>((set, get) => ({
  chromaticAberration: {
    active: false,
    intensity: 0,
    startTime: 0,
    duration: 0.1,
  },

  screenShakeActive: false,

  triggerChromaticAberration: (intensity: number, duration: number) => {
    set({
      chromaticAberration: {
        active: true,
        intensity,
        startTime: performance.now() / 1000,
        duration,
      },
    })
  },

  updateChromaticAberration: (_delta: number): number => {
    const { chromaticAberration } = get()

    if (!chromaticAberration.active) return 0

    const currentTime = performance.now() / 1000
    const elapsed = currentTime - chromaticAberration.startTime

    if (elapsed >= chromaticAberration.duration) {
      set({
        chromaticAberration: {
          ...chromaticAberration,
          active: false,
          intensity: 0,
        },
      })
      return 0
    }

    // Calculate current intensity with decay
    const progress = elapsed / chromaticAberration.duration
    const currentIntensity = chromaticAberration.intensity * (1 - progress)

    return currentIntensity
  },

  setScreenShakeActive: (active: boolean) => set({ screenShakeActive: active }),

  triggerEffect: (trigger: EffectTrigger) => {
    const config = EFFECT_CONFIGS[trigger]
    const { triggerChromaticAberration } = get()

    // Trigger chromatic aberration
    if (config.chromaIntensity > 0) {
      triggerChromaticAberration(config.chromaIntensity, config.chromaDuration)
    }

    // Dispatch screen shake event if configured
    if (config.shakeIntensity) {
      window.dispatchEvent(
        new CustomEvent('screenShake', {
          detail: { intensity: config.shakeIntensity },
        })
      )
    }
  },
}))

// Convenience functions for triggering effects from anywhere
export function triggerEnemyDeathEffect(): void {
  useEffectsStore.getState().triggerEffect('enemyDeath')
}

export function triggerUltimateEffect(): void {
  useEffectsStore.getState().triggerEffect('ultimateAbility')
}

export function triggerTowerFireEffect(): void {
  useEffectsStore.getState().triggerEffect('towerFire')
}

export function triggerImpactEffect(): void {
  useEffectsStore.getState().triggerEffect('impact')
}
