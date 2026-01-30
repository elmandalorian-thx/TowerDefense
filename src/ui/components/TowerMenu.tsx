import { useGameStore } from '../../stores/gameStore'
import { TowerFactory } from '../../entities/TowerFactory'
import type { TowerType } from '../../types'

const towerTypes: TowerType[] = ['plasmaSpire', 'railCannon', 'novaLauncher']

export function TowerMenu() {
  const currency = useGameStore((state) => state.currency)
  const selectedTowerType = useGameStore((state) => state.selectedTowerType)
  const setSelectedTowerType = useGameStore((state) => state.setSelectedTowerType)

  const handleTowerSelect = (type: TowerType) => {
    if (selectedTowerType === type) {
      setSelectedTowerType(null)
    } else {
      setSelectedTowerType(type)
    }
  }

  return (
    <div className="ui-panel tower-menu">
      {towerTypes.map((type) => {
        const config = TowerFactory.getConfig(type)
        if (!config) return null

        const canAfford = currency >= config.stats.cost
        const isSelected = selectedTowerType === type

        return (
          <button
            key={type}
            className={`tower-button ${isSelected ? 'selected' : ''} ${!canAfford ? 'disabled' : ''}`}
            onClick={() => canAfford && handleTowerSelect(type)}
            title={config.description}
          >
            <div
              className="tower-icon"
              style={{ backgroundColor: config.stats.color }}
            />
            <span className="tower-name">{config.name}</span>
            <span className="tower-cost">${config.stats.cost}</span>
          </button>
        )
      })}
    </div>
  )
}
