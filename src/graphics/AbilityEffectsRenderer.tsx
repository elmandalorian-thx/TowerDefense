import { useRef, useState, useEffect, forwardRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../stores/gameStore'
import {
  triggerPlasmaBurstParticles,
  triggerEnergyShieldParticles,
  triggerOrbitalStrikeParticles,
} from './effects/AbilityEffect'
import type { AbilityKey } from '../types'

interface AbilityEffectData {
  id: string
  type: AbilityKey
  position: { x: number; z: number }
  startTime: number
  duration: number
}

export function AbilityEffectsRenderer() {
  const hero = useGameStore((state) => state.hero)
  const [effects, setEffects] = useState<AbilityEffectData[]>([])
  const prevCooldowns = useRef<Record<AbilityKey, number>>({ Q: 0, W: 0, R: 0 })
  const emittedEffects = useRef<Set<string>>(new Set())

  // Detect when an ability is used (cooldown goes from 0 to max)
  useEffect(() => {
    if (!hero) return

    const checkAbility = (key: AbilityKey) => {
      const ability = hero.abilities[key]
      const prev = prevCooldowns.current[key]

      // Ability was just activated (cooldown jumped from ~0 to max)
      if (prev <= 0.1 && ability.currentCooldown > ability.cooldown * 0.9) {
        const durations: Record<AbilityKey, number> = { Q: 0.8, W: 3.5, R: 2.0 }
        const effectId = `${key}-${Date.now()}`

        setEffects((prevEffects) => [
          ...prevEffects,
          {
            id: effectId,
            type: key,
            position: { x: hero.position.x, z: hero.position.z },
            startTime: Date.now(),
            duration: durations[key],
          },
        ])

        // Trigger particle effects
        const pos = { x: hero.position.x, y: hero.position.y, z: hero.position.z }
        switch (key) {
          case 'Q':
            triggerPlasmaBurstParticles(pos)
            break
          case 'W':
            triggerEnergyShieldParticles(pos)
            break
          case 'R':
            triggerOrbitalStrikeParticles(pos)
            break
        }
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
      prev.filter((e) => {
        const keep = now - e.startTime < e.duration * 1000
        if (!keep) {
          emittedEffects.current.delete(e.id)
        }
        return keep
      })
    )
  })

  return (
    <>
      {effects.map((effect) => (
        <AbilityVisualEffect key={effect.id} effect={effect} />
      ))}
    </>
  )
}

function AbilityVisualEffect({ effect }: { effect: AbilityEffectData }) {
  const groupRef = useRef<THREE.Group>(null)

  switch (effect.type) {
    case 'Q':
      return <PlasmaBurstEffect position={effect.position} ref={groupRef} startTime={effect.startTime} duration={effect.duration} />
    case 'W':
      return null // Shield effect is handled in HeroRenderer + particle system
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

const PlasmaBurstEffect = forwardRef<THREE.Group, EffectProps>(({ position, startTime, duration }, ref) => {
  const ringRef = useRef<THREE.Mesh>(null)
  const innerRingRef = useRef<THREE.Mesh>(null)
  const outerGlowRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    const elapsed = (Date.now() - startTime) / 1000
    const progress = Math.min(1, elapsed / duration)

    if (ringRef.current) {
      const scale = 0.5 + progress * 3
      ringRef.current.scale.setScalar(scale)
      const material = ringRef.current.material as THREE.MeshBasicMaterial
      material.opacity = 0.9 * (1 - progress)
    }

    if (innerRingRef.current) {
      const scale = 0.3 + progress * 2.5
      innerRingRef.current.scale.setScalar(scale)
      const material = innerRingRef.current.material as THREE.MeshBasicMaterial
      material.opacity = 0.7 * (1 - progress)
      innerRingRef.current.rotation.z += 0.05
    }

    if (outerGlowRef.current) {
      const scale = 0.8 + progress * 4
      outerGlowRef.current.scale.setScalar(scale)
      const material = outerGlowRef.current.material as THREE.MeshBasicMaterial
      material.opacity = 0.4 * (1 - progress)
    }
  })

  return (
    <group ref={ref} position={[position.x, 0.1, position.z]}>
      {/* Outer glow ring */}
      <mesh ref={outerGlowRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 1.5, 32]} />
        <meshBasicMaterial
          color="#ff006e"
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Outer ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1, 32]} />
        <meshBasicMaterial
          color="#ff006e"
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Inner ring */}
      <mesh ref={innerRingRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.5, 16]} />
        <meshBasicMaterial
          color="#bf00ff"
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Center flash */}
      <pointLight color="#ff006e" intensity={4} distance={8} decay={2} />
    </group>
  )
})
PlasmaBurstEffect.displayName = 'PlasmaBurstEffect'

