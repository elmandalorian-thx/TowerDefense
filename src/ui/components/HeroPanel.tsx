import { useGameStore } from '../../stores/gameStore'
import type { AbilityKey } from '../../types'

export function HeroPanel() {
  const hero = useGameStore((state) => state.hero)

  if (!hero) return null

  const healthPercent = (hero.health / hero.maxHealth) * 100

  return (
    <div className="ui-panel hero-panel">
      <div className="hero-header">
        <div className="hero-portrait">⚔</div>
        <div className="hero-info">
          <h3>{hero.name}</h3>
          <div className="hero-health-bar">
            <div
              className="hero-health-fill"
              style={{ width: `${healthPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="hero-abilities">
        {(['Q', 'W', 'R'] as AbilityKey[]).map((key) => {
          const ability = hero.abilities[key]
          const isOnCooldown = ability.currentCooldown > 0

          return (
            <button
              key={key}
              className={`ability-button ${isOnCooldown ? 'on-cooldown' : ''}`}
              title={`${ability.name}: ${ability.description}`}
            >
              <span className="ability-key">{key}</span>
              {isOnCooldown && (
                <div className="ability-cooldown">
                  {Math.ceil(ability.currentCooldown)}s
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
