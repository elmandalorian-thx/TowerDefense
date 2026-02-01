import { useState } from 'react'
import { useGameStore } from '../../stores/gameStore'
import { HeroFactory } from '../../entities/HeroFactory'
import type { HeroType } from '../../types'

interface HeroInfo {
  type: HeroType
  name: string
  role: string
  description: string
  color: string
  icon: string
}

const heroData: HeroInfo[] = [
  {
    type: 'captainZara',
    name: 'Captain Zara',
    role: 'Fighter',
    description: 'Battle-hardened space marine with devastating abilities',
    color: '#3366ff',
    icon: '⚔️'
  },
  {
    type: 'professorWobblesworth',
    name: 'Professor Wobblesworth III',
    role: 'Support Mage',
    description: 'Brain-octopus scientist with gravity manipulation',
    color: '#9933ff',
    icon: '🧠'
  },
  {
    type: 'boris',
    name: 'B.O.R.I.S.',
    role: 'Tank',
    description: 'Chunky Soviet mech with friendly smiley face',
    color: '#ff6600',
    icon: '🤖'
  },
  {
    type: 'glitch',
    name: 'Glitch the Unstable',
    role: 'Assassin',
    description: 'Corrupted hologram ninja, flickering between dimensions',
    color: '#00ffff',
    icon: '👤'
  },
  {
    type: 'mamaMoonbeam',
    name: 'Mama Moonbeam',
    role: 'Healer',
    description: 'Benevolent space grandma made of pure starlight',
    color: '#ffdd00',
    icon: '✨'
  }
]

export function HeroSelector() {
  const hero = useGameStore((state) => state.hero)
  const gameState = useGameStore((state) => state.gameState)
  const setHero = useGameStore((state) => state.setHero)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedHero, setSelectedHero] = useState<HeroType>(hero?.type || 'captainZara')

  // Only show when game is playing and hero exists
  if (gameState !== 'playing' || !hero) return null

  const currentHeroInfo = heroData.find(h => h.type === hero.type)

  const handleHeroSelect = (type: HeroType) => {
    setSelectedHero(type)
  }

  const handleConfirmSelection = () => {
    if (selectedHero !== hero.type) {
      // Create new hero of selected type at current position
      const newHero = HeroFactory.create(selectedHero, hero.position)
      setHero(newHero)
    }
    setIsOpen(false)
  }

  const selectedHeroInfo = heroData.find(h => h.type === selectedHero)

  return (
    <>
      {/* Toggle Button */}
      <button
        className="hero-selector-toggle"
        onClick={() => setIsOpen(!isOpen)}
        style={{ '--hero-color': currentHeroInfo?.color || '#3366ff' } as React.CSSProperties}
      >
        <span className="hero-selector-icon">{currentHeroInfo?.icon}</span>
        <span className="hero-selector-label">Switch Hero</span>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="hero-selector-overlay" onClick={() => setIsOpen(false)}>
          <div className="hero-selector-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="hero-selector-title">Select Your Hero</h2>

            <div className="hero-selector-grid">
              {heroData.map((heroInfo) => (
                <button
                  key={heroInfo.type}
                  className={`hero-selector-card ${selectedHero === heroInfo.type ? 'selected' : ''}`}
                  onClick={() => handleHeroSelect(heroInfo.type)}
                  style={{ '--hero-color': heroInfo.color } as React.CSSProperties}
                >
                  <div className="hero-card-icon">{heroInfo.icon}</div>
                  <div className="hero-card-name">{heroInfo.name}</div>
                  <div className="hero-card-role">{heroInfo.role}</div>
                  {hero.type === heroInfo.type && (
                    <div className="hero-card-current">Current</div>
                  )}
                </button>
              ))}
            </div>

            {/* Selected Hero Details */}
            {selectedHeroInfo && (
              <div className="hero-selector-details" style={{ '--hero-color': selectedHeroInfo.color } as React.CSSProperties}>
                <div className="hero-details-header">
                  <span className="hero-details-icon">{selectedHeroInfo.icon}</span>
                  <div>
                    <h3>{selectedHeroInfo.name}</h3>
                    <span className="hero-details-role">{selectedHeroInfo.role}</span>
                  </div>
                </div>
                <p className="hero-details-description">{selectedHeroInfo.description}</p>

                {/* Stats preview */}
                <div className="hero-details-stats">
                  {(() => {
                    const config = HeroFactory.getConfig(selectedHero)
                    if (!config) return null
                    return (
                      <>
                        <div className="hero-stat">
                          <span className="hero-stat-label">HP</span>
                          <span className="hero-stat-value">{config.stats.maxHealth}</span>
                        </div>
                        <div className="hero-stat">
                          <span className="hero-stat-label">DMG</span>
                          <span className="hero-stat-value">{config.stats.damage}</span>
                        </div>
                        <div className="hero-stat">
                          <span className="hero-stat-label">SPD</span>
                          <span className="hero-stat-value">{config.stats.speed}</span>
                        </div>
                        <div className="hero-stat">
                          <span className="hero-stat-label">RNG</span>
                          <span className="hero-stat-value">{config.stats.attackRange}</span>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="hero-selector-actions">
              <button className="hero-selector-cancel" onClick={() => setIsOpen(false)}>
                Cancel
              </button>
              <button
                className="hero-selector-confirm"
                onClick={handleConfirmSelection}
                disabled={selectedHero === hero.type}
              >
                {selectedHero === hero.type ? 'Already Selected' : 'Confirm Selection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
