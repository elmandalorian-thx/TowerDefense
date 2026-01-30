import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../stores/gameStore'
import { TowerFactory } from '../entities/TowerFactory'
import type { Tower } from '../types'

export function TowerRenderer() {
  const towers = useGameStore((state) => state.towers)

  return (
    <group>
      {towers.map((tower) => (
        <TowerMesh key={tower.id} tower={tower} />
      ))}
    </group>
  )
}

function TowerMesh({ tower }: { tower: Tower }) {
  const meshRef = useRef<THREE.Group>(null)
  const config = TowerFactory.getConfig(tower.type)

  useFrame(() => {
    if (!meshRef.current) return
    meshRef.current.rotation.y = tower.rotation
  })

  if (!config) return null

  const { color } = config.stats

  return (
    <group position={[tower.position.x, 0, tower.position.z]}>
      {/* Base */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.8, 1, 0.5, 8]} />
        <meshStandardMaterial color="#444466" />
      </mesh>

      {/* Tower body - rotates to face target */}
      <group ref={meshRef}>
        {tower.type === 'plasmaSpire' && (
          <group>
            {/* Main spire */}
            <mesh position={[0, 1.5, 0]} castShadow>
              <cylinderGeometry args={[0.2, 0.4, 2, 8]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
            </mesh>
            {/* Energy rings */}
            {[0.8, 1.2, 1.6].map((y, i) => (
              <mesh key={i} position={[0, y, 0]}>
                <torusGeometry args={[0.35, 0.05, 8, 16]} />
                <meshStandardMaterial
                  color={color}
                  emissive={color}
                  emissiveIntensity={0.5}
                />
              </mesh>
            ))}
            {/* Tip */}
            <mesh position={[0, 2.7, 0]}>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
            </mesh>
            <pointLight position={[0, 2.7, 0]} color={color} intensity={1} distance={4} />
          </group>
        )}

        {tower.type === 'railCannon' && (
          <group>
            {/* Base structure */}
            <mesh position={[0, 0.8, 0]} castShadow>
              <boxGeometry args={[0.8, 1, 0.8]} />
              <meshStandardMaterial color="#333344" />
            </mesh>
            {/* Cannon barrel */}
            <mesh position={[0, 1, 0.8]} rotation={[-Math.PI / 8, 0, 0]} castShadow>
              <cylinderGeometry args={[0.15, 0.2, 1.8, 8]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
            </mesh>
            {/* Muzzle */}
            <mesh position={[0, 1.2, 1.6]} rotation={[-Math.PI / 8, 0, 0]}>
              <cylinderGeometry args={[0.25, 0.15, 0.3, 8]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
            </mesh>
            <pointLight position={[0, 1.2, 1.8]} color={color} intensity={0.5} distance={3} />
          </group>
        )}

        {tower.type === 'novaLauncher' && (
          <group>
            {/* Body */}
            <mesh position={[0, 1, 0]} castShadow>
              <dodecahedronGeometry args={[0.6]} />
              <meshStandardMaterial color="#444444" />
            </mesh>
            {/* Launcher tubes */}
            {[0, 1, 2].map((i) => (
              <mesh
                key={i}
                position={[
                  Math.cos((i * Math.PI * 2) / 3) * 0.4,
                  1.3,
                  Math.sin((i * Math.PI * 2) / 3) * 0.4 + 0.3,
                ]}
                rotation={[-Math.PI / 6, 0, 0]}
                castShadow
              >
                <cylinderGeometry args={[0.12, 0.12, 0.5, 8]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
              </mesh>
            ))}
            <pointLight position={[0, 1.5, 0]} color={color} intensity={0.8} distance={4} />
          </group>
        )}
      </group>

      {/* Range indicator when selected */}
      {useGameStore.getState().selectedTowerId === tower.id && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[tower.range - 0.1, tower.range, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.2} />
        </mesh>
      )}
    </group>
  )
}
