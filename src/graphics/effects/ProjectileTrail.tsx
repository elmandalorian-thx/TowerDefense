import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { emitParticles, PARTICLE_COLORS } from '../ParticleSystem'
import type { TowerType } from '../../types'

// Trail configurations for different projectile types
const TRAIL_CONFIGS: Record<TowerType | 'hero' | 'default', TrailConfig> = {
  plasmaSpire: {
    colors: [PARTICLE_COLORS.electricBlue, '#00ffff', PARTICLE_COLORS.plasmaWhite],
    particleCount: 3,
    sizeRange: [0.05, 0.12],
    speedRange: [0.2, 0.5],
    lifeRange: [0.2, 0.4],
    spread: 0.15,
    emissionRate: 0.02,
    emissiveIntensity: 2.5,
  },
  railCannon: {
    colors: [PARTICLE_COLORS.hotPink, '#ff3388', PARTICLE_COLORS.plasmaWhite],
    particleCount: 5,
    sizeRange: [0.08, 0.18],
    speedRange: [0.3, 0.8],
    lifeRange: [0.25, 0.5],
    spread: 0.2,
    emissionRate: 0.015,
    emissiveIntensity: 3,
  },
  novaLauncher: {
    colors: [PARTICLE_COLORS.stellarYellow, PARTICLE_COLORS.cosmicOrange, PARTICLE_COLORS.hotPink],
    particleCount: 8,
    sizeRange: [0.1, 0.25],
    speedRange: [0.5, 1.2],
    lifeRange: [0.3, 0.6],
    spread: 0.25,
    emissionRate: 0.01,
    emissiveIntensity: 2,
  },
  hero: {
    colors: [PARTICLE_COLORS.neonPurple, PARTICLE_COLORS.electricBlue, PARTICLE_COLORS.plasmaWhite],
    particleCount: 4,
    sizeRange: [0.06, 0.15],
    speedRange: [0.4, 0.9],
    lifeRange: [0.25, 0.5],
    spread: 0.18,
    emissionRate: 0.018,
    emissiveIntensity: 2.5,
  },
  default: {
    colors: [PARTICLE_COLORS.plasmaWhite, '#aaaaff', '#aaffff'],
    particleCount: 2,
    sizeRange: [0.04, 0.1],
    speedRange: [0.2, 0.5],
    lifeRange: [0.15, 0.3],
    spread: 0.1,
    emissionRate: 0.025,
    emissiveIntensity: 1.5,
  },
}

interface TrailConfig {
  colors: string[]
  particleCount: number
  sizeRange: [number, number]
  speedRange: [number, number]
  lifeRange: [number, number]
  spread: number
  emissionRate: number
  emissiveIntensity: number
}

interface ProjectileTrailProps {
  position: { x: number; y: number; z: number }
  velocity: { x: number; y: number; z: number }
  projectileType: TowerType | 'hero' | 'default'
  active?: boolean
}

export function ProjectileTrail({
  position,
  velocity,
  projectileType,
  active = true,
}: ProjectileTrailProps) {
  const lastEmitTime = useRef(0)
  const config = TRAIL_CONFIGS[projectileType] || TRAIL_CONFIGS.default

  useFrame(() => {
    if (!active) return

    const now = Date.now() / 1000
    if (now - lastEmitTime.current < config.emissionRate) return
    lastEmitTime.current = now

    // Calculate backward direction for trail
    const velLength = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y + velocity.z * velocity.z)
    const backDir = velLength > 0.01
      ? { x: -velocity.x / velLength, y: -velocity.y / velLength, z: -velocity.z / velLength }
      : { x: 0, y: -1, z: 0 }

    emitParticles({
      position,
      count: config.particleCount,
      type: 'trail',
      colors: config.colors,
      sizeRange: config.sizeRange,
      speedRange: config.speedRange,
      lifeRange: config.lifeRange,
      spread: config.spread,
      direction: backDir as unknown as THREE.Vector3,
      gravity: 0.5,
      drag: 0.1,
      emissiveIntensity: config.emissiveIntensity,
    })
  })

  return null
}

// Trail renderer that attaches to projectile mesh
interface ProjectileTrailRendererProps {
  projectileId: string
  position: THREE.Vector3
  previousPosition: THREE.Vector3
  towerType?: TowerType
  isHeroProjectile?: boolean
}

export function ProjectileTrailRenderer({
  position,
  previousPosition,
  towerType,
  isHeroProjectile,
}: ProjectileTrailRendererProps) {
  const trailRef = useRef<THREE.Group>(null)
  const lastEmitRef = useRef(0)

  const config = useMemo(() => {
    if (isHeroProjectile) return TRAIL_CONFIGS.hero
    if (towerType) return TRAIL_CONFIGS[towerType]
    return TRAIL_CONFIGS.default
  }, [towerType, isHeroProjectile])

  useFrame(() => {
    const now = Date.now() / 1000
    if (now - lastEmitRef.current < config.emissionRate) return
    lastEmitRef.current = now

    // Calculate velocity from position delta
    const velocity = {
      x: position.x - previousPosition.x,
      y: position.y - previousPosition.y,
      z: position.z - previousPosition.z,
    }

    const velLength = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y + velocity.z * velocity.z)

    // Only emit if moving
    if (velLength > 0.01) {
      const backDir = {
        x: -velocity.x / velLength,
        y: -velocity.y / velLength,
        z: -velocity.z / velLength,
      }

      emitParticles({
        position: { x: position.x, y: position.y, z: position.z },
        count: config.particleCount,
        type: 'trail',
        colors: config.colors,
        sizeRange: config.sizeRange,
        speedRange: config.speedRange,
        lifeRange: config.lifeRange,
        spread: config.spread,
        direction: backDir as unknown as THREE.Vector3,
        gravity: 0.5,
        drag: 0.1,
        emissiveIntensity: config.emissiveIntensity,
      })
    }
  })

  return <group ref={trailRef} />
}

// Static function to emit trail particles
export function emitTrailParticles(
  position: { x: number; y: number; z: number },
  velocity: { x: number; y: number; z: number },
  projectileType: TowerType | 'hero' | 'default' = 'default'
) {
  const config = TRAIL_CONFIGS[projectileType] || TRAIL_CONFIGS.default

  const velLength = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y + velocity.z * velocity.z)
  const backDir = velLength > 0.01
    ? { x: -velocity.x / velLength, y: -velocity.y / velLength, z: -velocity.z / velLength }
    : { x: 0, y: -1, z: 0 }

  emitParticles({
    position,
    count: config.particleCount,
    type: 'trail',
    colors: config.colors,
    sizeRange: config.sizeRange,
    speedRange: config.speedRange,
    lifeRange: config.lifeRange,
    spread: config.spread,
    direction: backDir as unknown as THREE.Vector3,
    gravity: 0.5,
    drag: 0.1,
    emissiveIntensity: config.emissiveIntensity,
  })
}

// Continuous trail emitter for active projectiles
export function useProjectileTrail(
  position: { x: number; y: number; z: number },
  velocity: { x: number; y: number; z: number },
  projectileType: TowerType | 'hero' | 'default' = 'default',
  active = true
) {
  const lastEmitTime = useRef(0)
  const config = TRAIL_CONFIGS[projectileType] || TRAIL_CONFIGS.default

  useFrame(() => {
    if (!active) return

    const now = Date.now() / 1000
    if (now - lastEmitTime.current < config.emissionRate) return
    lastEmitTime.current = now

    emitTrailParticles(position, velocity, projectileType)
  })
}
