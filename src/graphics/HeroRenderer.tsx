import { useRef, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../stores/gameStore'
import { HeroMovementSystem } from '../systems/HeroMovementSystem'
import type { HeroType } from '../types'

// Render Captain Zara - Space Marine
function CaptainZaraModel({ shieldActive }: { shieldActive: boolean }) {
  return (
    <>
      {/* Body */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <capsuleGeometry args={[0.3, 0.8, 8, 16]} />
        <meshStandardMaterial color="#3366ff" />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#ffccaa" />
      </mesh>

      {/* Helmet/Visor */}
      <mesh position={[0, 1.65, 0.1]} castShadow>
        <boxGeometry args={[0.35, 0.15, 0.15]} />
        <meshStandardMaterial color="#00ffff" emissive="#00aaaa" emissiveIntensity={0.5} />
      </mesh>

      {/* Shoulders */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.45, 1.2, 0]} castShadow>
          <sphereGeometry args={[0.18, 8, 8]} />
          <meshStandardMaterial color="#4477ff" />
        </mesh>
      ))}

      {/* Arms */}
      {[-1, 1].map((side) => (
        <mesh key={`arm-${side}`} position={[side * 0.45, 0.8, 0]} castShadow>
          <capsuleGeometry args={[0.1, 0.5, 4, 8]} />
          <meshStandardMaterial color="#3366ff" />
        </mesh>
      ))}

      {/* Weapon (in right hand) */}
      <mesh position={[0.55, 0.6, 0.3]} rotation={[Math.PI / 4, 0, -Math.PI / 6]} castShadow>
        <boxGeometry args={[0.1, 0.5, 0.15]} />
        <meshStandardMaterial color="#666666" />
      </mesh>
      <mesh position={[0.6, 0.5, 0.5]} rotation={[Math.PI / 4, 0, -Math.PI / 6]}>
        <cylinderGeometry args={[0.05, 0.03, 0.3, 8]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.5} />
      </mesh>

      {/* Energy shield effect */}
      {shieldActive && (
        <mesh position={[0, 0.8, 0]}>
          <sphereGeometry args={[1.2, 16, 16]} />
          <meshStandardMaterial
            color="#00aaff"
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Point light for glow */}
      <pointLight position={[0, 1, 0]} color="#3366ff" intensity={0.5} distance={3} />
    </>
  )
}

// Render Professor Wobblesworth III - Brain-Octopus in Jar with Robot Legs
function ProfessorWobblesworthModel({ time }: { time: number }) {
  const bobOffset = Math.sin(time * 2) * 0.1
  const tentacleWave = Math.sin(time * 3) * 0.2

  return (
    <>
      {/* Robot legs base */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.5, 0.3, 8]} />
        <meshStandardMaterial color="#444455" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Spider legs */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i * Math.PI / 2) + Math.PI / 4
        const legBend = Math.sin(time * 4 + i) * 0.1
        return (
          <group key={i} rotation={[0, angle, 0]}>
            {/* Upper leg */}
            <mesh position={[0.3, 0.15, 0]} rotation={[0, 0, -Math.PI / 4 + legBend]} castShadow>
              <capsuleGeometry args={[0.05, 0.4, 4, 8]} />
              <meshStandardMaterial color="#333344" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Lower leg */}
            <mesh position={[0.5, -0.1, 0]} rotation={[0, 0, Math.PI / 6 - legBend]} castShadow>
              <capsuleGeometry args={[0.04, 0.3, 4, 8]} />
              <meshStandardMaterial color="#333344" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        )
      })}

      {/* Glass jar body */}
      <mesh position={[0, 0.8 + bobOffset, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.3, 0.8, 16]} />
        <meshStandardMaterial
          color="#aaddff"
          transparent
          opacity={0.4}
          metalness={0.1}
          roughness={0.1}
        />
      </mesh>

      {/* Jar lid */}
      <mesh position={[0, 1.25 + bobOffset, 0]} castShadow>
        <cylinderGeometry args={[0.38, 0.35, 0.1, 16]} />
        <meshStandardMaterial color="#8855aa" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Brain inside jar */}
      <mesh position={[0, 0.85 + bobOffset, 0]} castShadow>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshStandardMaterial
          color="#ff99aa"
          emissive="#ff3366"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Brain wrinkles */}
      <mesh position={[0, 0.9 + bobOffset, 0]} castShadow>
        <torusGeometry args={[0.15, 0.03, 8, 16]} />
        <meshStandardMaterial color="#ff8899" />
      </mesh>

      {/* Octopus tentacles coming from jar */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i * Math.PI / 3)
        return (
          <mesh
            key={`tentacle-${i}`}
            position={[
              Math.cos(angle) * 0.35,
              0.5 + bobOffset,
              Math.sin(angle) * 0.35
            ]}
            rotation={[
              Math.PI / 4 + Math.sin(time * 2 + i) * 0.3,
              angle,
              tentacleWave
            ]}
            castShadow
          >
            <capsuleGeometry args={[0.04, 0.3, 4, 8]} />
            <meshStandardMaterial
              color="#9933ff"
              emissive="#6600cc"
              emissiveIntensity={0.2}
            />
          </mesh>
        )
      })}

      {/* Eyes on brain */}
      {[-1, 1].map((side) => (
        <mesh key={`eye-${side}`} position={[side * 0.1, 0.95 + bobOffset, 0.15]} castShadow>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial
            color="#ffff00"
            emissive="#ffaa00"
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}

      {/* Purple glow */}
      <pointLight position={[0, 0.8, 0]} color="#9933ff" intensity={0.8} distance={4} />
    </>
  )
}

