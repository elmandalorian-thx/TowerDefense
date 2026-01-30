import { useGameStore } from '../../stores/gameStore'

export function WaveIndicator() {
  const currentWave = useGameStore((state) => state.currentWave)
  const totalWaves = useGameStore((state) => state.totalWaves)
  const waveInProgress = useGameStore((state) => state.waveInProgress)
  const enemiesRemainingInWave = useGameStore((state) => state.enemiesRemainingInWave)
  const enemies = useGameStore((state) => state.enemies)

  const getStatusText = () => {
    if (currentWave === 0) {
      return 'Preparing...'
    }
    if (waveInProgress) {
      return `Enemies: ${enemies.length} (${enemiesRemainingInWave} remaining)`
    }
    if (currentWave >= totalWaves) {
      return 'All waves complete!'
    }
    return 'Wave complete!'
  }

  return (
    <div className="ui-panel wave-indicator">
      <div className="wave-number">
        Wave {currentWave}/{totalWaves}
      </div>
      <div className="wave-status">{getStatusText()}</div>
    </div>
  )
}
