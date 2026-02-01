import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { emitParticles, PARTICLE_COLORS } from '../ParticleSystem'
import type { TowerType } from '../../types'

// Impact configurations for different damage types
const IMPACT_CONFIGS: Record<TowerType | 'hero' | 'splash' | 'default', ImpactConfig> = {
  plasmaSpire: {
    colors: [PARTICLE_COLORS.electricBlue, '#00ffff', PARTICLE_COLORS.plasmaWhite],
    particleCount: 15,
    sizeRange: [0.06, 0.15],
    speedRange: [2, 5],
    lifeRange: [0.2, 0.4],
    spread: 1.2,
    flashColor: '#00ffff',
    flashIntensity: 2,
    flashDuration: 0.1,
    ringCount: 1,
    emissiveIntensity: 2.5,
  },
  railCannon: {
    colors: [PARTICLE_COLORS.hotPink, '#ff3388', PARTICLE_COLORS.plasmaWhite],
    particleCount: 25,
    sizeRange: [0.08, 0.2],
    speedRange: [3, 8],
    lifeRange: [0.25, 0.5],
    spread: 1.5,
    flashColor: '#ff0066',
    flashIntensity: 3,
    flashDuration: 0.12,
    ringCount: 2,
    emissiveIntensity: 3,
  },
  novaLauncher: {
    colors: [PARTICLE_COLORS.stellarYellow, PARTICLE_COLORS.cosmicOrange, PARTICLE_COLORS.hotPink],
    particleCount: 50,
    sizeRange: [0.12, 0.3],
    speedRange: [4, 10],
    lifeRange: [0.4, 0.8],
    spread: 2.5,
    flashColor: '#ffaa00',
    flashIntensity: 5,
    flashDuration: 0.2,
    ringCount: 3,
    emissiveIntensity: 2.5,
  },
  splash: {
    colors: [PARTICLE_COLORS.stellarYellow, PARTICLE_COLORS.cosmicOrange, PARTICLE_COLORS.hotPink, PARTICLE_COLORS.plasmaWhite],
    particleCount: 80,
    sizeRange: [0.1, 0.35],
    speedRange: [5, 12],
    lifeRange: [0.5, 1.0],
    spread: 3,
    flashColor: '#ffcc00',
    flashIntensity: 6,
    flashDuration: 0.25,
    ringCount: 3,
    emissiveIntensity: 2,
  },
  hero: {
    colors: [PARTICLE_COLORS.neonPurple, PARTICLE_COLORS.electricBlue, PARTICLE_COLORS.plasmaWhite],
    particleCount: 20,
    sizeRange: [0.07, 0.18],
    speedRange: [2.5, 6],
    lifeRange: [0.2, 0.45],
    spread: 1.3,
    flashColor: '#aa00ff',
    flashIntensity: 2.5,
    flashDuration: 0.12,
    ringCount: 1,
    emissiveIntensity: 2.5,
  },
  default: {
    colors: [PARTICLE_COLORS.plasmaWhite, '#ccccff', '#ffccff'],
    particleCount: 10,
    sizeRange: [0.05, 0.12],
    speedRange: [1.5, 4],
    lifeRange: [0.15, 0.35],
    spread: 1,
    flashColor: '#ffffff',
    flashIntensity: 1.5,
    flashDuration: 0.08,
    ringCount: 1,
    emissiveIntensity: 2,
  },
}

interface ImpactConfig {
  colors: string[]
  particleCount: number
  sizeRange: [number, number]
  speedRange: [number, number]
  lifeRange: [number, number]
  spread: number
  flashColor: string
  flashIntensity: number
  flashDuration: number
  ringCount: number
  emissiveIntensity: number
}

interface ImpactEffectProps {
  position: { x: number; y: number; z: number }
  impactType: TowerType | 'hero' | 'splash' | 'default'
  normal?: { x: number; y: number; z: number }
  onComplete?: () => void
}

