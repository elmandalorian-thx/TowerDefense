import { useGameStore } from '../../stores/gameStore'
import { TowerFactory } from '../../entities/TowerFactory'
import { getTierNumber } from '../../entities/Tower'
import type { TowerUpgrade, TowerTier } from '../../types'

export function TowerUpgradeMenu() {
  const selectedTowerId = useGameStore((state) => state.selectedTowerId)
  const towers = useGameStore((state) => state.towers)
  const currency = useGameStore((state) => state.currency)
  const upgradeTower = useGameStore((state) => state.upgradeTower)
  const sellTower = useGameStore((state) => state.sellTower)
  const setSelectedTowerId = useGameStore((state) => state.setSelectedTowerId)

  // Find the selected tower
  const tower = towers.find((t) => t.id === selectedTowerId)

  if (!tower) return null

  const config = TowerFactory.getConfig(tower.type)
  if (!config) return null

  const availableUpgrades = TowerFactory.getAvailableUpgrades(tower)
  const displayName = TowerFactory.getTowerDisplayName(tower)
  const color = TowerFactory.getTowerColor(tower)
  const sellValue = TowerFactory.getSellValue(tower)
  const tierNum = getTierNumber(tower.tier)

  const handleUpgrade = (targetTier: TowerTier) => {
    upgradeTower(tower.id, targetTier)
  }

  const handleSell = () => {
    sellTower(tower.id)
  }

  const handleClose = () => {
    setSelectedTowerId(null)
  }

  return (
    <div className="ui-panel tower-upgrade-menu">
      <button className="close-button" onClick={handleClose}>X</button>

      {/* Tower Info Header */}
      <div className="tower-info-header">
        <div className="tower-icon-large" style={{ backgroundColor: color }} />
        <div className="tower-details">
          <h3 className="tower-title">{displayName}</h3>
          <div className="tower-tier">Tier {tierNum}</div>
        </div>
      </div>

      {/* Tower Stats */}
      <div className="tower-stats">
        <div className="stat-row">
          <span className="stat-label">Damage:</span>
          <span className="stat-value">{Math.round(tower.damage)}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Range:</span>
          <span className="stat-value">{tower.range.toFixed(1)}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Fire Rate:</span>
          <span className="stat-value">{tower.fireRate.toFixed(2)}/s</span>
        </div>
        {tower.splashRadius && (
          <div className="stat-row">
            <span className="stat-label">Splash:</span>
            <span className="stat-value">{tower.splashRadius.toFixed(1)}</span>
          </div>
        )}
        {tower.specialEffect !== 'none' && (
          <div className="stat-row special">
            <span className="stat-label">Effect:</span>
            <span className="stat-value">{formatEffectName(tower.specialEffect)}</span>
          </div>
        )}
      </div>

      {/* Upgrade Options */}
      {availableUpgrades.length > 0 && (
        <div className="upgrade-section">
          <h4 className="section-title">
            {tower.tier === 3 ? 'Choose Upgrade Path' : 'Upgrade Available'}
          </h4>
          <div className={`upgrade-options ${tower.tier === 3 ? 'branching' : ''}`}>
            {availableUpgrades.map((upgrade) => (
              <UpgradeButton
                key={upgrade.tier}
                upgrade={upgrade}
                canAfford={currency >= upgrade.cost}
                isBranching={tower.tier === 3}
                onClick={() => handleUpgrade(upgrade.tier)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Max Tier Message */}
      {availableUpgrades.length === 0 && (
        <div className="max-tier-message">
          Maximum tier reached!
        </div>
      )}

      {/* Sell Button */}
      <div className="sell-section">
        <button className="sell-button" onClick={handleSell}>
          Sell for ${sellValue}
        </button>
        <span className="invested-label">Invested: ${tower.totalInvested}</span>
      </div>
    </div>
  )
}

interface UpgradeButtonProps {
  upgrade: TowerUpgrade
  canAfford: boolean
  isBranching: boolean
  onClick: () => void
}

function UpgradeButton({ upgrade, canAfford, isBranching, onClick }: UpgradeButtonProps) {
  const pathLabel = upgrade.tier === '4A' ? 'Path A' : upgrade.tier === '4B' ? 'Path B' : null

  return (
    <button
      className={`upgrade-button ${!canAfford ? 'disabled' : ''} ${isBranching ? 'branch-option' : ''}`}
      onClick={() => canAfford && onClick()}
      disabled={!canAfford}
    >
      {pathLabel && <div className="path-label">{pathLabel}</div>}
      <div className="upgrade-name">{upgrade.name}</div>
      <div className="upgrade-description">{upgrade.description}</div>
      <div className="upgrade-cost" style={{ color: canAfford ? '#ffd700' : '#ff4444' }}>
        ${upgrade.cost}
      </div>
      {upgrade.specialEffect && upgrade.specialEffect !== 'none' && (
        <div className="upgrade-effect">Special: {formatEffectName(upgrade.specialEffect)}</div>
      )}
    </button>
  )
}

function formatEffectName(effect: string): string {
  // Convert camelCase to readable format
  return effect
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
}
