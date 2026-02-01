import { Howl, Howler } from 'howler'
import audioConfig from '../data/audio.json'
import { SynthAudio, SoundType } from './SynthAudio'

// Sound categories for volume control
export type SoundCategory = 'sfx' | 'music' | 'ambient'

// Sound identifiers matching audio.json
export type SoundId = keyof typeof audioConfig.sounds

// Volume settings interface
export interface VolumeSettings {
  master: number
  sfx: number
  music: number
  ambient: number
}

// Spatial audio position
export interface AudioPosition {
  x: number
  y: number
  z: number
}

// Sound pool for frequently played sounds
interface SoundPool {
  sounds: Howl[]
  currentIndex: number
  category: SoundCategory
}

// Audio Manager Singleton
class AudioManagerClass {
  private static instance: AudioManagerClass | null = null

  private volumes: VolumeSettings = {
    master: 0.7,
    sfx: 0.8,
    music: 0.5,
    ambient: 0.4,
  }

  private soundPools: Map<SoundId, SoundPool> = new Map()
  private activeSounds: Map<string, Howl> = new Map()
  private synthAudio: SynthAudio | null = null
  private initialized: boolean = false
  private listenerPosition: AudioPosition = { x: 0, y: 15, z: 15 }

  private constructor() {
    // Private constructor for singleton
  }

  static getInstance(): AudioManagerClass {
    if (!AudioManagerClass.instance) {
      AudioManagerClass.instance = new AudioManagerClass()
    }
    return AudioManagerClass.instance
  }

  async initialize(): Promise<void> {
    if (this.initialized) return

    // Initialize Howler global settings
    Howler.volume(this.volumes.master)

    // Initialize synthesizer for generated sounds
    this.synthAudio = new SynthAudio()
    await this.synthAudio.initialize()

    // Pre-generate and pool frequently used sounds
    await this.initializeSoundPools()

    this.initialized = true
    console.log('[AudioManager] Initialized')
  }

  private async initializeSoundPools(): Promise<void> {
    if (!this.synthAudio) return

    // Create pools for frequently played sounds
    const poolConfig: { id: SoundId; poolSize: number }[] = [
      { id: 'tower_plasma_fire', poolSize: 5 },
      { id: 'tower_rail_fire', poolSize: 5 },
      { id: 'tower_nova_fire', poolSize: 3 },
      { id: 'enemy_death_splat', poolSize: 8 },
      { id: 'enemy_death_zap', poolSize: 8 },
      { id: 'enemy_death_explosion', poolSize: 5 },
      { id: 'ui_click', poolSize: 3 },
      { id: 'ui_hover', poolSize: 3 },
    ]

    for (const config of poolConfig) {
      await this.createSoundPool(config.id, config.poolSize)
    }
  }

  private async createSoundPool(soundId: SoundId, poolSize: number): Promise<void> {
    if (!this.synthAudio) return

    const soundConfig = audioConfig.sounds[soundId]
    if (!soundConfig) return

    const pool: SoundPool = {
      sounds: [],
      currentIndex: 0,
      category: soundConfig.category as SoundCategory,
    }

    for (let i = 0; i < poolSize; i++) {
      const dataUrl = await this.synthAudio.generateSound(
        soundConfig.type as SoundType,
        soundConfig.params
      )

      const howl = new Howl({
        src: [dataUrl],
        volume: this.calculateVolume(soundConfig.category as SoundCategory, soundConfig.volume),
        pool: 1,
      })

      pool.sounds.push(howl)
    }

    this.soundPools.set(soundId, pool)
  }

  private calculateVolume(category: SoundCategory, baseVolume: number = 1): number {
    const categoryVolume = this.volumes[category] || 1
    return baseVolume * categoryVolume * this.volumes.master
  }

  // Play a sound from the pool (for frequently played sounds)
  play(soundId: SoundId, position?: AudioPosition): number {
    if (!this.initialized) {
      console.warn('[AudioManager] Not initialized')
      return -1
    }

    const pool = this.soundPools.get(soundId)

    if (pool) {
      return this.playFromPool(pool, position)
    }

    // If not pooled, generate and play on demand
    return this.playOnDemand(soundId, position)
  }

  private playFromPool(pool: SoundPool, position?: AudioPosition): number {
    const sound = pool.sounds[pool.currentIndex]
    pool.currentIndex = (pool.currentIndex + 1) % pool.sounds.length

    // Update volume in case settings changed
    sound.volume(this.calculateVolume(pool.category))

    // Apply spatial audio if position provided
    if (position) {
      this.applySpatialAudio(sound, position)
    }

    return sound.play()
  }

  private playOnDemand(soundId: SoundId, position?: AudioPosition): number {
    if (!this.synthAudio) return -1

    const soundConfig = audioConfig.sounds[soundId]
    if (!soundConfig) {
      console.warn(`[AudioManager] Unknown sound: ${soundId}`)
      return -1
    }

    // Generate sound asynchronously and play
    this.synthAudio.generateSound(
      soundConfig.type as SoundType,
      soundConfig.params
    ).then(dataUrl => {
      const howl = new Howl({
        src: [dataUrl],
        volume: this.calculateVolume(soundConfig.category as SoundCategory, soundConfig.volume),
        onend: () => howl.unload(),
      })

      if (position) {
        this.applySpatialAudio(howl, position)
      }

      howl.play()
    })

    return 0
  }

