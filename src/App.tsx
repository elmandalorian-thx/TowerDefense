import { Suspense, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Game } from './core/Game'
import { HUD } from './ui/components/HUD'
import { TowerMenu } from './ui/components/TowerMenu'
import { HeroPanel } from './ui/components/HeroPanel'
import { WaveIndicator } from './ui/components/WaveIndicator'
import { GameOverScreen } from './ui/components/GameOverScreen'
import { useGameStore } from './stores/gameStore'
import './ui/styles/ui.css'

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <h1 className="loading-title">COSMIC CHAOS</h1>
        <p className="loading-subtitle">Tower Defense</p>
        <div className="loading-spinner" />
        <p className="loading-text">Loading...</p>
      </div>
    </div>
  )
}

export default function App() {
  const gameState = useGameStore((state) => state.gameState)

  // Prevent context menu on the whole app for better right-click experience
  useEffect(() => {
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }
    document.addEventListener('contextmenu', preventContextMenu)
    return () => document.removeEventListener('contextmenu', preventContextMenu)
  }, [])

  // Prevent pinch-zoom on mobile for better game experience
  useEffect(() => {
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault()
      }
    }
    document.addEventListener('touchmove', preventZoom, { passive: false })
    return () => document.removeEventListener('touchmove', preventZoom)
  }, [])

  return (
    <div className="game-container">
      <Suspense fallback={<LoadingScreen />}>
        <Canvas
          camera={{ position: [0, 15, 15], fov: 60 }}
          shadows
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          dpr={[1, 2]}
        >
          <color attach="background" args={['#0a0a1a']} />
          <fog attach="fog" args={['#0a0a1a', 30, 60]} />
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[10, 20, 10]}
            intensity={1}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          <hemisphereLight
            color="#6666ff"
            groundColor="#331144"
            intensity={0.3}
          />
          <OrbitControls
            maxPolarAngle={Math.PI / 2.5}
            minDistance={10}
            maxDistance={40}
            enablePan={false}
            touches={{ ONE: 0, TWO: 2 }}
          />
          <Game />
        </Canvas>
      </Suspense>

      {/* UI Overlay */}
      <HUD />
      <TowerMenu />
      <HeroPanel />
      <WaveIndicator />
      {(gameState === 'won' || gameState === 'lost') && <GameOverScreen />}
    </div>
  )
}
