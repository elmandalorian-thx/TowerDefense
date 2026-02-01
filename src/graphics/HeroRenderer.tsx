import { useRef, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../stores/gameStore'
import { HeroMovementSystem } from '../systems/HeroMovementSystem'

export function HeroRenderer() {
  const hero = useGameStore((state) => state.hero)
  const meshRef = useRef<THREE.Group>(null)
  const targetIndicatorRef = useRef<THREE.Group>(null)
  const { camera, gl } = useThree()
  const [moveTarget, setMoveTarget] = useState<{ x: number; z: number } | null>(null)

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

  useFrame(() => {
    if (!meshRef.current || !hero) return

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

  // Check if any ability is active (for visual effects)
  const shieldActive = hero.abilities.W.currentCooldown > hero.abilities.W.cooldown - (hero.abilities.W.duration || 0)

  return (
    <>
      {/* Movement target indicator */}
      {moveTarget && hero.isMoving && (
        <group ref={targetIndicatorRef} position={[moveTarget.x, 0.1, moveTarget.z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.3, 0.5, 32]} />
            <meshBasicMaterial color="#00ff88" transparent opacity={0.8} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.1, 0.2, 32]} />
            <meshBasicMaterial color="#00ffaa" transparent opacity={0.9} />
          </mesh>
        </group>
      )}

      <group
        ref={meshRef}
        position={[hero.position.x, 0, hero.position.z]}
      >
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
        <meshBasicMaterial color="#3366ff" transparent opacity={0.5} />
      </mesh>

      {/* Point light for glow */}
      <pointLight position={[0, 1, 0]} color="#3366ff" intensity={0.5} distance={3} />

      {/* Attack range indicator (subtle) */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[hero.attackRange - 0.1, hero.attackRange, 32]} />
        <meshBasicMaterial color="#3366ff" transparent opacity={0.1} />
      </mesh>
    </group>
    </>
  )
}
