import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { emitParticles, PARTICLE_COLORS } from '../ParticleSystem'
import type { AbilityKey } from '../../types'

// Ability effect configurations
const ABILITY_CONFIGS: Record<AbilityKey, AbilityConfig> = {
  Q: {
    // Plasma Burst - circular AOE attack
    name: 'Plasma Burst',
    primaryColors: [PARTICLE_COLORS.hotPink, '#ff3388', PARTICLE_COLORS.neonPurple],
    secondaryColors: [PARTICLE_COLORS.plasmaWhite, '#ffaaff'],
    burstCount: 100,
    ringCount: 60,
    duration: 0.6,
    radius: 2.5,
    emissiveIntensity: 3,
  },
  W: {
    // Energy Shield - defensive bubble
    name: 'Energy Shield',
    primaryColors: [PARTICLE_COLORS.electricBlue, '#00ccff', PARTICLE_COLORS.plasmaWhite],
    secondaryColors: ['#88ddff', '#aaeeff'],
    burstCount: 50,
    ringCount: 80,
    duration: 3.0,
    radius: 1.2,
    emissiveIntensity: 2,
  },
  R: {
    // Orbital Strike - massive damage ability
    name: 'Orbital Strike',
    primaryColors: [PARTICLE_COLORS.stellarYellow, PARTICLE_COLORS.cosmicOrange, PARTICLE_COLORS.hotPink],
    secondaryColors: [PARTICLE_COLORS.plasmaWhite, '#ffdd88'],
    burstCount: 200,
    ringCount: 100,
    duration: 1.5,
    radius: 4,
    emissiveIntensity: 4,
  },
}

interface AbilityConfig {
  name: string
  primaryColors: string[]
  secondaryColors: string[]
  burstCount: number
  ringCount: number
  duration: number
  radius: number
  emissiveIntensity: number
}

interface AbilityEffectProps {
  position: { x: number; y: number; z: number }
  abilityKey: AbilityKey
  onComplete?: () => void
}

export function AbilityParticleEffect({
  position,
  abilityKey,
  onComplete,
}: AbilityEffectProps) {
  const startTime = useRef(Date.now())
  const emittedRef = useRef(false)
  const config = ABILITY_CONFIGS[abilityKey]

  useEffect(() => {
    if (emittedRef.current) return
    emittedRef.current = true

    switch (abilityKey) {
      case 'Q':
        triggerPlasmaBurstParticles(position)
        break
      case 'W':
        triggerEnergyShieldParticles(position)
        break
      case 'R':
        triggerOrbitalStrikeParticles(position)
        break
    }
  }, [position, abilityKey])

  useFrame(() => {
    const elapsed = (Date.now() - startTime.current) / 1000
    if (elapsed > config.duration + 0.5 && onComplete) {
      onComplete()
    }
  })

  return null
}

// Q Ability - Plasma Burst
export function triggerPlasmaBurstParticles(position: { x: number; y: number; z: number }) {
  const config = ABILITY_CONFIGS.Q

  // Initial burst - outward radial explosion
  emitParticles({
    position: { x: position.x, y: position.y + 0.5, z: position.z },
    count: config.burstCount,
    type: 'ability',
    colors: config.primaryColors,
    sizeRange: [0.15, 0.35],
    speedRange: [8, 15],
    lifeRange: [0.3, 0.6],
    spread: 2.5,
    gravity: -2,
    drag: 0.12,
    emissiveIntensity: config.emissiveIntensity,
  })

  // Ground ring expanding outward
  const ringParticleCount = config.ringCount
  for (let i = 0; i < ringParticleCount; i++) {
    const angle = (i / ringParticleCount) * Math.PI * 2
    const delay = Math.random() * 0.1

    setTimeout(() => {
      emitParticles({
        position: {
          x: position.x + Math.cos(angle) * 0.3,
          y: position.y + 0.1,
          z: position.z + Math.sin(angle) * 0.3,
        },
        count: 3,
        type: 'plasma',
        colors: config.secondaryColors,
        sizeRange: [0.08, 0.18],
        speedRange: [4, 8],
        lifeRange: [0.2, 0.4],
        spread: 0.3,
        direction: { x: Math.cos(angle), y: 0.2, z: Math.sin(angle) },
        gravity: 3,
        drag: 0.08,
        emissiveIntensity: config.emissiveIntensity * 1.2,
      })
    }, delay * 1000)
  }

  // Upward energy column
  emitParticles({
    position: { x: position.x, y: position.y, z: position.z },
    count: 40,
    type: 'ability',
    colors: [PARTICLE_COLORS.plasmaWhite, config.primaryColors[0]],
    sizeRange: [0.1, 0.25],
    speedRange: [3, 8],
    lifeRange: [0.4, 0.8],
    spread: 0.5,
    direction: { x: 0, y: 1, z: 0 },
    gravity: -5,
    drag: 0.05,
    emissiveIntensity: config.emissiveIntensity * 1.5,
  })
}