// Render B.O.R.I.S. - Chunky Soviet Mech with Smiley Screen
function BorisModel({ fortressMode, time }: { fortressMode: boolean; time: number }) {
  const smileyBob = Math.sin(time * 1.5) * 0.02

  return (
    <>
      {/* Massive body */}
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[1.2, 1.4, 0.8]} />
        <meshStandardMaterial
          color={fortressMode ? '#ff8800' : '#ff6600'}
          metalness={0.7}
          roughness={0.4}
        />
      </mesh>

      {/* Chest plate details */}
      <mesh position={[0, 1.2, 0.41]} castShadow>
        <boxGeometry args={[0.8, 0.6, 0.05]} />
        <meshStandardMaterial color="#444444" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Screen face */}
      <mesh position={[0, 1.7 + smileyBob, 0.35]} castShadow>
        <boxGeometry args={[0.6, 0.5, 0.2]} />
        <meshStandardMaterial color="#222222" />
      </mesh>

      {/* Smiley face on screen */}
      {/* Eyes */}
      {[-1, 1].map((side) => (
        <mesh key={`eye-${side}`} position={[side * 0.15, 1.78 + smileyBob, 0.46]}>
          <circleGeometry args={[0.08, 16]} />
          <meshBasicMaterial color={fortressMode ? '#ff0000' : '#00ff00'} />
        </mesh>
      ))}
      {/* Smile */}
      <mesh position={[0, 1.62 + smileyBob, 0.46]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.12, 0.02, 8, 16, Math.PI]} />
        <meshBasicMaterial color={fortressMode ? '#ff0000' : '#00ff00'} />
      </mesh>

      {/* Soviet star emblem */}
      <mesh position={[0, 0.7, 0.41]} rotation={[0, 0, Math.PI / 10]}>
        <cylinderGeometry args={[0.15, 0.15, 0.05, 5]} />
        <meshStandardMaterial color="#cc0000" emissive="#880000" emissiveIntensity={0.3} />
      </mesh>

      {/* Massive shoulders */}
      {[-1, 1].map((side) => (
        <mesh key={`shoulder-${side}`} position={[side * 0.85, 1.3, 0]} castShadow>
          <boxGeometry args={[0.4, 0.5, 0.5]} />
          <meshStandardMaterial color="#555555" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}

      {/* Arms */}
      {[-1, 1].map((side) => (
        <group key={`arm-${side}`}>
          <mesh position={[side * 0.85, 0.7, 0]} castShadow>
            <capsuleGeometry args={[0.18, 0.6, 4, 8]} />
            <meshStandardMaterial color="#ff6600" metalness={0.6} roughness={0.4} />
          </mesh>
          {/* Fist */}
          <mesh position={[side * 0.85, 0.2, 0.1]} castShadow>
            <boxGeometry args={[0.35, 0.35, 0.4]} />
            <meshStandardMaterial color="#444444" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Legs */}
      {[-1, 1].map((side) => (
        <mesh key={`leg-${side}`} position={[side * 0.35, 0.1, 0]} castShadow>
          <boxGeometry args={[0.35, 0.4, 0.4]} />
          <meshStandardMaterial color="#555555" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}

      {/* Exhaust pipes on back */}
      {[-1, 1].map((side) => (
        <mesh key={`exhaust-${side}`} position={[side * 0.4, 1.5, -0.45]} castShadow>
          <cylinderGeometry args={[0.1, 0.12, 0.5, 8]} />
          <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}

      {/* Fortress mode ground anchors */}
      {fortressMode && (
        <>
          {[-1, 1].map((side) => (
            <mesh key={`anchor-${side}`} position={[side * 0.5, -0.1, 0]}>
              <coneGeometry args={[0.2, 0.4, 6]} />
              <meshStandardMaterial color="#ffaa00" emissive="#ff6600" emissiveIntensity={0.5} />
            </mesh>
          ))}
          {/* Shield effect */}
          <mesh position={[0, 1, 0]}>
            <boxGeometry args={[2, 2.5, 1.5]} />
            <meshStandardMaterial
              color="#ff8800"
              transparent
              opacity={0.2}
              side={THREE.DoubleSide}
            />
          </mesh>
        </>
      )}

      {/* Orange glow */}
      <pointLight position={[0, 1, 0.5]} color="#ff6600" intensity={0.6} distance={4} />
    </>
  )
}

// Render Glitch the Unstable - Corrupted Hologram Ninja
function GlitchModel({ invisible, time }: { invisible: boolean; time: number }) {
  const glitchOffset = Math.random() * 0.05 - 0.025
  const flickerOpacity = invisible ? 0.1 : (0.7 + Math.sin(time * 20) * 0.2)

  // Create glitch color effect
  const glitchColor1 = '#00ffff'
  const glitchColor2 = '#ff00ff'
  const useAltColor = Math.sin(time * 15) > 0.7

  return (
    <>
      {/* Main body - glitchy ninja */}
      <group position={[glitchOffset, 0, Math.sin(time * 30) * 0.02]}>
        {/* Torso */}
        <mesh position={[0, 0.9, 0]} castShadow>
          <boxGeometry args={[0.4, 0.6, 0.25]} />
          <meshStandardMaterial
            color={useAltColor ? glitchColor2 : glitchColor1}
            transparent
            opacity={flickerOpacity}
            emissive={useAltColor ? glitchColor2 : glitchColor1}
            emissiveIntensity={0.5}
          />
        </mesh>

        {/* Head */}
        <mesh position={[0, 1.4, 0]} castShadow>
          <boxGeometry args={[0.3, 0.35, 0.28]} />
          <meshStandardMaterial
            color={useAltColor ? glitchColor1 : glitchColor2}
            transparent
            opacity={flickerOpacity}
            emissive={useAltColor ? glitchColor1 : glitchColor2}
            emissiveIntensity={0.5}
          />
        </mesh>

        {/* Ninja mask/visor line */}
        <mesh position={[0, 1.42, 0.15]}>
          <boxGeometry args={[0.32, 0.08, 0.02]} />
          <meshBasicMaterial
            color="#000000"
            transparent
            opacity={flickerOpacity}
          />
        </mesh>

        {/* Glowing eyes */}
        {[-1, 1].map((side) => (
          <mesh key={`eye-${side}`} position={[side * 0.08, 1.42, 0.15]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshBasicMaterial
              color="#ff0000"
              transparent
              opacity={invisible ? 0.3 : 1}
            />
          </mesh>
        ))}

        {/* Arms */}
        {[-1, 1].map((side) => (
          <mesh
            key={`arm-${side}`}
            position={[side * 0.35, 0.85, 0]}
            rotation={[0, 0, side * 0.3]}
            castShadow
          >
            <capsuleGeometry args={[0.06, 0.4, 4, 8]} />
            <meshStandardMaterial
              color={glitchColor1}
              transparent
              opacity={flickerOpacity * 0.9}
              emissive={glitchColor1}
              emissiveIntensity={0.4}
            />
          </mesh>
        ))}

        {/* Legs */}
        {[-1, 1].map((side) => (
          <mesh key={`leg-${side}`} position={[side * 0.12, 0.35, 0]} castShadow>
            <capsuleGeometry args={[0.07, 0.5, 4, 8]} />
            <meshStandardMaterial
              color={glitchColor2}
              transparent
              opacity={flickerOpacity * 0.9}
              emissive={glitchColor2}
              emissiveIntensity={0.4}
            />
          </mesh>
        ))}

        {/* Energy blade */}
        <mesh position={[0.4, 0.7, 0.2]} rotation={[Math.PI / 4, 0, -Math.PI / 6]} castShadow>
          <boxGeometry args={[0.02, 0.6, 0.08]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={flickerOpacity}
            emissive={glitchColor1}
            emissiveIntensity={1}
          />
        </mesh>
      </group>

      {/* Glitch ghost copies */}
      {!invisible && (
        <>
          <mesh position={[0.1, 0.9, 0.05]}>
            <boxGeometry args={[0.4, 0.6, 0.25]} />
            <meshStandardMaterial
              color={glitchColor2}
              transparent
              opacity={0.15}
            />
          </mesh>
          <mesh position={[-0.08, 0.9, -0.03]}>
            <boxGeometry args={[0.4, 0.6, 0.25]} />
            <meshStandardMaterial
              color={glitchColor1}
              transparent
              opacity={0.1}
            />
          </mesh>
        </>
      )}

      {/* Cyan/Magenta glow */}
      <pointLight
        position={[0, 1, 0]}
        color={useAltColor ? glitchColor2 : glitchColor1}
        intensity={invisible ? 0.2 : 0.8}
        distance={3}
      />
    </>
  )
}

// Render Mama Moonbeam - Glowing Space Grandma made of Starlight
function MamaMoonbeamModel({ healingActive, time }: { healingActive: boolean; time: number }) {
  const floatOffset = Math.sin(time * 1.5) * 0.1
  const glowPulse = 0.8 + Math.sin(time * 2) * 0.2

  return (
    <>
      {/* Floating base - starlight particles */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh
          key={`particle-${i}`}
          position={[
            Math.cos(time + i * 1.05) * 0.5,
            0.2 + Math.sin(time * 2 + i) * 0.1,
            Math.sin(time + i * 1.05) * 0.5
          ]}
        >
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#ffdd00" />
        </mesh>
      ))}

      {/* Main body - flowing robe */}
      <mesh position={[0, 0.6 + floatOffset, 0]} castShadow>
        <coneGeometry args={[0.5, 1.2, 8]} />
        <meshStandardMaterial
          color="#ffeecc"
          emissive="#ffdd00"
          emissiveIntensity={glowPulse * 0.3}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Torso */}
      <mesh position={[0, 1.1 + floatOffset, 0]} castShadow>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffdd00"
          emissiveIntensity={glowPulse * 0.4}
        />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.55 + floatOffset, 0]} castShadow>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial
          color="#ffeeee"
          emissive="#ffaa88"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Grandma hair bun */}
      <mesh position={[0, 1.75 + floatOffset, -0.05]} castShadow>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshStandardMaterial
          color="#ddddee"
          emissive="#aaaaff"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Kind eyes */}
      {[-1, 1].map((side) => (
        <mesh key={`eye-${side}`} position={[side * 0.08, 1.58 + floatOffset, 0.18]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial
            color="#4488ff"
            emissive="#4488ff"
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}

      {/* Gentle smile */}
      <mesh position={[0, 1.48 + floatOffset, 0.2]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.06, 0.015, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#ffaaaa" />
      </mesh>

      {/* Arms */}
      {[-1, 1].map((side) => (
        <mesh
          key={`arm-${side}`}
          position={[side * 0.4, 1 + floatOffset, 0]}
          rotation={[0, 0, side * 0.5]}
          castShadow
        >
          <capsuleGeometry args={[0.08, 0.4, 4, 8]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffdd00"
            emissiveIntensity={glowPulse * 0.3}
            transparent
            opacity={0.85}
          />
        </mesh>
      ))}

      {/* Hands */}
      {[-1, 1].map((side) => (
        <mesh
          key={`hand-${side}`}
          position={[side * 0.55, 0.75 + floatOffset, 0.1]}
        >
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial
            color="#ffeeee"
            emissive="#ffdd00"
            emissiveIntensity={0.4}
          />
        </mesh>
      ))}

      {/* Halo */}
      <mesh position={[0, 1.9 + floatOffset, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.25, 0.03, 8, 32]} />
        <meshStandardMaterial
          color="#ffdd00"
          emissive="#ffdd00"
          emissiveIntensity={1}
        />
      </mesh>

      {/* Star decorations on robe */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i * Math.PI / 2) + time * 0.5
        return (
          <mesh
            key={`star-${i}`}
            position={[
              Math.cos(angle) * 0.35,
              0.5 + floatOffset + (i % 2) * 0.3,
              Math.sin(angle) * 0.35
            ]}
          >
            <octahedronGeometry args={[0.05]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffdd00"
              emissiveIntensity={0.8}
            />
          </mesh>
        )
      })}

      {/* Healing ray effect */}
      {healingActive && (
        <mesh position={[0, 0.8 + floatOffset, 0.5]} rotation={[Math.PI / 4, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.3, 2, 8]} />
          <meshStandardMaterial
            color="#88ff88"
            transparent
            opacity={0.4}
            emissive="#00ff00"
            emissiveIntensity={0.5}
          />
        </mesh>
      )}

      {/* Golden/White glow */}
      <pointLight position={[0, 1.2, 0]} color="#ffdd00" intensity={1} distance={5} />
      <pointLight position={[0, 0.5, 0]} color="#ffffff" intensity={0.5} distance={3} />
    </>
  )
}

export function HeroRenderer() {
  const hero = useGameStore((state) => state.hero)
  const meshRef = useRef<THREE.Group>(null)
  const targetIndicatorRef = useRef<THREE.Group>(null)
  const { camera, gl } = useThree()
  const [moveTarget, setMoveTarget] = useState<{ x: number; z: number } | null>(null)
  const [time, setTime] = useState(0)

  // Handle movement - right-click on desktop, two-finger tap or long press on mobile
  useEffect(() => {
    let longPressTimer: ReturnType<typeof setTimeout> | null = null

    const handleMoveToPosition = (clientX: number, clientY: number) => {
      const rect = gl.domElement.getBoundingClientRect()
      const x = ((clientX - rect.left) / rect.width) * 2 - 1
      const y = -((clientY - rect.top) / rect.height) * 2 + 1

      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera)

      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
      const intersection = new THREE.Vector3()

      if (raycaster.ray.intersectPlane(groundPlane, intersection)) {
        HeroMovementSystem.setMoveTarget(intersection.x, intersection.z)
        setMoveTarget({ x: intersection.x, z: intersection.z })
      }
    }

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      handleMoveToPosition(e.clientX, e.clientY)
    }

    // Two-finger tap for mobile movement
    const handleTouchStart = (e: TouchEvent) => {
      // Two-finger tap = move hero
      if (e.touches.length === 2) {
        e.preventDefault()
        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2
        handleMoveToPosition(midX, midY)
        return
      }

      // Long press on single touch = move hero
      if (e.touches.length === 1) {
        longPressTimer = setTimeout(() => {
          handleMoveToPosition(e.touches[0].clientX, e.touches[0].clientY)
        }, 500)
      }
    }

    const handleTouchEnd = () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer)
        longPressTimer = null
      }
    }

    const handleTouchMove = () => {
      // Cancel long press if finger moves
      if (longPressTimer) {
        clearTimeout(longPressTimer)
        longPressTimer = null
      }
    }

    gl.domElement.addEventListener('contextmenu', handleContextMenu)
    gl.domElement.addEventListener('touchstart', handleTouchStart, { passive: false })
    gl.domElement.addEventListener('touchend', handleTouchEnd)
    gl.domElement.addEventListener('touchmove', handleTouchMove)

    return () => {
      gl.domElement.removeEventListener('contextmenu', handleContextMenu)
      gl.domElement.removeEventListener('touchstart', handleTouchStart)
      gl.domElement.removeEventListener('touchend', handleTouchEnd)
      gl.domElement.removeEventListener('touchmove', handleTouchMove)
      if (longPressTimer) clearTimeout(longPressTimer)
    }
  }, [camera, gl])

  useFrame((_, delta) => {
    if (!meshRef.current || !hero) return

    // Update time for animations
    setTime((t) => t + delta)

    // Update position from store (this ensures reactivity)
    meshRef.current.position.x = hero.position.x
    meshRef.current.position.z = hero.position.z
    meshRef.current.rotation.y = hero.rotation

    // Update target indicator
    if (targetIndicatorRef.current && moveTarget) {
      targetIndicatorRef.current.position.x = moveTarget.x
      targetIndicatorRef.current.position.z = moveTarget.z

      // Pulse animation
      const scale = 0.8 + Math.sin(Date.now() * 0.005) * 0.2
      targetIndicatorRef.current.scale.setScalar(scale)

      // Clear target when hero stops moving
      if (!hero.isMoving) {
        setMoveTarget(null)
      }
    }
  })

  if (!hero) return null

  const healthPercent = hero.health / hero.maxHealth

  // Get hero-specific colors
  const getHeroColor = (type: HeroType): string => {
    switch (type) {
      case 'captainZara': return '#3366ff'
      case 'professorWobblesworth': return '#9933ff'
      case 'boris': return '#ff6600'
      case 'glitch': return '#00ffff'
      case 'mamaMoonbeam': return '#ffdd00'
      default: return '#3366ff'
    }
  }

  // Check ability states
  const shieldActive = hero.abilities.W.currentCooldown > hero.abilities.W.cooldown - (hero.abilities.W.duration || 0)
  const fortressMode = hero.type === 'boris' && hero.abilities.W.currentCooldown > hero.abilities.W.cooldown - (hero.abilities.W.duration || 0)
  const invisible = hero.type === 'glitch' && hero.abilities.Q.currentCooldown > hero.abilities.Q.cooldown - (hero.abilities.Q.duration || 0)
  const healingActive = hero.type === 'mamaMoonbeam' && hero.abilities.Q.currentCooldown > hero.abilities.Q.cooldown - (hero.abilities.Q.duration || 0)

  const heroColor = getHeroColor(hero.type)

  // Render hero-specific model
  const renderHeroModel = () => {
    switch (hero.type) {
      case 'captainZara':
        return <CaptainZaraModel shieldActive={shieldActive} />
      case 'professorWobblesworth':
        return <ProfessorWobblesworthModel time={time} />
      case 'boris':
        return <BorisModel fortressMode={fortressMode} time={time} />
      case 'glitch':
        return <GlitchModel invisible={invisible} time={time} />
      case 'mamaMoonbeam':
        return <MamaMoonbeamModel healingActive={healingActive} time={time} />
      default:
        return <CaptainZaraModel shieldActive={shieldActive} />
    }
  }

  return (
    <>
      {/* Movement target indicator */}
      {moveTarget && hero.isMoving && (
        <group ref={targetIndicatorRef} position={[moveTarget.x, 0.1, moveTarget.z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.3, 0.5, 32]} />
            <meshBasicMaterial color={heroColor} transparent opacity={0.8} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.1, 0.2, 32]} />
            <meshBasicMaterial color={heroColor} transparent opacity={0.9} />
          </mesh>
        </group>
      )}

      <group
        ref={meshRef}
        position={[hero.position.x, 0, hero.position.z]}
      >
        {/* Hero-specific model */}
        {renderHeroModel()}

        {/* Health bar */}
        <group position={[0, 2.2, 0]}>
          <mesh>
            <planeGeometry args={[1.2, 0.15]} />
            <meshBasicMaterial color="#333333" />
          </mesh>
          <mesh position={[(healthPercent - 1) * 0.6, 0, 0.01]}>
            <planeGeometry args={[healthPercent * 1.2, 0.12]} />
            <meshBasicMaterial color="#00ff00" />
          </mesh>
        </group>

        {/* Selection ring */}
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.8, 1, 32]} />
          <meshBasicMaterial color={heroColor} transparent opacity={0.5} />
        </mesh>

        {/* Attack range indicator (subtle) */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[hero.attackRange - 0.1, hero.attackRange, 32]} />
          <meshBasicMaterial color={heroColor} transparent opacity={0.1} />
        </mesh>
      </group>
    </>
  )
}
