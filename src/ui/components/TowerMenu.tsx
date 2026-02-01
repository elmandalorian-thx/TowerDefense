import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../stores/gameStore'
import { TowerFactory } from '../../entities/TowerFactory'
import { Tooltip, TowerTooltipContent } from './Tooltip'
import { playUISound } from '../../core/AudioManager'
import type { TowerType } from '../../types'

const towerTypes: TowerType[] = ['plasmaSpire', 'railCannon', 'novaLauncher']

interface TowerButtonProps {
  type: TowerType
  isSelected: boolean
  canAfford: boolean
  onSelect: (type: TowerType) => void
}

function TowerButton({ type, isSelected, canAfford, onSelect }: TowerButtonProps) {
  const config = TowerFactory.getConfig(type)
  if (!config) return null

  const handleClick = () => {
    if (canAfford) {
      playUISound('click')
      onSelect(type)
    } else {
      playUISound('error')
    }
  }

  const handleHover = () => {
    if (canAfford) {
      playUISound('hover')
    }
  }

  return (
    <Tooltip
      content={
        <TowerTooltipContent
          name={config.name}
          description={config.description}
          damage={config.stats.damage}
          range={config.stats.range}
          fireRate={config.stats.fireRate}
          cost={config.stats.cost}
          color={config.stats.color}
        />
      }
      position="top"
      delay={400}
    >
      <motion.button
        className={`tower-button ${isSelected ? 'selected' : ''} ${!canAfford ? 'disabled' : ''}`}
        onClick={handleClick}
        onMouseEnter={handleHover}
        whileHover={canAfford ? { scale: 1.08, y: -6 } : undefined}
        whileTap={canAfford ? { scale: 0.95 } : undefined}
        animate={{
          borderColor: isSelected ? '#44ff44' : canAfford ? 'rgba(100, 100, 255, 0.3)' : 'rgba(80, 80, 80, 0.3)',
          boxShadow: isSelected
            ? '0 0 20px rgba(68, 255, 68, 0.5), 0 0 40px rgba(68, 255, 68, 0.3), inset 0 0 20px rgba(68, 255, 68, 0.1)'
            : canAfford
            ? '0 4px 12px rgba(0, 0, 0, 0.3)'
            : '0 2px 6px rgba(0, 0, 0, 0.2)',
        }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Selection glow effect */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(ellipse at center, rgba(68, 255, 68, 0.3) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />
          )}
        </AnimatePresence>

        {/* Hover shimmer effect */}
        <motion.div
          initial={{ x: '-100%', opacity: 0 }}
          whileHover={canAfford ? { x: '100%', opacity: 0.3 } : undefined}
          transition={{ duration: 0.6 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
            pointerEvents: 'none',
          }}
        />

        {/* Tower icon with glow */}
        <motion.div
          className="tower-icon"
          style={{
            backgroundColor: config.stats.color,
            boxShadow: `0 0 ${isSelected ? '15px' : '8px'} ${config.stats.color}80`,
          }}
          animate={{
            boxShadow: isSelected
              ? [
                  `0 0 15px ${config.stats.color}80`,
                  `0 0 25px ${config.stats.color}a0`,
                  `0 0 15px ${config.stats.color}80`,
                ]
              : `0 0 8px ${config.stats.color}60`,
          }}
          transition={{
            duration: 1.5,
            repeat: isSelected ? Infinity : 0,
            ease: 'easeInOut',
          }}
        />

        <span className="tower-name">{config.name}</span>

        <motion.span
          className="tower-cost"
          animate={{
            color: canAfford ? '#ffd700' : '#ff4444',
            textShadow: canAfford
              ? '0 0 8px rgba(255, 215, 0, 0.5)'
              : '0 0 8px rgba(255, 68, 68, 0.5)',
          }}
        >
          ${config.stats.cost}
        </motion.span>

        {/* Cannot afford overlay */}
        <AnimatePresence>
          {!canAfford && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0, 0, 0, 0.3) 4px, rgba(0, 0, 0, 0.3) 8px)',
                pointerEvents: 'none',
              }}
            />
          )}
        </AnimatePresence>
      </motion.button>
    </Tooltip>
  )
}

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
    <motion.div
      className="ui-panel tower-menu"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
      style={{ position: 'relative' }}
    >
      {/* Scanline effect */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '8px',
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(100, 100, 255, 0.02) 2px, rgba(100, 100, 255, 0.02) 4px)',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      />

      {/* Ambient glow */}
      <motion.div
        animate={{
          boxShadow: [
            '0 0 20px rgba(100, 100, 255, 0.1)',
            '0 0 30px rgba(255, 100, 255, 0.15)',
            '0 0 20px rgba(100, 100, 255, 0.1)',
          ],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          inset: -2,
          borderRadius: '10px',
          zIndex: -1,
        }}
      />

      {towerTypes.map((type, index) => {
        const config = TowerFactory.getConfig(type)
        if (!config) return null

        const canAfford = currency >= config.stats.cost
        const isSelected = selectedTowerType === type

        return (
          <motion.div
            key={type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
          >
            <TowerButton
              type={type}
              isSelected={isSelected}
              canAfford={canAfford}
              onSelect={handleTowerSelect}
            />
          </motion.div>
        )
      })}
    </motion.div>
  )
}
