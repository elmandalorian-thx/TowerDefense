import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../stores/gameStore'
import { emitTrailParticles } from './effects/ProjectileTrail'
import { triggerImpact } from './effects/ImpactEffect'
import type { Projectile, TowerType } from '../types'

// Track previous projectile positions for velocity calculation and impact detection
const projectileVelocities = new Map<string, { x: number; y: number; z: number }>()
const previousProjectileIds = new Set<string>()
const previousProjectilePositions = new Map<string, { x: number; y: number; z: number }>()

// Trail emission interval (~60fps)
const TRAIL_EMIT_INTERVAL = 0.016

export function ProjectileRenderer() {
  const projectiles = useGameStore((state) => state.projectiles)
  const towers = useGameStore((state) => state.towers)

  // Detect projectile hits and trigger impact effects
  useEffect(() => {
    const currentIds = new Set(projectiles.map((p) => p.id))

    // Find projectiles that were removed (hit something)
    previousProjectileIds.forEach((id) => {
      if (!currentIds.has(id)) {
        const lastPos = previousProjectilePositions.get(id)
        if (lastPos) {
          // Find the tower type for this projectile to determine impact style
          const projectileData = projectiles.find((p) => p.id === id)
          let impactType: TowerType | 'splash' | 'hero' | 'default' = 'default'

          if (projectileData) {
            const tower = towers.find((t) => t.id === projectileData.sourceId)
            if (tower) {
              impactType = projectileData.splashRadius ? 'splash' : tower.type
            }
          }

          // Trigger impact effect at last known position
          triggerImpact(lastPos, impactType)
        }
        projectileVelocities.delete(id)
        previousProjectilePositions.delete(id)
      }
    })

    // Update tracking
    previousProjectileIds.clear()
    projectiles.forEach((p) => {
      previousProjectileIds.add(p.id)

      // Calculate velocity from position change
      const prevPos = previousProjectilePositions.get(p.id)
      if (prevPos) {
        projectileVelocities.set(p.id, {
          x: p.position.x - prevPos.x,
          y: p.position.y - prevPos.y,
          z: p.position.z - prevPos.z,
        })
      }

      previousProjectilePositions.set(p.id, { ...p.position })
    })
  }, [projectiles, towers])

  return (
    <group>
      {projectiles.map((projectile) => (
        <ProjectileMesh key={projectile.id} projectile={projectile} />
      ))}
    </group>
  )
}

function ProjectileMesh({ projectile }: { projectile: Projectile }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const towers = useGameStore((state) => state.towers)
  const lastEmitRef = useRef(0)

  // Get tower type to determine projectile appearance
  const tower = useMemo(
    () => towers.find((t) => t.id === projectile.sourceId),
    [towers, projectile.sourceId]
  )

  // Determine color and size based on source tower
  const { color, size, towerType } = useMemo(() => {
    let col = '#ffffff'
    let sz = 0.15
    let type: TowerType | 'default' = 'default'

    if (tower) {
      type = tower.type
      switch (tower.type) {
        case 'plasmaSpire':
          col = '#00ffff'
          sz = 0.12
          break
        case 'railCannon':
          col = '#ff0066'
          sz = 0.2
          break
        case 'novaLauncher':
          col = '#ffff00'
          sz = 0.25
          break
      }
    }
    return { color: col, size: sz, towerType: type }
  }, [tower])

  useFrame(() => {
    if (!meshRef.current) return

    // Rotate projectile for visual effect
    meshRef.current.rotation.x += 0.2
    meshRef.current.rotation.z += 0.1

    // Emit trail particles
    const now = Date.now() / 1000
    if (now - lastEmitRef.current > TRAIL_EMIT_INTERVAL) {
      lastEmitRef.current = now

      // Get velocity from tracking map
      const velocity = projectileVelocities.get(projectile.id) || { x: 0, y: 0, z: 0 }

      // Only emit if there's some velocity (projectile is moving)
      const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y + velocity.z * velocity.z)
      if (speed > 0.01) {
        emitTrailParticles(
          { x: projectile.position.x, y: projectile.position.y, z: projectile.position.z },
          { x: velocity.x * 60, y: velocity.y * 60, z: velocity.z * 60 }, // Scale up velocity for effect
          towerType === 'default' ? 'default' : towerType
        )
      }
    }
  })

  const isSplash = projectile.splashRadius !== undefined

  return (
    <group position={[projectile.position.x, projectile.position.y, projectile.position.z]}>
      <mesh ref={meshRef} castShadow>
        {isSplash ? (
          <dodecahedronGeometry args={[size]} />
        ) : (
          <sphereGeometry args={[size, 8, 8]} />
        )}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.5}
        />
      </mesh>

      {/* Trail effect - point light for dynamic lighting */}
      <pointLight color={color} intensity={0.8} distance={3} decay={2} />

      {/* Glow effect */}
      <mesh>
        <sphereGeometry args={[size * 1.8, 8, 8]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Inner core glow */}
      <mesh>
        <sphereGeometry args={[size * 0.5, 6, 6]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  )
}
