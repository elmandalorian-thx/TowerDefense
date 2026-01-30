import { useGameStore } from '../../stores/gameStore'

export function HUD() {
  const currency = useGameStore((state) => state.currency)
  const lives = useGameStore((state) => state.lives)
  const maxLives = useGameStore((state) => state.maxLives)
  const score = useGameStore((state) => state.score)

  return (
    <div className="ui-panel hud">
      <div className="hud-stat">
        <div className="hud-icon currency">$</div>
        <span className="hud-value">{currency}</span>
      </div>

      <div className="hud-stat">
        <div className="hud-icon lives">♥</div>
        <span className="hud-value">
          {lives}/{maxLives}
        </span>
      </div>

      <div className="hud-stat">
        <div className="hud-icon score">★</div>
        <span className="hud-value">{score}</span>
      </div>
    </div>
  )
}
