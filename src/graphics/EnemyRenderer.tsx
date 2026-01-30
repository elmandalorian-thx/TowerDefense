import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../stores/gameStore'
import { EnemyFactory } from '../entities/EnemyFactory'
import type { Enemy } from '../types'

export function EnemyRenderer() {
  const enemies = useGameStore((state) => state.enemies)

  return (
    <group>
      {enemies.map((enemy) => (
        <EnemyMesh key={enemy.id} enemy={enemy} />
      ))}
    </group>
  )
}

function EnemyMesh({ enemy }: { enemy: Enemy }) {
  const meshRef = useRef<THREE.Group>(null)
  const config = EnemyFactory.getConfig(enemy.type)

  useFrame(() => {
    if (!meshRef.current) return

    // Bobbing animation
    meshRef.current.position.y =
      (config?.stats.size || 0.5) / 2 + Math.sin(Date.now() * 0.005) * 0.1
  })

  if (!config) return null

  const { size, color } = config.stats
  const healthPercent = enemy.health / enemy.maxHealth

  return (
    <group
      ref={meshRef}
      position={[enemy.position.x, size / 2, enemy.position.z]}
      rotation={[0, enemy.rotation, 0]}
    >
      {/* Body based on enemy type */}
      {enemy.type === 'blobbert' && (
        <mesh castShadow>
          <sphereGeometry args={[size, 16, 16]} />
          <meshStandardMaterial color={color} />
        </mesh>
      )}

      {enemy.type === 'sirScuttles' && (
        <group>
          <mesh castShadow>
            <boxGeometry args={[size * 1.5, size * 0.5, size]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {/* Legs */}
          {[-1, 1].map((side) =>
            [-0.3, 0.3].map((offset, i) => (
              <mesh
                key={`leg-${side}-${i}`}
                position={[side * size * 0.6, -size * 0.2, offset * size]}
                castShadow
              >
                <boxGeometry args={[size * 0.2, size * 0.4, size * 0.1]} />
                <meshStandardMaterial color={color} />
              </mesh>
            ))
          )}
        </group>
      )}

      {enemy.type === 'chonkzilla' && (
        <group>
          <mesh castShadow>
            <sphereGeometry args={[size, 16, 16]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {/* Spikes */}
          {[0, 1, 2, 3].map((i) => (
            <mesh
              key={`spike-${i}`}
              position={[
                Math.cos((i * Math.PI) / 2) * size * 0.8,
                size * 0.3,
                Math.sin((i * Math.PI) / 2) * size * 0.8,
              ]}
              rotation={[0.3, (i * Math.PI) / 2, 0]}
              castShadow
            >
              <coneGeometry args={[size * 0.2, size * 0.5, 4]} />
              <meshStandardMaterial color="#aa66ff" />
            </mesh>
          ))}
        </group>
      )}

      {enemy.type === 'floofernaut' && (
        <group>
          <mesh castShadow>
            <sphereGeometry args={[size * 0.8, 16, 16]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {/* Fluffy protrusions */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <mesh
              key={`floof-${i}`}
              position={[
                Math.cos((i * Math.PI) / 3) * size * 0.5,
                Math.sin((i * Math.PI) / 3) * size * 0.3,
                Math.sin((i * Math.PI) / 3) * size * 0.5,
              ]}
              castShadow
            >
              <sphereGeometry args={[size * 0.3, 8, 8]} />
              <meshStandardMaterial color={color} />
            </mesh>
          ))}
        </group>
      )}

      {/* Health bar */}
      <group position={[0, size + 0.3, 0]}>
        <mesh>
          <planeGeometry args={[1, 0.1]} />
          <meshBasicMaterial color="#333333" />
        </mesh>
        <mesh position={[(healthPercent - 1) * 0.5, 0, 0.01]}>
          <planeGeometry args={[healthPercent, 0.08]} />
          <meshBasicMaterial
            color={healthPercent > 0.5 ? '#44ff44' : healthPercent > 0.25 ? '#ffff44' : '#ff4444'}
          />
        </mesh>
      </group>
    </group>
  )
}
