import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../stores/gameStore'
import type { AbilityKey } from '../types'

interface AbilityEffect {
  id: string
  type: AbilityKey
  position: { x: number; z: number }
  startTime: number
  duration: number
}

export function AbilityEffectsRenderer() {
  const hero = useGameStore((state) => state.hero)
  const [effects, setEffects] = useState<AbilityEffect[]>([])
  const prevCooldowns = useRef<Record<AbilityKey, number>>({ Q: 0, W: 0, R: 0 })

  // Detect when an ability is used (cooldown goes from 0 to max)
  useEffect(() => {
    if (!hero) return

    const checkAbility = (key: AbilityKey) => {
      const ability = hero.abilities[key]
      const prev = prevCooldowns.current[key]

      // Ability was just activated (cooldown jumped from ~0 to max)
      if (prev <= 0.1 && ability.currentCooldown > ability.cooldown * 0.9) {
        const durations: Record<AbilityKey, number> = { Q: 0.5, W: 3, R: 1.5 }
        setEffects((prev) => [
          ...prev,
          {
            id: `${key}-${Date.now()}`,
            type: key,
            position: { x: hero.position.x, z: hero.position.z },
            startTime: Date.now(),
            duration: durations[key],
          },
        ])
      }
      prevCooldowns.current[key] = ability.currentCooldown
    }

    checkAbility('Q')
    checkAbility('W')
    checkAbility('R')
  }, [hero?.abilities.Q.currentCooldown, hero?.abilities.W.currentCooldown, hero?.abilities.R.currentCooldown, hero?.position])

  // Clean up expired effects
  useFrame(() => {
    const now = Date.now()
    setEffects((prev) =>
      prev.filter((e) => now - e.startTime < e.duration * 1000)
    )
  })

  return (
    <>
      {effects.map((effect) => (
        <AbilityEffect key={effect.id} effect={effect} />
      ))}
    </>
  )
}

function AbilityEffect({ effect }: { effect: AbilityEffect }) {
  const groupRef = useRef<THREE.Group>(null)
  const progress = useRef(0)

  useFrame(() => {
    if (!groupRef.current) return
    const elapsed = (Date.now() - effect.startTime) / 1000
    progress.current = Math.min(1, elapsed / effect.duration)
  })

  switch (effect.type) {
    case 'Q':
      return <PlasmaBurstEffect position={effect.position} ref={groupRef} startTime={effect.startTime} duration={effect.duration} />
    case 'W':
      return null // Shield effect is handled in HeroRenderer
    case 'R':
      return <OrbitalStrikeEffect position={effect.position} ref={groupRef} startTime={effect.startTime} duration={effect.duration} />
    default:
      return null
  }
}

interface EffectProps {
  position: { x: number; z: number }
  startTime: number
  duration: number
}

import { forwardRef } from 'react'

const PlasmaBurstEffect = forwardRef<THREE.Group, EffectProps>(({ position, startTime, duration }, ref) => {
  const ringRef = useRef<THREE.Mesh>(null)
  const innerRingRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    const elapsed = (Date.now() - startTime) / 1000
    const progress = Math.min(1, elapsed / duration)

    if (ringRef.current) {
      const scale = 0.5 + progress * 2
      ringRef.current.scale.setScalar(scale)
      const material = ringRef.current.material as THREE.MeshBasicMaterial
      material.opacity = 0.8 * (1 - progress)
    }

    if (innerRingRef.current) {
      const scale = 0.3 + progress * 1.5
      innerRingRef.current.scale.setScalar(scale)
      const material = innerRingRef.current.material as THREE.MeshBasicMaterial
      material.opacity = 0.6 * (1 - progress)
    }
  })

  return (
    <group ref={ref} position={[position.x, 0.1, position.z]}>
      {/* Outer ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1, 32]} />
        <meshBasicMaterial color="#ff00ff" transparent opacity={0.8} side={THREE.DoubleSide} />
      </mesh>
      {/* Inner ring */}
      <mesh ref={innerRingRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.5, 32]} />
        <meshBasicMaterial color="#ff66ff" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      {/* Center flash */}
      <pointLight color="#ff00ff" intensity={2} distance={5} decay={2} />
    </group>
  )
})
PlasmaBurstEffect.displayName = 'PlasmaBurstEffect'

const OrbitalStrikeEffect = forwardRef<THREE.Group, EffectProps>(({ position, startTime, duration }, ref) => {
  const beamRef = useRef<THREE.Mesh>(null)
  const impactRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.PointLight>(null)

  useFrame(() => {
    const elapsed = (Date.now() - startTime) / 1000
    const progress = Math.min(1, elapsed / duration)

    // Beam comes down in first half, then fades
    if (beamRef.current) {
      beamRef.current.scale.y = 1
      const material = beamRef.current.material as THREE.MeshBasicMaterial
      material.opacity = progress < 0.5 ? 0.8 : 0.8 * (1 - (progress - 0.5) * 2)
    }

    // Impact expands
    if (impactRef.current) {
      const impactProgress = Math.max(0, (progress - 0.2) / 0.8)
      const scale = 1 + impactProgress * 4
      impactRef.current.scale.setScalar(scale)
      const material = impactRef.current.material as THREE.MeshBasicMaterial
      material.opacity = 0.6 * (1 - impactProgress)
    }

    // Light intensity
    if (lightRef.current) {
      lightRef.current.intensity = progress < 0.3 ? progress * 10 : 3 * (1 - progress)
    }
  })

  return (
    <group ref={ref} position={[position.x, 0, position.z]}>
      {/* Beam from sky */}
      <mesh ref={beamRef} position={[0, 10, 0]}>
        <cylinderGeometry args={[0.5, 1.5, 20, 16]} />
        <meshBasicMaterial color="#ffaa00" transparent opacity={0.8} />
      </mesh>
      {/* Impact ring */}
      <mesh ref={impactRef} position={[0, 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 1.5, 32]} />
        <meshBasicMaterial color="#ff6600" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      {/* Impact light */}
      <pointLight ref={lightRef} position={[0, 1, 0]} color="#ffaa00" intensity={3} distance={10} decay={2} />
    </group>
  )
})
OrbitalStrikeEffect.displayName = 'OrbitalStrikeEffect'
