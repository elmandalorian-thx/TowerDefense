import { useGameStore } from '../../stores/gameStore'

export function WaveIndicator() {
  const currentWave = useGameStore((state) => state.currentWave)
  const totalWaves = useGameStore((state) => state.totalWaves)
  const waveInProgress = useGameStore((state) => state.waveInProgress)
  const enemiesRemainingInWave = useGameStore((state) => state.enemiesRemainingInWave)
  const enemies = useGameStore((state) => state.enemies)
  const gameState = useGameStore((state) => state.gameState)

  const canStartWave = !waveInProgress && currentWave < totalWaves && gameState === 'playing'

  const getStatusText = () => {
    if (currentWave === 0) {
      return 'Ready to begin!'
    }
    if (waveInProgress) {
      const activeCount = enemies.filter(e => !e.isDead).length
      return `Enemies: ${activeCount} active`
    }
    if (currentWave >= totalWaves) {
      return 'All waves complete!'
    }
    return 'Wave cleared!'
  }

  const handleStartWave = () => {
    window.dispatchEvent(new CustomEvent('startWave'))
  }

  return (
    <div className="ui-panel wave-indicator">
      <div className="wave-number">
        Wave {Math.max(1, currentWave)}/{totalWaves}
      </div>
      <div className="wave-status">{getStatusText()}</div>
      {waveInProgress && (
        <div className="wave-progress">
          <div
            className="wave-progress-fill"
            style={{
              width: `${Math.max(0, 100 - (enemiesRemainingInWave / (currentWave * 5)) * 100)}%`
            }}
          />
        </div>
      )}
      {canStartWave && (
        <button
          className="start-wave-button"
          onClick={handleStartWave}
        >
          {currentWave === 0 ? 'Start Game' : 'Next Wave'}
        </button>
      )}
    </div>
  )
}
