import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../stores/gameStore'
import { TowerFactory } from '../entities/TowerFactory'
import { getTierNumber } from '../entities/Tower'
import type { Tower, TowerTier } from '../types'

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
  const selectedTowerId = useGameStore((state) => state.selectedTowerId)

  // Get dynamic color based on tier
  const color = TowerFactory.getTowerColor(tower)
  const tierNum = getTierNumber(tower.tier)

  useFrame(() => {
    if (!meshRef.current) return
    meshRef.current.rotation.y = tower.rotation
  })

  // Scale increases with tier
  const tierScale = 1 + (tierNum - 1) * 0.1

  // Emissive intensity increases with tier
  const emissiveIntensity = 0.3 + (tierNum - 1) * 0.15

  return (
    <group position={[tower.position.x, 0, tower.position.z]} scale={tierScale}>
      {/* Base */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.8, 1, 0.5, 8]} />
        <meshStandardMaterial color="#444466" />
      </mesh>

      {/* Tier indicators - rings around base */}
      {Array.from({ length: tierNum }).map((_, i) => (
        <mesh key={i} position={[0, 0.05 + i * 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.95 + i * 0.1, 1.0 + i * 0.1, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} />
        </mesh>
      ))}

      {/* Tower body - rotates to face target */}
      <group ref={meshRef}>
        {tower.type === 'plasmaSpire' && (
          <PlasmaSpireMesh color={color} tier={tower.tier} emissiveIntensity={emissiveIntensity} />
        )}

        {tower.type === 'railCannon' && (
          <RailCannonMesh color={color} tier={tower.tier} emissiveIntensity={emissiveIntensity} />
        )}

        {tower.type === 'novaLauncher' && (
          <NovaLauncherMesh color={color} tier={tower.tier} emissiveIntensity={emissiveIntensity} />
        )}
      </group>

      {/* Range indicator when selected */}
      {selectedTowerId === tower.id && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[tower.range - 0.1, tower.range, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.2} />
        </mesh>
      )}

      {/* Special effect aura for tier 4 towers */}
      {(tower.tier === '4A' || tower.tier === '4B') && (
        <SpecialEffectAura color={color} effect={tower.specialEffect} />
      )}
    </group>
  )
}

interface TowerPartProps {
  color: string
  tier: TowerTier
  emissiveIntensity: number
}

