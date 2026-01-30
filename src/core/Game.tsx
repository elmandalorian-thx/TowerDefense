import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { MapRenderer } from '../graphics/MapRenderer'
import { EnemyRenderer } from '../graphics/EnemyRenderer'
import { TowerRenderer } from '../graphics/TowerRenderer'
import { ProjectileRenderer } from '../graphics/ProjectileRenderer'
import { HeroRenderer } from '../graphics/HeroRenderer'
import { GameManager } from './GameManager'
import { useGameStore } from '../stores/gameStore'

export function Game() {
  const gameManagerRef = useRef<GameManager | null>(null)
  const gameState = useGameStore((state) => state.gameState)

  useEffect(() => {
    gameManagerRef.current = new GameManager()
    gameManagerRef.current.initialize()

    return () => {
      gameManagerRef.current?.cleanup()
    }
  }, [])

  useFrame((_, delta) => {
    if (gameState === 'playing' && gameManagerRef.current) {
      gameManagerRef.current.update(delta)
    }
  })

  return (
    <>
      <MapRenderer />
      <EnemyRenderer />
      <TowerRenderer />
      <ProjectileRenderer />
      <HeroRenderer />
    </>
  )
}
