import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../stores/gameStore'
import type { Projectile } from '../types'

export function ProjectileRenderer() {
  const projectiles = useGameStore((state) => state.projectiles)

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

  // Get tower type to determine projectile appearance
  const tower = towers.find((t) => t.id === projectile.sourceId)

  useFrame(() => {
    if (!meshRef.current) return

    // Rotate projectile for visual effect
    meshRef.current.rotation.x += 0.2
    meshRef.current.rotation.z += 0.1
  })

  // Determine color based on source tower
  let color = '#ffffff'
  let size = 0.15

  if (tower) {
    switch (tower.type) {
      case 'plasmaSpire':
        color = '#00ffff'
        size = 0.12
        break
      case 'railCannon':
        color = '#ff0066'
        size = 0.2
        break
      case 'novaLauncher':
        color = '#ffff00'
        size = 0.25
        break
    }
  }

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
          emissiveIntensity={1}
        />
      </mesh>

      {/* Trail effect */}
      <pointLight color={color} intensity={0.5} distance={2} />

      {/* Glow effect */}
      <mesh>
        <sphereGeometry args={[size * 1.5, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
    </group>
  )
}