export function ImpactEffect({
  position,
  impactType,
  normal = { x: 0, y: 1, z: 0 },
  onComplete,
}: ImpactEffectProps) {
  const flashRef = useRef<THREE.PointLight>(null)
  const ringRef = useRef<THREE.Group>(null)
  const startTime = useRef(Date.now())
  const emittedRef = useRef(false)
  const config = IMPACT_CONFIGS[impactType] || IMPACT_CONFIGS.default

  // Emit particles on mount
  useEffect(() => {
    if (emittedRef.current) return
    emittedRef.current = true

    // Main impact particles - radial burst
    emitParticles({
      position,
      count: config.particleCount,
      type: 'impact',
      colors: config.colors,
      sizeRange: config.sizeRange,
      speedRange: config.speedRange,
      lifeRange: config.lifeRange,
      spread: config.spread,
      gravity: 5,
      drag: 0.08,
      emissiveIntensity: config.emissiveIntensity,
    })

    // Sparks flying outward from impact point
    emitParticles({
      position: { x: position.x, y: position.y + 0.1, z: position.z },
      count: Math.floor(config.particleCount * 0.4),
      type: 'sparkle',
      colors: [PARTICLE_COLORS.plasmaWhite, config.colors[0]],
      sizeRange: [config.sizeRange[0] * 0.6, config.sizeRange[1] * 0.6],
      speedRange: [config.speedRange[1] * 0.8, config.speedRange[1] * 1.2],
      lifeRange: [config.lifeRange[0] * 0.5, config.lifeRange[1] * 0.6],
      spread: config.spread * 1.2,
      direction: normal as unknown as THREE.Vector3,
      gravity: 8,
      drag: 0.05,
      emissiveIntensity: config.emissiveIntensity * 1.5,
    })

    // Dust/smoke puff if hitting ground
    if (normal.y > 0.5) {
      emitParticles({
        position: { x: position.x, y: position.y + 0.05, z: position.z },
        count: Math.floor(config.particleCount * 0.2),
        type: 'cosmic',
        colors: ['#555555', '#777777', '#333333'],
        sizeRange: [config.sizeRange[1], config.sizeRange[1] * 1.5],
        speedRange: [0.5, 2],
        lifeRange: [0.4, 0.8],
        spread: 0.8,
        direction: { x: 0, y: 1, z: 0 } as unknown as THREE.Vector3,
        gravity: -1,
        drag: 0.15,
        emissiveIntensity: 0.3,
      })
    }
  }, [position, config, normal])

  useFrame(() => {
    const elapsed = (Date.now() - startTime.current) / 1000

    // Animate flash
    if (flashRef.current) {
      const flashProgress = elapsed / config.flashDuration
      if (flashProgress < 1) {
        flashRef.current.intensity = config.flashIntensity * (1 - flashProgress)
      } else {
        flashRef.current.intensity = 0
      }
    }

    // Animate rings
    if (ringRef.current) {
      ringRef.current.children.forEach((child, i) => {
        const ringDelay = i * 0.03
        const ringElapsed = Math.max(0, elapsed - ringDelay)
        const ringDuration = config.flashDuration * 2
        const ringProgress = ringElapsed / ringDuration

        if (ringProgress < 1) {
          const scale = 0.2 + ringProgress * 1.5
          child.scale.setScalar(scale)
          const material = (child as THREE.Mesh).material as THREE.MeshBasicMaterial
          material.opacity = 0.8 * (1 - ringProgress)
        } else {
          child.scale.setScalar(0)
        }
      })
    }

    // Complete callback
    if (elapsed > Math.max(...config.lifeRange) && onComplete) {
      onComplete()
    }
  })

  return (
    <group position={[position.x, position.y, position.z]}>
      {/* Flash light */}
      <pointLight
        ref={flashRef}
        color={config.flashColor}
        intensity={config.flashIntensity}
        distance={3}
        decay={2}
      />

      {/* Expanding rings */}
      <group ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        {Array.from({ length: config.ringCount }).map((_, i) => (
          <mesh key={i}>
            <ringGeometry args={[0.1, 0.15, 32]} />
            <meshBasicMaterial
              color={config.flashColor}
              transparent
              opacity={0.8}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// Static function to trigger impact without component
export function triggerImpact(
  position: { x: number; y: number; z: number },
  impactType: TowerType | 'hero' | 'splash' | 'default' = 'default',
  normal?: { x: number; y: number; z: number }
) {
  const config = IMPACT_CONFIGS[impactType] || IMPACT_CONFIGS.default
  const normalDir = normal || { x: 0, y: 1, z: 0 }

  // Main impact particles
  emitParticles({
    position,
    count: config.particleCount,
    type: 'impact',
    colors: config.colors,
    sizeRange: config.sizeRange,
    speedRange: config.speedRange,
    lifeRange: config.lifeRange,
    spread: config.spread,
    gravity: 5,
    drag: 0.08,
    emissiveIntensity: config.emissiveIntensity,
  })

  // Sparks
  emitParticles({
    position: { x: position.x, y: position.y + 0.1, z: position.z },
    count: Math.floor(config.particleCount * 0.4),
    type: 'sparkle',
    colors: [PARTICLE_COLORS.plasmaWhite, config.colors[0]],
    sizeRange: [config.sizeRange[0] * 0.6, config.sizeRange[1] * 0.6],
    speedRange: [config.speedRange[1] * 0.8, config.speedRange[1] * 1.2],
    lifeRange: [config.lifeRange[0] * 0.5, config.lifeRange[1] * 0.6],
    spread: config.spread * 1.2,
    direction: normalDir as unknown as THREE.Vector3,
    gravity: 8,
    drag: 0.05,
    emissiveIntensity: config.emissiveIntensity * 1.5,
  })
}

// Hit sparkles for lighter impacts (enemy hits, minor damage)
export function triggerHitSparkles(
  position: { x: number; y: number; z: number },
  color?: string,
  intensity: 'light' | 'medium' | 'heavy' = 'medium'
) {
  const counts = { light: 5, medium: 12, heavy: 25 }
  const spreads = { light: 0.5, medium: 1, heavy: 1.5 }
  const colors = color
    ? [color, PARTICLE_COLORS.plasmaWhite]
    : [PARTICLE_COLORS.plasmaWhite, PARTICLE_COLORS.stellarYellow]

  emitParticles({
    position,
    count: counts[intensity],
    type: 'sparkle',
    colors,
    sizeRange: [0.03, 0.08],
    speedRange: [2, 6],
    lifeRange: [0.1, 0.25],
    spread: spreads[intensity],
    gravity: 6,
    drag: 0.1,
    emissiveIntensity: 3,
  })
}
