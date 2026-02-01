import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { emitParticles, PARTICLE_COLORS } from '../ParticleSystem'

interface ExplosionEffectProps {
  position: { x: number; y: number; z: number }
  size?: 'small' | 'medium' | 'large' | 'massive'
  color?: 'default' | 'fire' | 'ice' | 'toxic' | 'cosmic'
  onComplete?: () => void
}

// Pre-defined explosion configurations
const EXPLOSION_CONFIGS = {
  small: {
    particleCount: 30,
    sizeRange: [0.08, 0.2] as [number, number],
    speedRange: [2, 5] as [number, number],
    lifeRange: [0.3, 0.6] as [number, number],
    spread: 1.5,
    flashSize: 0.5,
    flashDuration: 0.15,
  },
  medium: {
    particleCount: 60,
    sizeRange: [0.1, 0.35] as [number, number],
    speedRange: [3, 8] as [number, number],
    lifeRange: [0.4, 0.8] as [number, number],
    spread: 2,
    flashSize: 1,
    flashDuration: 0.2,
  },
  large: {
    particleCount: 120,
    sizeRange: [0.15, 0.5] as [number, number],
    speedRange: [4, 12] as [number, number],
    lifeRange: [0.5, 1.2] as [number, number],
    spread: 2.5,
    flashSize: 1.5,
    flashDuration: 0.25,
  },
  massive: {
    particleCount: 200,
    sizeRange: [0.2, 0.7] as [number, number],
    speedRange: [5, 15] as [number, number],
    lifeRange: [0.6, 1.5] as [number, number],
    spread: 3,
    flashSize: 2.5,
    flashDuration: 0.3,
  },
}

const COLOR_PALETTES = {
  default: [PARTICLE_COLORS.hotPink, PARTICLE_COLORS.electricBlue, PARTICLE_COLORS.plasmaWhite],
  fire: [PARTICLE_COLORS.cosmicOrange, PARTICLE_COLORS.stellarYellow, PARTICLE_COLORS.hotPink],
  ice: [PARTICLE_COLORS.electricBlue, PARTICLE_COLORS.plasmaWhite, '#88ddff'],
  toxic: [PARTICLE_COLORS.toxicGreen, PARTICLE_COLORS.stellarYellow, '#88ff44'],
  cosmic: [PARTICLE_COLORS.neonPurple, PARTICLE_COLORS.hotPink, PARTICLE_COLORS.electricBlue],
}

export function ExplosionEffect({
  position,
  size = 'medium',
  color = 'default',
  onComplete,
}: ExplosionEffectProps) {
  const flashRef = useRef<THREE.PointLight>(null)
  const startTime = useRef(Date.now())
  const emittedRef = useRef(false)
  const config = EXPLOSION_CONFIGS[size]
  const colors = COLOR_PALETTES[color]

  // Emit particles on mount
  useEffect(() => {
    if (emittedRef.current) return
    emittedRef.current = true

    // Main explosion burst
    emitParticles({
      position,
      count: config.particleCount,
      type: 'explosion',
      colors,
      sizeRange: config.sizeRange,
      speedRange: config.speedRange,
      lifeRange: config.lifeRange,
      spread: config.spread,
      gravity: 3,
      drag: 0.05,
      emissiveIntensity: 2,
    })

    // Secondary sparkle ring
    emitParticles({
      position: { x: position.x, y: position.y + 0.2, z: position.z },
      count: Math.floor(config.particleCount * 0.5),
      type: 'sparkle',
      colors: [PARTICLE_COLORS.plasmaWhite, colors[0]],
      sizeRange: [config.sizeRange[0] * 0.5, config.sizeRange[1] * 0.5],
      speedRange: [config.speedRange[0] * 0.6, config.speedRange[1] * 0.8],
      lifeRange: [config.lifeRange[0] * 0.7, config.lifeRange[1] * 0.8],
      spread: config.spread * 0.8,
      gravity: 1,
      drag: 0.03,
      emissiveIntensity: 3,
    })

    // Upward smoke/debris
    emitParticles({
      position: { x: position.x, y: position.y, z: position.z },
      count: Math.floor(config.particleCount * 0.3),
      type: 'cosmic',
      colors: ['#444444', '#666666', colors[1]],
      sizeRange: [config.sizeRange[1], config.sizeRange[1] * 1.5],
      speedRange: [1, 3],
      lifeRange: [0.8, 1.5],
      spread: 0.5,
      direction: { x: 0, y: 1, z: 0 } as unknown as THREE.Vector3,
      gravity: -2, // Rise up
      drag: 0.08,
      emissiveIntensity: 0.5,
    })
  }, [position, config, colors])

  useFrame(() => {
    const elapsed = (Date.now() - startTime.current) / 1000

    // Animate flash
    if (flashRef.current) {
      const flashProgress = elapsed / config.flashDuration
      if (flashProgress < 1) {
        flashRef.current.intensity = 5 * (1 - flashProgress)
      } else {
        flashRef.current.intensity = 0
      }
    }

    // Complete callback
    if (elapsed > Math.max(...config.lifeRange) + 0.5 && onComplete) {
      onComplete()
    }
  })

  return (
    <group position={[position.x, position.y, position.z]}>
      {/* Initial flash */}
      <pointLight
        ref={flashRef}
        color={colors[0]}
        intensity={5}
        distance={config.flashSize * 4}
        decay={2}
      />
    </group>
  )
}

