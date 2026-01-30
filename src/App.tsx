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

export default function App() {
  const gameState = useGameStore((state) => state.gameState)

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 15, 15], fov: 60 }}
        shadows
      >
        <color attach="background" args={['#0a0a1a']} />
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <OrbitControls
          maxPolarAngle={Math.PI / 2.5}
          minDistance={10}
          maxDistance={40}
        />
        <Game />
      </Canvas>

      {/* UI Overlay */}
      <HUD />
      <TowerMenu />
      <HeroPanel />
      <WaveIndicator />
      {(gameState === 'won' || gameState === 'lost') && <GameOverScreen />}
    </div>
  )
}