  private applySpatialAudio(sound: Howl, position: AudioPosition): void {
    // Calculate distance from listener
    const dx = position.x - this.listenerPosition.x
    const dy = position.y - this.listenerPosition.y
    const dz = position.z - this.listenerPosition.z
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

    // Calculate pan based on x position (-1 to 1)
    const maxPanDistance = 20
    const pan = Math.max(-1, Math.min(1, dx / maxPanDistance))

    // Calculate volume falloff based on distance
    const maxDistance = 50
    const minDistance = 5
    const volumeFalloff = Math.max(0, 1 - (distance - minDistance) / (maxDistance - minDistance))

    // Apply stereo pan
    sound.stereo(pan)

    // Apply distance-based volume reduction
    const currentVolume = sound.volume() as number
    sound.volume(currentVolume * volumeFalloff)
  }

  // Play looping ambient/music
  playLoop(soundId: SoundId): string {
    if (!this.initialized || !this.synthAudio) return ''

    const soundConfig = audioConfig.sounds[soundId]
    if (!soundConfig) return ''

    const instanceId = `${soundId}_${Date.now()}`

    this.synthAudio.generateSound(
      soundConfig.type as SoundType,
      soundConfig.params
    ).then(dataUrl => {
      const howl = new Howl({
        src: [dataUrl],
        volume: this.calculateVolume(soundConfig.category as SoundCategory, soundConfig.volume),
        loop: true,
      })

      this.activeSounds.set(instanceId, howl)
      howl.play()
    })

    return instanceId
  }

  // Stop a looping sound
  stopLoop(instanceId: string): void {
    const sound = this.activeSounds.get(instanceId)
    if (sound) {
      sound.fade(sound.volume() as number, 0, 500)
      setTimeout(() => {
        sound.stop()
        sound.unload()
        this.activeSounds.delete(instanceId)
      }, 500)
    }
  }

  // Volume control methods
  setMasterVolume(volume: number): void {
    this.volumes.master = Math.max(0, Math.min(1, volume))
    Howler.volume(this.volumes.master)
    this.updateAllVolumes()
  }

  setSfxVolume(volume: number): void {
    this.volumes.sfx = Math.max(0, Math.min(1, volume))
    this.updatePoolVolumes('sfx')
  }

  setMusicVolume(volume: number): void {
    this.volumes.music = Math.max(0, Math.min(1, volume))
    this.updateActiveVolumes('music')
  }

  setAmbientVolume(volume: number): void {
    this.volumes.ambient = Math.max(0, Math.min(1, volume))
    this.updateActiveVolumes('ambient')
  }

  private updateAllVolumes(): void {
    this.updatePoolVolumes('sfx')
    this.updateActiveVolumes('music')
    this.updateActiveVolumes('ambient')
  }

  private updatePoolVolumes(category: SoundCategory): void {
    for (const [soundId, pool] of this.soundPools) {
      if (pool.category === category) {
        const soundConfig = audioConfig.sounds[soundId]
        const newVolume = this.calculateVolume(category, soundConfig?.volume)
        pool.sounds.forEach(sound => sound.volume(newVolume))
      }
    }
  }

  private updateActiveVolumes(category: SoundCategory): void {
    for (const [instanceId, sound] of this.activeSounds) {
      const soundId = instanceId.split('_')[0] as SoundId
      const soundConfig = audioConfig.sounds[soundId]
      if (soundConfig?.category === category) {
        sound.volume(this.calculateVolume(category, soundConfig.volume))
      }
    }
  }

  getVolumes(): VolumeSettings {
    return { ...this.volumes }
  }

  // Update listener position for spatial audio
  setListenerPosition(position: AudioPosition): void {
    this.listenerPosition = { ...position }
  }

  // Mute/unmute all audio
  mute(muted: boolean): void {
    Howler.mute(muted)
  }

  // Check if audio is muted
  isMuted(): boolean {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (Howler as any)._muted ?? false
  }

  // Stop all sounds
  stopAll(): void {
    Howler.stop()
    this.activeSounds.clear()
  }

  // Clean up resources
  dispose(): void {
    this.stopAll()

    for (const pool of this.soundPools.values()) {
      pool.sounds.forEach(sound => sound.unload())
    }
    this.soundPools.clear()

    if (this.synthAudio) {
      this.synthAudio.dispose()
    }

    this.initialized = false
    AudioManagerClass.instance = null
  }
}

// Export singleton instance
export const AudioManager = AudioManagerClass.getInstance()

// Export convenience functions for common sounds
export const playTowerFire = (towerType: string, position?: AudioPosition) => {
  const soundMap: Record<string, SoundId> = {
    plasmaSpire: 'tower_plasma_fire',
    railCannon: 'tower_rail_fire',
    novaLauncher: 'tower_nova_fire',
  }
  AudioManager.play(soundMap[towerType] || 'tower_plasma_fire', position)
}

export const playEnemyDeath = (enemyType: string, position?: AudioPosition) => {
  const soundMap: Record<string, SoundId> = {
    blobbert: 'enemy_death_splat',
    sirScuttles: 'enemy_death_zap',
    chonkzilla: 'enemy_death_explosion',
    floofernaut: 'enemy_death_zap',
  }
  AudioManager.play(soundMap[enemyType] || 'enemy_death_splat', position)
}

export const playAbility = (abilityKey: string, _heroType: string) => {
  const soundMap: Record<string, SoundId> = {
    Q: 'hero_ability_q',
    W: 'hero_ability_w',
    R: 'hero_ability_r',
  }
  AudioManager.play(soundMap[abilityKey] || 'hero_ability_q')
}

export const playUISound = (type: 'click' | 'hover' | 'purchase' | 'error') => {
  const soundMap: Record<string, SoundId> = {
    click: 'ui_click',
    hover: 'ui_hover',
    purchase: 'ui_purchase',
    error: 'ui_error',
  }
  AudioManager.play(soundMap[type])
}

export const playWaveSound = (type: 'start' | 'complete') => {
  const soundMap: Record<string, SoundId> = {
    start: 'wave_start',
    complete: 'wave_complete',
  }
  AudioManager.play(soundMap[type])
}