// W Ability - Energy Shield
export function triggerEnergyShieldParticles(position: { x: number; y: number; z: number }) {
  const config = ABILITY_CONFIGS.W
  const radius = config.radius

  // Shield activation burst
  emitParticles({
    position: { x: position.x, y: position.y + 0.8, z: position.z },
    count: config.burstCount,
    type: 'ability',
    colors: config.primaryColors,
    sizeRange: [0.06, 0.15],
    speedRange: [1, 3],
    lifeRange: [0.4, 0.8],
    spread: radius * 1.2,
    gravity: 0,
    drag: 0.15,
    emissiveIntensity: config.emissiveIntensity,
  })

  // Sphere surface particles
  const surfaceCount = config.ringCount
  for (let i = 0; i < surfaceCount; i++) {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const x = Math.sin(phi) * Math.cos(theta) * radius
    const y = Math.sin(phi) * Math.sin(theta) * radius
    const z = Math.cos(phi) * radius

    emitParticles({
      position: {
        x: position.x + x,
        y: position.y + 0.8 + y,
        z: position.z + z,
      },
      count: 2,
      type: 'sparkle',
      colors: config.secondaryColors,
      sizeRange: [0.04, 0.1],
      speedRange: [0.2, 0.5],
      lifeRange: [0.5, 1.0],
      spread: 0.1,
      gravity: 0,
      drag: 0.2,
      emissiveIntensity: config.emissiveIntensity,
    })
  }

  // Continuous shield shimmer (emit over time)
  const shieldDuration = 3000 // 3 seconds
  const emitInterval = 100 // Every 100ms

  let elapsed = 0
  const intervalId = setInterval(() => {
    elapsed += emitInterval

    if (elapsed >= shieldDuration) {
      clearInterval(intervalId)
      return
    }

    // Random point on sphere surface
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const x = Math.sin(phi) * Math.cos(theta) * radius
    const y = Math.sin(phi) * Math.sin(theta) * radius * 0.8
    const z = Math.cos(phi) * radius

    emitParticles({
      position: {
        x: position.x + x,
        y: position.y + 0.8 + y,
        z: position.z + z,
      },
      count: 3,
      type: 'plasma',
      colors: config.primaryColors,
      sizeRange: [0.05, 0.12],
      speedRange: [0.1, 0.3],
      lifeRange: [0.3, 0.6],
      spread: 0.2,
      gravity: 0,
      drag: 0.3,
      emissiveIntensity: config.emissiveIntensity * 0.8,
    })
  }, emitInterval)
}