// Static function to trigger explosion without component
export function triggerExplosion(
  position: { x: number; y: number; z: number },
  size: 'small' | 'medium' | 'large' | 'massive' = 'medium',
  color: 'default' | 'fire' | 'ice' | 'toxic' | 'cosmic' = 'default'
) {
  const config = EXPLOSION_CONFIGS[size]
  const colors = COLOR_PALETTES[color]

  // Main explosion burst
  emitParticles({
    position,
    count: config.particleCount,
    type: 'explosion',
    colors,
    sizeRange: config.sizeRange,
    speedRange: config.speedRange,
    lifeRange: config.lifeRange,
    spread: config.spread,
    gravity: 3,
    drag: 0.05,
    emissiveIntensity: 2,
  })

  // Secondary sparkle ring
  emitParticles({
    position: { x: position.x, y: position.y + 0.2, z: position.z },
    count: Math.floor(config.particleCount * 0.5),
    type: 'sparkle',
    colors: [PARTICLE_COLORS.plasmaWhite, colors[0]],
    sizeRange: [config.sizeRange[0] * 0.5, config.sizeRange[1] * 0.5],
    speedRange: [config.speedRange[0] * 0.6, config.speedRange[1] * 0.8],
    lifeRange: [config.lifeRange[0] * 0.7, config.lifeRange[1] * 0.8],
    spread: config.spread * 0.8,
    gravity: 1,
    drag: 0.03,
    emissiveIntensity: 3,
  })

  // Upward debris
  emitParticles({
    position: { x: position.x, y: position.y, z: position.z },
    count: Math.floor(config.particleCount * 0.3),
    type: 'cosmic',
    colors: ['#444444', '#666666', colors[1]],
    sizeRange: [config.sizeRange[1], config.sizeRange[1] * 1.5],
    speedRange: [1, 3],
    lifeRange: [0.8, 1.5],
    spread: 0.5,
    direction: { x: 0, y: 1, z: 0 } as unknown as THREE.Vector3,
    gravity: -2,
    drag: 0.08,
    emissiveIntensity: 0.5,
  })
}

// Specialized enemy death explosion based on enemy type
export function triggerEnemyDeathExplosion(
  position: { x: number; y: number; z: number },
  enemyType: string,
  enemySize: number
) {
  const sizeCategory = enemySize < 0.5 ? 'small' : enemySize < 1 ? 'medium' : enemySize < 1.5 ? 'large' : 'massive'

  // Different colors for different enemy types
  let colorPalette: 'default' | 'fire' | 'ice' | 'toxic' | 'cosmic' = 'default'
  switch (enemyType) {
    case 'blobbert':
      colorPalette = 'toxic'
      break
    case 'sirScuttles':
      colorPalette = 'fire'
      break
    case 'chonkzilla':
      colorPalette = 'cosmic'
      break
    case 'floofernaut':
      colorPalette = 'ice'
      break
  }

  triggerExplosion(position, sizeCategory, colorPalette)
}