const OrbitalStrikeEffect = forwardRef<THREE.Group, EffectProps>(({ position, startTime, duration }, ref) => {
  const beamRef = useRef<THREE.Mesh>(null)
  const beamCoreRef = useRef<THREE.Mesh>(null)
  const impactRef = useRef<THREE.Mesh>(null)
  const shockwaveRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.PointLight>(null)

  useFrame(() => {
    const elapsed = (Date.now() - startTime) / 1000
    const progress = Math.min(1, elapsed / duration)

    // Beam comes down in first half, then fades
    if (beamRef.current && beamCoreRef.current) {
      const beamProgress = Math.min(1, progress * 2)
      beamRef.current.scale.y = beamProgress
      beamCoreRef.current.scale.y = beamProgress

      const material = beamRef.current.material as THREE.MeshBasicMaterial
      material.opacity = progress < 0.5 ? 0.7 : 0.7 * (1 - (progress - 0.5) * 2)

      const coreMaterial = beamCoreRef.current.material as THREE.MeshBasicMaterial
      coreMaterial.opacity = progress < 0.5 ? 0.9 : 0.9 * (1 - (progress - 0.5) * 2)
    }

    // Impact expands after beam reaches ground
    if (impactRef.current) {
      const impactProgress = Math.max(0, (progress - 0.3) / 0.7)
      const scale = 1 + impactProgress * 5
      impactRef.current.scale.setScalar(scale)
      const material = impactRef.current.material as THREE.MeshBasicMaterial
      material.opacity = 0.8 * (1 - impactProgress)
    }

    // Shockwave ring
    if (shockwaveRef.current) {
      const shockProgress = Math.max(0, (progress - 0.35) / 0.65)
      const scale = 1 + shockProgress * 8
      shockwaveRef.current.scale.setScalar(scale)
      const material = shockwaveRef.current.material as THREE.MeshBasicMaterial
      material.opacity = 0.5 * (1 - shockProgress)
    }

    // Light intensity
    if (lightRef.current) {
      if (progress < 0.3) {
        lightRef.current.intensity = progress * 15
      } else if (progress < 0.5) {
        lightRef.current.intensity = 4.5 + Math.sin(progress * 50) * 1.5
      } else {
        lightRef.current.intensity = 4.5 * (1 - (progress - 0.5) * 2)
      }
    }
  })

  return (
    <group ref={ref} position={[position.x, 0, position.z]}>
      {/* Beam from sky - outer glow */}
      <mesh ref={beamRef} position={[0, 10, 0]}>
        <cylinderGeometry args={[0.8, 2, 20, 16]} />
        <meshBasicMaterial
          color="#ffaa00"
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Beam core */}
      <mesh ref={beamCoreRef} position={[0, 10, 0]}>
        <cylinderGeometry args={[0.3, 0.8, 20, 16]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Impact ring */}
      <mesh ref={impactRef} position={[0, 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 1.5, 32]} />
        <meshBasicMaterial
          color="#ff6600"
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Shockwave */}
      <mesh ref={shockwaveRef} position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1, 32]} />
        <meshBasicMaterial
          color="#ffcc00"
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Impact light */}
      <pointLight ref={lightRef} position={[0, 1, 0]} color="#ffaa00" intensity={4.5} distance={15} decay={2} />
    </group>
  )
})
OrbitalStrikeEffect.displayName = 'OrbitalStrikeEffect'