// R Ability - Orbital Strike
export function triggerOrbitalStrikeParticles(position: { x: number; y: number; z: number }) {
  const config = ABILITY_CONFIGS.R

  // Beam particles coming down
  const beamHeight = 20
  const beamDuration = 500 // 0.5 seconds for beam to come down

  for (let i = 0; i < 30; i++) {
    const delay = (i / 30) * beamDuration

    setTimeout(() => {
      emitParticles({
        position: {
          x: position.x + (Math.random() - 0.5) * 1,
          y: position.y + beamHeight - (i / 30) * beamHeight,
          z: position.z + (Math.random() - 0.5) * 1,
        },
        count: 10,
        type: 'ability',
        colors: config.primaryColors,
        sizeRange: [0.15, 0.4],
        speedRange: [5, 15],
        lifeRange: [0.3, 0.7],
        spread: 0.8,
        direction: { x: 0, y: -1, z: 0 },
        gravity: 20,
        drag: 0.02,
        emissiveIntensity: config.emissiveIntensity,
      })
    }, delay)
  }

  // Impact explosion after beam comes down
  setTimeout(() => {
    // Massive ground impact
    emitParticles({
      position: { x: position.x, y: position.y + 0.5, z: position.z },
      count: config.burstCount,
      type: 'explosion',
      colors: config.primaryColors,
      sizeRange: [0.2, 0.5],
      speedRange: [10, 20],
      lifeRange: [0.5, 1.2],
      spread: 3,
      gravity: 5,
      drag: 0.05,
      emissiveIntensity: config.emissiveIntensity,
    })

    // Shockwave ring
    const ringCount = config.ringCount
    for (let i = 0; i < ringCount; i++) {
      const angle = (i / ringCount) * Math.PI * 2

      emitParticles({
        position: {
          x: position.x + Math.cos(angle) * 0.5,
          y: position.y + 0.2,
          z: position.z + Math.sin(angle) * 0.5,
        },
        count: 5,
        type: 'impact',
        colors: config.secondaryColors,
        sizeRange: [0.12, 0.28],
        speedRange: [8, 15],
        lifeRange: [0.3, 0.6],
        spread: 0.4,
        direction: { x: Math.cos(angle), y: 0.3, z: Math.sin(angle) },
        gravity: 4,
        drag: 0.06,
        emissiveIntensity: config.emissiveIntensity * 1.3,
      })
    }

    // Fire pillars at edges
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const radius = config.radius * 0.8

      setTimeout(() => {
        emitParticles({
          position: {
            x: position.x + Math.cos(angle) * radius,
            y: position.y,
            z: position.z + Math.sin(angle) * radius,
          },
          count: 30,
          type: 'cosmic',
          colors: config.primaryColors,
          sizeRange: [0.1, 0.3],
          speedRange: [3, 8],
          lifeRange: [0.4, 1.0],
          spread: 0.5,
          direction: { x: 0, y: 1, z: 0 },
          gravity: -6,
          drag: 0.08,
          emissiveIntensity: config.emissiveIntensity * 0.9,
        })
      }, i * 30)
    }

    // Debris and smoke
    emitParticles({
      position: { x: position.x, y: position.y + 0.3, z: position.z },
      count: 60,
      type: 'cosmic',
      colors: ['#555555', '#777777', config.primaryColors[1]],
      sizeRange: [0.3, 0.6],
      speedRange: [2, 6],
      lifeRange: [0.8, 1.8],
      spread: 2,
      direction: { x: 0, y: 1, z: 0 },
      gravity: -1,
      drag: 0.1,
      emissiveIntensity: 0.5,
    })
  }, beamDuration)
}

// Generic ability trigger function
export function triggerAbilityParticles(
  position: { x: number; y: number; z: number },
  abilityKey: AbilityKey
) {
  switch (abilityKey) {
    case 'Q':
      triggerPlasmaBurstParticles(position)
      break
    case 'W':
      triggerEnergyShieldParticles(position)
      break
    case 'R':
      triggerOrbitalStrikeParticles(position)
      break
  }
}

// Tower muzzle flash
export function triggerMuzzleFlash(
  position: { x: number; y: number; z: number },
  direction: { x: number; y: number; z: number },
  color?: string
) {
  const flashColor = color || PARTICLE_COLORS.plasmaWhite

  emitParticles({
    position,
    count: 8,
    type: 'sparkle',
    colors: [flashColor, PARTICLE_COLORS.plasmaWhite],
    sizeRange: [0.05, 0.15],
    speedRange: [2, 5],
    lifeRange: [0.08, 0.15],
    spread: 0.5,
    direction,
    gravity: 0,
    drag: 0.2,
    emissiveIntensity: 4,
  })
}

// Hero basic attack effect
export function triggerHeroAttackEffect(
  position: { x: number; y: number; z: number },
  direction: { x: number; y: number; z: number }
) {
  emitParticles({
    position,
    count: 12,
    type: 'plasma',
    colors: [PARTICLE_COLORS.electricBlue, PARTICLE_COLORS.neonPurple, PARTICLE_COLORS.plasmaWhite],
    sizeRange: [0.06, 0.14],
    speedRange: [3, 7],
    lifeRange: [0.1, 0.25],
    spread: 0.4,
    direction,
    gravity: 1,
    drag: 0.1,
    emissiveIntensity: 3,
  })
}
