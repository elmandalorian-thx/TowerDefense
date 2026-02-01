import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../stores/gameStore'
import { EnemyFactory } from '../entities/EnemyFactory'
import { triggerEnemyDeathExplosion } from './effects/ExplosionEffect'
import type { Enemy } from '../types'

// Track previous enemy IDs to detect deaths
let previousEnemyIds = new Set<string>()
let previousEnemyData = new Map<string, { position: { x: number; y: number; z: number }; type: string; size: number }>()

export function EnemyRenderer() {
  const enemies = useGameStore((state) => state.enemies)

  // Detect enemy deaths and trigger explosions
  useEffect(() => {
    const currentIds = new Set(enemies.map((e) => e.id))

    // Find enemies that were removed (died or reached end)
    previousEnemyIds.forEach((id) => {
      if (!currentIds.has(id)) {
        const enemyData = previousEnemyData.get(id)
        if (enemyData) {
          // Trigger death explosion at last known position
          triggerEnemyDeathExplosion(
            enemyData.position,
            enemyData.type,
            enemyData.size
          )
        }
      }
    })

    // Update tracking maps
    previousEnemyIds = currentIds
    previousEnemyData.clear()
    enemies.forEach((enemy) => {
      const config = EnemyFactory.getConfig(enemy.type)
      previousEnemyData.set(enemy.id, {
        position: { x: enemy.position.x, y: enemy.position.y + (config?.stats.size || 0.5) / 2, z: enemy.position.z },
        type: enemy.type,
        size: config?.stats.size || 0.5,
      })
    })
  }, [enemies])

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

  useFrame((_, delta) => {
    if (!meshRef.current) return

    const baseY = (config?.stats.size || 0.5) / 2
    const time = Date.now() * 0.001

    // Different animations based on enemy type
    switch (enemy.type) {
      case 'blobbert': {
        // Jiggly bounce animation
        const bounce = Math.sin(time * 8) * 0.15
        const squash = 1 + Math.sin(time * 8) * 0.1
        const isMini = enemy.behaviorState?.isMini
        const scale = isMini ? 0.5 : 1
        meshRef.current.position.y = baseY * scale + bounce * scale
        meshRef.current.scale.set(
          scale * squash,
          scale / squash,
          scale * squash
        )
        break
      }
      case 'sirScuttles': {
        // Quick scuttle animation, enhanced sidestep when dodging
        const isDodging = enemy.behaviorState?.isDodging
        const scuttle = Math.sin(time * 15) * 0.05
        meshRef.current.position.y = baseY + Math.abs(scuttle)
        if (isDodging) {
          // Quick sidestep visual
          meshRef.current.rotation.z = Math.sin(time * 30) * 0.3
        } else {
          meshRef.current.rotation.z = scuttle * 2
        }
        break
      }
      case 'chonkzilla': {
        // Heavy stomping animation
        const stomp = Math.abs(Math.sin(time * 3)) * 0.1
        meshRef.current.position.y = baseY + stomp
        // Ground shake effect - slight wobble
        meshRef.current.rotation.x = Math.sin(time * 6) * 0.02
        meshRef.current.rotation.z = Math.cos(time * 6) * 0.02
        break
      }
      case 'floofernaut': {
        // Float higher with gentle bob
        const floatHeight = 0.5
        const bob = Math.sin(time * 2) * 0.2
        meshRef.current.position.y = baseY + floatHeight + bob
        // Gentle rotation
        meshRef.current.rotation.y += delta * 0.5
        break
      }
      case 'zappyMcZapface': {
        // Electric jitter + float
        const jitter = (Math.random() - 0.5) * 0.05
        const float = Math.sin(time * 4) * 0.1
        meshRef.current.position.y = baseY + 0.3 + float + jitter
        meshRef.current.position.x = enemy.position.x + jitter
        meshRef.current.position.z = enemy.position.z + jitter
        break
      }
      case 'wormothy': {
        const isBurrowed = enemy.behaviorState?.isBurrowed
        if (isBurrowed) {
          // Underground - sink down
          meshRef.current.position.y = -0.5
          meshRef.current.scale.y = 0.3
        } else {
          // Gentleman wiggle
          const wiggle = Math.sin(time * 4) * 0.1
          meshRef.current.position.y = baseY + wiggle
          meshRef.current.scale.y = 1
          // Inchworm-like movement
          meshRef.current.rotation.x = Math.sin(time * 8) * 0.15
        }
        break
      }
      default:
        meshRef.current.position.y = baseY + Math.sin(time * 5) * 0.1
    }
  })

  if (!config) return null

  const { size, color } = config.stats
  const healthPercent = enemy.health / enemy.maxHealth
  const isMini = enemy.behaviorState?.isMini
  const displaySize = isMini ? size * 0.5 : size

  return (
    <group
      ref={meshRef}
      position={[enemy.position.x, displaySize / 2, enemy.position.z]}
      rotation={[0, enemy.rotation, 0]}
    >
      {/* Body based on enemy type */}
      {enemy.type === 'blobbert' && <BlobbertMesh size={displaySize} color={color} isMini={isMini} />}
      {enemy.type === 'sirScuttles' && <SirScuttlesMesh size={displaySize} color={color} isDodging={enemy.behaviorState?.isDodging} />}
      {enemy.type === 'chonkzilla' && <ChonkzillaMesh size={displaySize} color={color} />}
      {enemy.type === 'floofernaut' && <FloofernautMesh size={displaySize} color={color} leavesTrail={enemy.behaviors?.leavesTrail} />}
      {enemy.type === 'zappyMcZapface' && <ZappyMesh size={displaySize} color={color} />}
      {enemy.type === 'wormothy' && <WormothyMesh size={displaySize} color={color} isBurrowed={enemy.behaviorState?.isBurrowed} />}

      {/* Health bar */}
      <group position={[0, displaySize + 0.3, 0]}>
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

// Blobbert: Jiggly blob with eyes
function BlobbertMesh({ size, color, isMini }: { size: number; color: string; isMini?: boolean }) {
  return (
    <group>
      <mesh castShadow>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Cute eyes */}
      <mesh position={[-size * 0.3, size * 0.2, size * 0.7]}>
        <sphereGeometry args={[size * 0.15, 8, 8]} />
        <meshBasicMaterial color="white" />
      </mesh>
      <mesh position={[size * 0.3, size * 0.2, size * 0.7]}>
        <sphereGeometry args={[size * 0.15, 8, 8]} />
        <meshBasicMaterial color="white" />
      </mesh>
      {/* Pupils */}
      <mesh position={[-size * 0.3, size * 0.2, size * 0.8]}>
        <sphereGeometry args={[size * 0.08, 8, 8]} />
        <meshBasicMaterial color="black" />
      </mesh>
      <mesh position={[size * 0.3, size * 0.2, size * 0.8]}>
        <sphereGeometry args={[size * 0.08, 8, 8]} />
        <meshBasicMaterial color="black" />
      </mesh>
      {/* Mini indicator - smaller bow */}
      {isMini && (
        <mesh position={[0, size * 0.9, 0]}>
          <coneGeometry args={[size * 0.2, size * 0.3, 3]} />
          <meshStandardMaterial color="#ff88aa" />
        </mesh>
      )}
    </group>
  )
}

// Sir Scuttles: Crab-like with claws
function SirScuttlesMesh({ size, color, isDodging }: { size: number; color: string; isDodging?: boolean }) {
  const clawColor = isDodging ? '#ffff00' : color

  return (
    <group>
      {/* Body */}
      <mesh castShadow>
        <boxGeometry args={[size * 1.5, size * 0.5, size]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Eyes on stalks */}
      {[-1, 1].map((side) => (
        <group key={`eye-${side}`}>
          <mesh position={[side * size * 0.4, size * 0.4, size * 0.3]}>
            <cylinderGeometry args={[size * 0.05, size * 0.05, size * 0.3, 8]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[side * size * 0.4, size * 0.6, size * 0.3]}>
            <sphereGeometry args={[size * 0.1, 8, 8]} />
            <meshBasicMaterial color="white" />
          </mesh>
        </group>
      ))}
      {/* Claws */}
      {[-1, 1].map((side) => (
        <group key={`claw-${side}`} position={[side * size * 0.9, 0, size * 0.2]}>
          <mesh castShadow>
            <boxGeometry args={[size * 0.4, size * 0.3, size * 0.15]} />
            <meshStandardMaterial color={clawColor} />
          </mesh>
          {/* Claw pincer */}
          <mesh position={[side * size * 0.15, size * 0.1, 0]} rotation={[0, 0, side * 0.5]}>
            <boxGeometry args={[size * 0.15, size * 0.2, size * 0.1]} />
            <meshStandardMaterial color={clawColor} />
          </mesh>
        </group>
      ))}
      {/* Legs */}
      {[-1, 1].map((side) =>
        [-0.3, 0, 0.3].map((offset, i) => (
          <mesh
            key={`leg-${side}-${i}`}
            position={[side * size * 0.6, -size * 0.2, offset * size]}
            castShadow
          >
            <boxGeometry args={[size * 0.15, size * 0.4, size * 0.08]} />
            <meshStandardMaterial color={color} />
          </mesh>
        ))
      )}
    </group>
  )
}

// Chonkzilla: Massive armored beast with spikes
function ChonkzillaMesh({ size, color }: { size: number; color: string }) {
  return (
    <group>
      {/* Main body */}
      <mesh castShadow>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Armor plates */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh
          key={`plate-${i}`}
          position={[
            Math.cos((i * Math.PI) / 3) * size * 0.85,
            Math.sin((i * Math.PI) / 6) * size * 0.2,
            Math.sin((i * Math.PI) / 3) * size * 0.85,
          ]}
          rotation={[0, (i * Math.PI) / 3, 0]}
          castShadow
        >
          <boxGeometry args={[size * 0.4, size * 0.5, size * 0.1]} />
          <meshStandardMaterial color="#555577" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      {/* Spikes */}
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={`spike-${i}`}
          position={[
            Math.cos((i * Math.PI) / 2) * size * 0.8,
            size * 0.5,
            Math.sin((i * Math.PI) / 2) * size * 0.8,
          ]}
          rotation={[0.4, (i * Math.PI) / 2, 0]}
          castShadow
        >
          <coneGeometry args={[size * 0.15, size * 0.6, 4]} />
          <meshStandardMaterial color="#aa66ff" />
        </mesh>
      ))}
      {/* Angry eyes */}
      <mesh position={[-size * 0.3, size * 0.3, size * 0.8]}>
        <sphereGeometry args={[size * 0.15, 8, 8]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>
      <mesh position={[size * 0.3, size * 0.3, size * 0.8]}>
        <sphereGeometry args={[size * 0.15, 8, 8]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>
      {/* Ground impact rings (visual only) */}
      <mesh position={[0, -size * 0.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[size * 1.2, size * 1.4, 16]} />
        <meshBasicMaterial color="#8844ff" opacity={0.3} transparent />
      </mesh>
    </group>
  )
}

// Floofernaut: Floating fuzzy alien with trail particles
function FloofernautMesh({ size, color, leavesTrail }: { size: number; color: string; leavesTrail?: boolean }) {
  return (
    <group>
      {/* Main fluffy body */}
      <mesh castShadow>
        <sphereGeometry args={[size * 0.8, 16, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Fluffy protrusions */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <mesh
          key={`floof-${i}`}
          position={[
            Math.cos((i * Math.PI) / 4) * size * 0.6,
            Math.sin((i * Math.PI) / 4) * size * 0.3,
            Math.sin((i * Math.PI) / 4) * size * 0.6,
          ]}
          castShadow
        >
          <sphereGeometry args={[size * 0.35, 8, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
      {/* Cute face */}
      <mesh position={[0, 0, size * 0.75]}>
        <sphereGeometry args={[size * 0.2, 8, 8]} />
        <meshBasicMaterial color="#ffccaa" />
      </mesh>
      {/* Eyes */}
      <mesh position={[-size * 0.15, size * 0.1, size * 0.85]}>
        <sphereGeometry args={[size * 0.08, 8, 8]} />
        <meshBasicMaterial color="black" />
      </mesh>
      <mesh position={[size * 0.15, size * 0.1, size * 0.85]}>
        <sphereGeometry args={[size * 0.08, 8, 8]} />
        <meshBasicMaterial color="black" />
      </mesh>
      {/* Trail indicator - glowing particles below */}
      {leavesTrail && (
        <group position={[0, -size * 0.5, 0]}>
          {[0, 1, 2].map((i) => (
            <mesh key={`trail-${i}`} position={[0, -i * 0.15, -i * 0.1]}>
              <sphereGeometry args={[size * 0.15 - i * 0.03, 8, 8]} />
              <meshBasicMaterial color="#ff6600" opacity={0.7 - i * 0.2} transparent />
            </mesh>
          ))}
        </group>
      )}
    </group>
  )
}

// Zappy McZapface: Electric jellyfish with tiny hat
function ZappyMesh({ size, color }: { size: number; color: string }) {
  const tentaclePositions = useMemo(() => {
    return [0, 1, 2, 3, 4, 5].map((i) => ({
      x: Math.cos((i * Math.PI) / 3) * size * 0.4,
      z: Math.sin((i * Math.PI) / 3) * size * 0.4,
    }))
  }, [size])

  return (
    <group>
      {/* Dome head */}
      <mesh castShadow>
        <sphereGeometry args={[size * 0.8, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </mesh>
      {/* Inner glow */}
      <mesh>
        <sphereGeometry args={[size * 0.5, 16, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
      </mesh>
      {/* Tiny top hat! */}
      <group position={[0, size * 0.7, 0]}>
        {/* Hat brim */}
        <mesh>
          <cylinderGeometry args={[size * 0.35, size * 0.35, size * 0.05, 16]} />
          <meshStandardMaterial color="#222222" />
        </mesh>
        {/* Hat top */}
        <mesh position={[0, size * 0.2, 0]}>
          <cylinderGeometry args={[size * 0.2, size * 0.25, size * 0.35, 16]} />
          <meshStandardMaterial color="#222222" />
        </mesh>
        {/* Hat band */}
        <mesh position={[0, size * 0.1, 0]}>
          <cylinderGeometry args={[size * 0.26, size * 0.26, size * 0.08, 16]} />
          <meshStandardMaterial color="#ff0066" />
        </mesh>
      </group>
      {/* Electric tentacles */}
      {tentaclePositions.map((pos, i) => (
        <group key={`tentacle-${i}`} position={[pos.x, -size * 0.2, pos.z]}>
          {[0, 1, 2, 3].map((j) => (
            <mesh key={`seg-${j}`} position={[Math.sin(j * 0.5) * 0.1, -j * size * 0.2, 0]}>
              <sphereGeometry args={[size * 0.08, 8, 8]} />
              <meshBasicMaterial
                color={j % 2 === 0 ? color : '#ffffff'}
              />
            </mesh>
          ))}
        </group>
      ))}
      {/* Electric spark effect */}
      <pointLight color={color} intensity={0.5} distance={2} />
    </group>
  )
}

// Wormothy: Gentleman worm with bow tie
function WormothyMesh({ size, color, isBurrowed }: { size: number; color: string; isBurrowed?: boolean }) {
  const segmentCount = 5

  return (
    <group>
      {/* Worm segments */}
      {Array.from({ length: segmentCount }).map((_, i) => {
        const segmentSize = size * (1 - i * 0.1) * 0.4
        const yOffset = isBurrowed ? -size * (i + 1) * 0.3 : 0
        return (
          <mesh
            key={`segment-${i}`}
            position={[0, yOffset, -i * size * 0.35]}
            castShadow
          >
            <sphereGeometry args={[segmentSize, 12, 12]} />
            <meshStandardMaterial color={i === 0 ? '#ffccbb' : color} />
          </mesh>
        )
      })}
      {/* Face on first segment */}
      {!isBurrowed && (
        <group position={[0, 0, size * 0.1]}>
          {/* Monocle */}
          <mesh position={[size * 0.15, size * 0.1, size * 0.25]} rotation={[0, 0, 0.2]}>
            <torusGeometry args={[size * 0.1, size * 0.02, 8, 16]} />
            <meshStandardMaterial color="#ddaa00" metalness={0.8} />
          </mesh>
          {/* Monocle chain */}
          <mesh position={[size * 0.25, -size * 0.05, size * 0.2]}>
            <cylinderGeometry args={[size * 0.01, size * 0.01, size * 0.2, 8]} />
            <meshStandardMaterial color="#ddaa00" metalness={0.8} />
          </mesh>
          {/* Eyes */}
          <mesh position={[-size * 0.1, size * 0.1, size * 0.3]}>
            <sphereGeometry args={[size * 0.06, 8, 8]} />
            <meshBasicMaterial color="black" />
          </mesh>
          <mesh position={[size * 0.1, size * 0.1, size * 0.3]}>
            <sphereGeometry args={[size * 0.06, 8, 8]} />
            <meshBasicMaterial color="black" />
          </mesh>
          {/* Fancy mustache */}
          {[-1, 1].map((side) => (
            <mesh
              key={`stache-${side}`}
              position={[side * size * 0.12, -size * 0.05, size * 0.35]}
              rotation={[0, 0, side * 0.5]}
            >
              <boxGeometry args={[size * 0.15, size * 0.03, size * 0.02]} />
              <meshStandardMaterial color="#442200" />
            </mesh>
          ))}
        </group>
      )}
      {/* Bow tie between segments 1 and 2 */}
      {!isBurrowed && (
        <group position={[0, -size * 0.15, -size * 0.2]}>
          {/* Bow tie sides */}
          {[-1, 1].map((side) => (
            <mesh
              key={`bow-${side}`}
              position={[side * size * 0.12, 0, 0]}
              rotation={[0, 0, side * 0.3]}
            >
              <coneGeometry args={[size * 0.1, size * 0.15, 3]} />
              <meshStandardMaterial color="#ff3366" />
            </mesh>
          ))}
          {/* Bow tie center */}
          <mesh>
            <sphereGeometry args={[size * 0.05, 8, 8]} />
            <meshStandardMaterial color="#ff3366" />
          </mesh>
        </group>
      )}
      {/* Dirt particles when burrowed */}
      {isBurrowed && (
        <group position={[0, 0, 0]}>
          {[0, 1, 2, 3].map((i) => (
            <mesh
              key={`dirt-${i}`}
              position={[
                (Math.random() - 0.5) * size,
                -size * 0.3,
                (Math.random() - 0.5) * size,
              ]}
            >
              <sphereGeometry args={[size * 0.1, 6, 6]} />
              <meshStandardMaterial color="#664422" />
            </mesh>
          ))}
        </group>
      )}
    </group>
  )
}
