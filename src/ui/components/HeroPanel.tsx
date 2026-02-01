import { useGameStore } from '../../stores/gameStore'
import type { AbilityKey } from '../../types'

const abilityIcons: Record<AbilityKey, string> = {
  Q: '💥',
  W: '🛡️',
  R: '☄️',
}

const abilityColors: Record<AbilityKey, string> = {
  Q: '#ff00ff',
  W: '#00aaff',
  R: '#ffaa00',
}

export function HeroPanel() {
  const hero = useGameStore((state) => state.hero)
  const gameState = useGameStore((state) => state.gameState)

  if (!hero) return null

  const healthPercent = (hero.health / hero.maxHealth) * 100

  const handleAbilityClick = (key: AbilityKey) => {
    if (gameState !== 'playing') return
    const ability = hero.abilities[key]
    if (ability.currentCooldown <= 0) {
      window.dispatchEvent(new CustomEvent('heroAbility', { detail: { key } }))
    }
  }

  return (
    <div className="ui-panel hero-panel">
      <div className="hero-header">
        <div className="hero-portrait">⚔️</div>
        <div className="hero-info">
          <h3>{hero.name}</h3>
          <div className="hero-health-bar">
            <div
              className="hero-health-fill"
              style={{ width: `${healthPercent}%` }}
            />
            <span className="hero-health-text">
              {Math.round(hero.health)} / {hero.maxHealth}
            </span>
          </div>
        </div>
      </div>

      <div className="hero-abilities">
        {(['Q', 'W', 'R'] as AbilityKey[]).map((key) => {
          const ability = hero.abilities[key]
          const isOnCooldown = ability.currentCooldown > 0
          const cooldownPercent = isOnCooldown
            ? (ability.currentCooldown / ability.cooldown) * 100
            : 0

          return (
            <button
              key={key}
              className={`ability-button ${isOnCooldown ? 'on-cooldown' : 'ready'}`}
              title={`${ability.name}: ${ability.description}`}
              onClick={() => handleAbilityClick(key)}
              style={{
                '--ability-color': abilityColors[key],
                '--cooldown-percent': `${cooldownPercent}%`,
              } as React.CSSProperties}
            >
              <div className="ability-icon">{abilityIcons[key]}</div>
              <span className="ability-key">{key}</span>
              <span className="ability-name">{ability.name.split(' ')[0]}</span>
              {isOnCooldown && (
                <>
                  <div
                    className="ability-cooldown-overlay"
                    style={{ height: `${cooldownPercent}%` }}
                  />
                  <div className="ability-cooldown-text">
                    {Math.ceil(ability.currentCooldown)}
                  </div>
                </>
              )}
              {!isOnCooldown && <div className="ability-ready-glow" />}
            </button>
          )
        })}
      </div>

      <div className="hero-controls-hint">
        Right-click to move • Q/W/R for abilities
      </div>
    </div>
  )
}