function PlasmaSpireMesh({ color, tier, emissiveIntensity }: TowerPartProps) {
  const tierNum = getTierNumber(tier)
  const ringCount = 3 + Math.floor(tierNum / 2) // More rings at higher tiers

  return (
    <group>
      {/* Main spire */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.4, 2, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emissiveIntensity} />
      </mesh>

      {/* Energy rings - more at higher tiers */}
      {Array.from({ length: ringCount }).map((_, i) => (
        <mesh key={i} position={[0, 0.7 + i * 0.4, 0]}>
          <torusGeometry args={[0.35, 0.05, 8, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={emissiveIntensity + 0.2}
          />
        </mesh>
      ))}

      {/* Tip */}
      <mesh position={[0, 2.7, 0]}>
        <sphereGeometry args={[0.15 + tierNum * 0.03, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emissiveIntensity + 0.5} />
      </mesh>

      {/* Additional orbs for tier 4 */}
      {tier === '4A' && (
        // Void Siphon - dark swirling orbs
        <>
          {[0, 1, 2].map((i) => (
            <mesh
              key={i}
              position={[
                Math.cos((i * Math.PI * 2) / 3) * 0.5,
                2.0,
                Math.sin((i * Math.PI * 2) / 3) * 0.5,
              ]}
            >
              <sphereGeometry args={[0.12, 8, 8]} />
              <meshStandardMaterial color="#330066" emissive="#9900ff" emissiveIntensity={0.8} />
            </mesh>
          ))}
        </>
      )}

      {tier === '4B' && (
        // Prismatic Array - rainbow crystal shards
        <>
          {['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'].map((c, i) => (
            <mesh
              key={i}
              position={[
                Math.cos((i * Math.PI * 2) / 5) * 0.4,
                2.2 + (i % 2) * 0.2,
                Math.sin((i * Math.PI * 2) / 5) * 0.4,
              ]}
              rotation={[Math.random(), Math.random(), Math.random()]}
            >
              <octahedronGeometry args={[0.1]} />
              <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.7} />
            </mesh>
          ))}
        </>
      )}

      <pointLight position={[0, 2.7, 0]} color={color} intensity={1 + tierNum * 0.3} distance={4 + tierNum} />
    </group>
  )
}

function RailCannonMesh({ color, tier, emissiveIntensity }: TowerPartProps) {
  const tierNum = getTierNumber(tier)
  const barrelLength = 1.8 + tierNum * 0.2

  return (
    <group>
      {/* Base structure */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <boxGeometry args={[0.8, 1, 0.8]} />
        <meshStandardMaterial color="#333344" />
      </mesh>

      {/* Cannon barrel */}
      <mesh position={[0, 1, 0.8]} rotation={[-Math.PI / 8, 0, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, barrelLength, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emissiveIntensity} />
      </mesh>

      {/* Muzzle */}
      <mesh position={[0, 1.2, 1.6]} rotation={[-Math.PI / 8, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.15, 0.3, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emissiveIntensity + 0.2} />
      </mesh>

      {/* Tier 3+ armor piercing coils */}
      {tierNum >= 3 && (
        <>
          {[0.3, 0.6, 0.9].map((offset, i) => (
            <mesh key={i} position={[0, 1 + offset * 0.2, 0.5 + offset]} rotation={[-Math.PI / 8, 0, 0]}>
              <torusGeometry args={[0.22, 0.03, 8, 16]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emissiveIntensity + 0.3} />
            </mesh>
          ))}
        </>
      )}

      {tier === '4A' && (
        // Singularity Rifle - dark energy core
        <mesh position={[0, 1.5, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial
            color="#000033"
            emissive="#000066"
            emissiveIntensity={0.5}
          />
        </mesh>
      )}

      {tier === '4B' && (
        // Swarm Launcher - multiple missile tubes
        <>
          {[0, 1, 2, 3].map((i) => (
            <mesh
              key={i}
              position={[
                (i % 2 === 0 ? -0.2 : 0.2),
                1.3,
                0.8 + (i < 2 ? 0 : 0.15),
              ]}
              rotation={[-Math.PI / 8, 0, 0]}
            >
              <cylinderGeometry args={[0.08, 0.08, 0.6, 6]} />
              <meshStandardMaterial color="#ff9900" emissive="#ff6600" emissiveIntensity={0.5} />
            </mesh>
          ))}
        </>
      )}

      <pointLight position={[0, 1.2, 1.8]} color={color} intensity={0.5 + tierNum * 0.2} distance={3 + tierNum} />
    </group>
  )
}

function NovaLauncherMesh({ color, tier, emissiveIntensity }: TowerPartProps) {
  const tierNum = getTierNumber(tier)
  const tubeCount = 3 + Math.floor(tierNum / 2)

  return (
    <group>
      {/* Body */}
      <mesh position={[0, 1, 0]} castShadow>
        <dodecahedronGeometry args={[0.6]} />
        <meshStandardMaterial color="#444444" />
      </mesh>

      {/* Launcher tubes - more at higher tiers */}
      {Array.from({ length: tubeCount }).map((_unused, idx) => (
        <mesh
          key={idx}
          position={[
            Math.cos((idx * Math.PI * 2) / tubeCount) * 0.4,
            1.3,
            Math.sin((idx * Math.PI * 2) / tubeCount) * 0.4 + 0.3,
          ]}
          rotation={[-Math.PI / 6, 0, 0]}
          castShadow
        >
          <cylinderGeometry args={[0.12, 0.12, 0.5 + tierNum * 0.1, 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emissiveIntensity} />
        </mesh>
      ))}

      {tier === '4A' && (
        // Supernova Core - glowing radioactive core
        <mesh position={[0, 1, 0]}>
          <icosahedronGeometry args={[0.35]} />
          <meshStandardMaterial
            color="#00ff66"
            emissive="#00ff66"
            emissiveIntensity={1.0}
            transparent
            opacity={0.8}
          />
        </mesh>
      )}

      {tier === '4B' && (
        // Cryo Comet - ice crystals
        <>
          {[0, 1, 2, 3].map((i) => (
            <mesh
              key={i}
              position={[
                Math.cos((i * Math.PI * 2) / 4) * 0.5,
                1.5,
                Math.sin((i * Math.PI * 2) / 4) * 0.5,
              ]}
              rotation={[Math.PI / 4, i * 0.5, 0]}
            >
              <octahedronGeometry args={[0.15]} />
              <meshStandardMaterial
                color="#aaffff"
                emissive="#00ccff"
                emissiveIntensity={0.6}
                transparent
                opacity={0.9}
              />
            </mesh>
          ))}
        </>
      )}

      <pointLight position={[0, 1.5, 0]} color={color} intensity={0.8 + tierNum * 0.3} distance={4 + tierNum} />
    </group>
  )
}

function SpecialEffectAura({ color }: { color: string; effect?: string }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5
    }
  })

  return (
    <mesh ref={meshRef} position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[1.1, 1.3, 6]} />
      <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} />
    </mesh>
  )
}
