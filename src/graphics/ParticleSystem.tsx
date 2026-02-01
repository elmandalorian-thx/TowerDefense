import { useRef, useMemo, useEffect, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { create } from 'zustand'

// Cosmic Chaos color palette
export const PARTICLE_COLORS = {
  hotPink: '#ff006e',
  electricBlue: '#3a86ff',
  toxicGreen: '#39ff14',
  neonPurple: '#bf00ff',
  cosmicOrange: '#ff6b35',
  stellarYellow: '#ffbe0b',
  plasmaWhite: '#ffffff',
}

// Particle types for different effects
export type ParticleType =
  | 'explosion'
  | 'trail'
  | 'impact'
  | 'ability'
  | 'sparkle'
  | 'plasma'
  | 'cosmic'

export interface Particle {
  id: number
  position: THREE.Vector3
  velocity: THREE.Vector3
  color: THREE.Color
  size: number
  life: number
  maxLife: number
  rotation: number
  rotationSpeed: number
  gravity: number
  drag: number
  type: ParticleType
  emissiveIntensity: number
}

export interface ParticleEmission {
  position: THREE.Vector3
  count: number
  type: ParticleType
  colors: string[]
  sizeRange: [number, number]
  speedRange: [number, number]
  lifeRange: [number, number]
  spread: number
  direction?: THREE.Vector3
  gravity?: number
  drag?: number
  emissiveIntensity?: number
}

// Particle store for global particle management
interface ParticleStore {
  emissions: ParticleEmission[]
  emit: (emission: ParticleEmission) => void
  clearEmissions: () => void
}

export const useParticleStore = create<ParticleStore>((set) => ({
  emissions: [],
  emit: (emission) => set((state) => ({
    emissions: [...state.emissions, emission]
  })),
  clearEmissions: () => set({ emissions: [] }),
}))

// Simple position type for external callers
export interface SimpleVector3 {
  x: number
  y: number
  z: number
}

// Emission parameters that external code can use (plain objects)
export interface ParticleEmissionParams {
  position: SimpleVector3
  count: number
  type: ParticleType
  colors: string[]
  sizeRange: [number, number]
  speedRange: [number, number]
  lifeRange: [number, number]
  spread: number
  direction?: SimpleVector3
  gravity?: number
  drag?: number
  emissiveIntensity?: number
}

// Helper to emit particles from anywhere in the app
export function emitParticles(emission: ParticleEmissionParams) {
  const pos = new THREE.Vector3(emission.position.x, emission.position.y, emission.position.z)
  const dir = emission.direction
    ? new THREE.Vector3(emission.direction.x, emission.direction.y, emission.direction.z)
    : undefined

  useParticleStore.getState().emit({
    position: pos,
    count: emission.count,
    type: emission.type,
    colors: emission.colors,
    sizeRange: emission.sizeRange,
    speedRange: emission.speedRange,
    lifeRange: emission.lifeRange,
    spread: emission.spread,
    direction: dir,
    gravity: emission.gravity,
    drag: emission.drag,
    emissiveIntensity: emission.emissiveIntensity,
  })
}

// Pre-computed geometry and materials for instanced rendering
const MAX_PARTICLES = 15000
const PARTICLE_GEOMETRY = new THREE.PlaneGeometry(1, 1)

interface ParticleSystemProps {
  maxParticles?: number
}

export function ParticleSystem({ maxParticles = MAX_PARTICLES }: ParticleSystemProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const particlesRef = useRef<Particle[]>([])
  const nextIdRef = useRef(0)
  const tempMatrix = useMemo(() => new THREE.Matrix4(), [])
  const tempColor = useMemo(() => new THREE.Color(), [])
  const tempPosition = useMemo(() => new THREE.Vector3(), [])
  const tempQuaternion = useMemo(() => new THREE.Quaternion(), [])
  const tempScale = useMemo(() => new THREE.Vector3(), [])
  const tempEuler = useMemo(() => new THREE.Euler(), [])

  // Create instanced color attribute
  const colorArray = useMemo(() => new Float32Array(maxParticles * 3), [maxParticles])

  // Custom shader material for glowing particles
  const material = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  }, [])

  // Spawn particles from emissions
  const spawnParticles = useCallback((emission: ParticleEmission) => {
    const particles = particlesRef.current
    const { position, count, type, colors, sizeRange, speedRange, lifeRange, spread, direction, gravity = 0, drag = 0.02, emissiveIntensity = 1 } = emission

    for (let i = 0; i < count; i++) {
      if (particles.length >= maxParticles) {
        // Remove oldest particle
        particles.shift()
      }

      // Random velocity direction
      let vel: THREE.Vector3
      if (direction) {
        // Spread around the given direction
        vel = direction.clone()
          .add(new THREE.Vector3(
            (Math.random() - 0.5) * spread,
            (Math.random() - 0.5) * spread,
            (Math.random() - 0.5) * spread
          ))
      } else {
        // Spherical spread
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        vel = new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta),
          Math.sin(phi) * Math.sin(theta),
          Math.cos(phi)
        ).multiplyScalar(spread)
      }

      const speed = speedRange[0] + Math.random() * (speedRange[1] - speedRange[0])
      vel.normalize().multiplyScalar(speed)

      const life = lifeRange[0] + Math.random() * (lifeRange[1] - lifeRange[0])
      const size = sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0])
      const colorStr = colors[Math.floor(Math.random() * colors.length)]

      particles.push({
        id: nextIdRef.current++,
        position: position.clone().add(new THREE.Vector3(
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2
        )),
        velocity: vel,
        color: new THREE.Color(colorStr),
        size,
        life,
        maxLife: life,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 5,
        gravity,
        drag,
        type,
        emissiveIntensity,
      })
    }
  }, [maxParticles])

  // Process emissions from store
  useEffect(() => {
    const unsubscribe = useParticleStore.subscribe((state) => {
      const emissions = state.emissions
      if (emissions.length > 0) {
        emissions.forEach(spawnParticles)
        useParticleStore.getState().clearEmissions()
      }
    })
    return () => unsubscribe()
  }, [spawnParticles])

  useFrame((_, delta) => {
    if (!meshRef.current) return

    const mesh = meshRef.current
    const particles = particlesRef.current
    const clampedDelta = Math.min(delta, 0.05) // Prevent huge deltas

    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]

      // Update life
      p.life -= clampedDelta
      if (p.life <= 0) {
        particles.splice(i, 1)
        continue
      }

      // Apply gravity
      p.velocity.y -= p.gravity * clampedDelta

      // Apply drag
      p.velocity.multiplyScalar(1 - p.drag)

      // Update position
      p.position.add(p.velocity.clone().multiplyScalar(clampedDelta))

      // Update rotation
      p.rotation += p.rotationSpeed * clampedDelta
    }

    // Update instanced mesh
    const count = Math.min(particles.length, maxParticles)

    for (let i = 0; i < count; i++) {
      const p = particles[i]
      const lifeRatio = p.life / p.maxLife

      // Position
      tempPosition.copy(p.position)

      // Rotation - make particles face camera (billboard effect via scale)
      tempEuler.set(0, 0, p.rotation)
      tempQuaternion.setFromEuler(tempEuler)

      // Scale with fade
      const fadeScale = Math.sin(lifeRatio * Math.PI) // Smooth fade in/out
      const finalSize = p.size * fadeScale
      tempScale.set(finalSize, finalSize, finalSize)

      tempMatrix.compose(tempPosition, tempQuaternion, tempScale)
      mesh.setMatrixAt(i, tempMatrix)

      // Color with brightness variation based on life
      const brightness = 0.5 + lifeRatio * 0.5 * p.emissiveIntensity
      tempColor.copy(p.color).multiplyScalar(brightness)
      colorArray[i * 3] = tempColor.r
      colorArray[i * 3 + 1] = tempColor.g
      colorArray[i * 3 + 2] = tempColor.b
      mesh.setColorAt(i, tempColor)
    }

    // Hide unused instances
    for (let i = count; i < maxParticles; i++) {
      tempScale.set(0, 0, 0)
      tempMatrix.compose(tempPosition, tempQuaternion, tempScale)
      mesh.setMatrixAt(i, tempMatrix)
    }

    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true
    }
    mesh.count = count
  })

  return (
    <instancedMesh
      ref={meshRef}
      args={[PARTICLE_GEOMETRY, material, maxParticles]}
      frustumCulled={false}
    />
  )
}

// Additional particle geometries for variety
export function SparkParticleSystem({ maxParticles = 5000 }: ParticleSystemProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const sparkGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array([
      0, -0.5, 0,
      0, 0.5, 0,
    ])
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [])

  const material = useMemo(() => {
    return new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  }, [])

  return (
    <instancedMesh
      ref={meshRef}
      args={[sparkGeometry, material, maxParticles]}
      frustumCulled={false}
    />
  )
}
