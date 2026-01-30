import { useMemo } from 'react'
import { Line } from '@react-three/drei'
import { useGameStore } from '../stores/gameStore'
import { TowerFactory } from '../entities/TowerFactory'
import type { TowerSpot } from '../types'

export function MapRenderer() {
  const path = useGameStore((state) => state.path)
  const towerSpots = useGameStore((state) => state.towerSpots)
  const selectedTowerType = useGameStore((state) => state.selectedTowerType)
  const hoveredSpotId = useGameStore((state) => state.hoveredSpotId)

  return (
    <group>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* Grid overlay */}
      <gridHelper args={[30, 30, '#333355', '#222244']} position={[0, 0.01, 0]} />

      {/* Path */}
      <PathVisualization path={path} />

      {/* Tower spots */}
      {towerSpots.map((spot) => (
        <TowerSpotMesh
          key={spot.id}
          spot={spot}
          isSelected={selectedTowerType !== null && !spot.occupied}
          isHovered={hoveredSpotId === spot.id}
        />
      ))}

      {/* Base */}
      {path.length > 0 && (
        <group position={[path[path.length - 1].x, 0, path[path.length - 1].z]}>
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[2, 1, 2]} />
            <meshStandardMaterial color="#4444ff" emissive="#2222aa" emissiveIntensity={0.5} />
          </mesh>
          <pointLight position={[0, 2, 0]} color="#4444ff" intensity={2} distance={8} />
        </group>
      )}

      {/* Spawn point */}
      {path.length > 0 && (
        <group position={[path[0].x, 0, path[0].z]}>
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[1, 1, 0.5, 6]} />
            <meshStandardMaterial color="#ff4444" emissive="#aa2222" emissiveIntensity={0.5} />
          </mesh>
        </group>
      )}
    </group>
  )
}

function PathVisualization({ path }: { path: { x: number; y: number; z: number }[] }) {
  const linePoints = useMemo(() => {
    return path.map((p) => [p.x, 0.05, p.z] as [number, number, number])
  }, [path])

  if (path.length < 2) return null

  return (
    <group>
      {/* Path line */}
      <Line points={linePoints} color="#ff6666" lineWidth={2} />

      {/* Path surface */}
      {path.slice(0, -1).map((point, i) => {
        const next = path[i + 1]
        const dx = next.x - point.x
        const dz = next.z - point.z
        const length = Math.sqrt(dx * dx + dz * dz)
        const angle = Math.atan2(dx, dz)
        const midX = (point.x + next.x) / 2
        const midZ = (point.z + next.z) / 2

        return (
          <mesh
            key={i}
            position={[midX, 0.02, midZ]}
            rotation={[-Math.PI / 2, 0, -angle]}
          >
            <planeGeometry args={[1.5, length]} />
            <meshStandardMaterial
              color="#332222"
              transparent
              opacity={0.6}
            />
          </mesh>
        )
      })}
    </group>
  )
}

function TowerSpotMesh({
  spot,
  isSelected,
  isHovered,
}: {
  spot: TowerSpot
  isSelected: boolean
  isHovered: boolean
}) {
  const setHoveredSpotId = useGameStore((state) => state.setHoveredSpotId)
  const selectedTowerType = useGameStore((state) => state.selectedTowerType)
  const addTower = useGameStore((state) => state.addTower)
  const occupyTowerSpot = useGameStore((state) => state.occupyTowerSpot)
  const spendCurrency = useGameStore((state) => state.spendCurrency)

  const handleClick = () => {
    if (spot.occupied || !selectedTowerType) return

    const cost = TowerFactory.getCost(selectedTowerType)
    if (spendCurrency(cost)) {
      const tower = TowerFactory.create(selectedTowerType, spot.position)
      addTower(tower)
      occupyTowerSpot(spot.id)
    }
  }

  const color = spot.occupied
    ? '#444444'
    : isHovered && isSelected
    ? '#66ff66'
    : isSelected
    ? '#44aa44'
    : '#666666'

  return (
    <group position={[spot.position.x, 0, spot.position.z]}>
      <mesh
        position={[0, 0.1, 0]}
        onClick={handleClick}
        onPointerEnter={() => setHoveredSpotId(spot.id)}
        onPointerLeave={() => setHoveredSpotId(null)}
      >
        <cylinderGeometry args={[1, 1, 0.2, 8]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={spot.occupied ? 0.3 : 0.7}
        />
      </mesh>
    </group>
  )
}
