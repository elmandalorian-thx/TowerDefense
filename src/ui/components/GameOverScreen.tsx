import { useGameStore } from '../../stores/gameStore'

export function GameOverScreen() {
  const gameState = useGameStore((state) => state.gameState)
  const score = useGameStore((state) => state.score)
  const resetGame = useGameStore((state) => state.resetGame)

  const isWon = gameState === 'won'

  return (
    <div className="game-over-overlay">
      <div className="game-over-panel">
        <h1 className={`game-over-title ${isWon ? 'won' : 'lost'}`}>
          {isWon ? 'VICTORY!' : 'DEFEAT'}
        </h1>
        <p className="game-over-score">Final Score: {score}</p>
        <button className="restart-button" onClick={resetGame}>
          Play Again
        </button>
      </div>
    </div>
  )
}
