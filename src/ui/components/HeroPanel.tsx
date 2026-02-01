import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import { useGameStore } from '../../stores/gameStore'
import { AbilityButton } from './AbilityButton'
import { Tooltip, AbilityTooltipContent } from './Tooltip'
import { playUISound } from '../../core/AudioManager'
import type { AbilityKey, HeroType } from '../../types'

const abilityIcons: Record<AbilityKey, string> = {
  Q: '(((o)))',
  W: '[O]',
  R: '*',
}

// Hero-specific portrait icons
export const heroPortraitIcons: Record<HeroType, string> = {
  captainZara: 'X',
  professorWobblesworth: '@',
  boris: '#',
  glitch: '%',
  mamaMoonbeam: '*',
}

// Hero-specific colors
export const heroColors: Record<HeroType, string> = {
  captainZara: '#3366ff',
  professorWobblesworth: '#9933ff',
  boris: '#ff6600',
  glitch: '#00ffff',
  mamaMoonbeam: '#ffdd00',
}

const abilityColors: Record<AbilityKey, string> = {
  Q: '#ff00ff',
  W: '#00aaff',
  R: '#ffaa00',
}

interface SmoothHealthBarProps {
  health: number
  maxHealth: number
}

function SmoothHealthBar({ health, maxHealth }: SmoothHealthBarProps) {
  const [displayHealth, setDisplayHealth] = useState(health)
  const [isDecreasing, setIsDecreasing] = useState(false)
  const prevHealth = useRef(health)
  const healthPercent = (health / maxHealth) * 100

  const springHealth = useSpring(health, {
    stiffness: 80,
    damping: 15,
  })

  // Note: useTransform creates reactive value for display percentage (kept for potential future animation)
  void useTransform(springHealth, (value) => (value / maxHealth) * 100)

  useEffect(() => {
    const unsubscribe = springHealth.on('change', (latest) => {
      setDisplayHealth(Math.round(latest))
    })
    return () => unsubscribe()
  }, [springHealth])

  useEffect(() => {
    springHealth.set(health)

    if (health < prevHealth.current) {
      setIsDecreasing(true)
      setTimeout(() => setIsDecreasing(false), 500)
    }

    prevHealth.current = health
  }, [health, springHealth])

  // Determine health bar color based on percentage
  const getHealthColor = () => {
    if (healthPercent > 60) return 'linear-gradient(90deg, #44ff44, #00cc00)'
    if (healthPercent > 30) return 'linear-gradient(90deg, #ffcc00, #ff9900)'
    return 'linear-gradient(90deg, #ff4444, #cc0000)'
  }

  const getHealthGlow = () => {
    if (healthPercent > 60) return '0 0 10px rgba(68, 255, 68, 0.5)'
    if (healthPercent > 30) return '0 0 10px rgba(255, 204, 0, 0.5)'
    return '0 0 10px rgba(255, 68, 68, 0.5)'
  }

  return (
    <div className="hero-health-bar" style={{ position: 'relative' }}>
      {/* Background damage flash */}
      <AnimatePresence>
        {isDecreasing && (
          <motion.div
            initial={{ opacity: 0.8, width: `${(prevHealth.current / maxHealth) * 100}%` }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              background: 'linear-gradient(90deg, #ff6666, #ff4444)',
              borderRadius: '7px',
            }}
          />
        )}
      </AnimatePresence>

      {/* Main health fill */}
      <motion.div
        className="hero-health-fill"
        style={{
          width: `${healthPercent}%`,
          background: getHealthColor(),
          boxShadow: getHealthGlow(),
        }}
        animate={{
          width: `${healthPercent}%`,
        }}
        transition={{
          duration: 0.3,
          ease: 'easeOut',
        }}
      />

      {/* Low health pulse effect */}
      <AnimatePresence>
        {healthPercent <= 30 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              position: 'absolute',
              inset: -2,
              borderRadius: '9px',
              border: '2px solid #ff4444',
              boxShadow: '0 0 10px #ff444480',
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      <motion.span
        className="hero-health-text"
        animate={isDecreasing ? { scale: [1, 1.1, 1] } : undefined}
        transition={{ duration: 0.3 }}
      >
        {displayHealth} / {maxHealth}
      </motion.span>
    </div>
  )
}

export function HeroPanel() {
  const hero = useGameStore((state) => state.hero)
  const gameState = useGameStore((state) => state.gameState)

  if (!hero) return null

  const handleAbilityUse = (key: AbilityKey) => {
    if (gameState !== 'playing') return
    const ability = hero.abilities[key]
    if (ability.currentCooldown <= 0) {
      playUISound('click')
      window.dispatchEvent(new CustomEvent('heroAbility', { detail: { key } }))
    } else {
      playUISound('error')
    }
  }

  return (
    <motion.div
      className="ui-panel hero-panel"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.3 }}
      style={{ position: 'relative' }}
    >
      {/* Holographic scanline effect */}
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
            '0 0 20px rgba(51, 102, 255, 0.15)',
            '0 0 30px rgba(100, 150, 255, 0.2)',
            '0 0 20px rgba(51, 102, 255, 0.15)',
          ],
        }}
        transition={{
          duration: 3,
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

      <div className="hero-header">
        <motion.div
          className="hero-portrait"
          style={{
            background: `linear-gradient(135deg, ${heroColors[hero.type]}, ${heroColors[hero.type]}88)`,
          }}
          animate={{
            boxShadow: [
              `0 0 15px ${heroColors[hero.type]}50`,
              `0 0 25px ${heroColors[hero.type]}80`,
              `0 0 15px ${heroColors[hero.type]}50`,
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <span role="img" aria-label="hero">{heroPortraitIcons[hero.type]}</span>
        </motion.div>
        <div className="hero-info">
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {hero.name}
          </motion.h3>
          <SmoothHealthBar health={hero.health} maxHealth={hero.maxHealth} />
        </div>
      </div>

      <div className="hero-abilities" style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        {(['Q', 'W', 'R'] as AbilityKey[]).map((key, index) => {
          const ability = hero.abilities[key]

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
            >
              <Tooltip
                content={
                  <AbilityTooltipContent
                    name={ability.name}
                    description={ability.description}
                    cooldown={ability.cooldown}
                    damage={ability.damage}
                    radius={ability.radius}
                    duration={ability.duration}
                    color={abilityColors[key]}
                  />
                }
                position="top"
                delay={300}
              >
                <div>
                  <AbilityButton
                    abilityKey={key}
                    ability={ability}
                    icon={abilityIcons[key]}
                    color={abilityColors[key]}
                    disabled={gameState !== 'playing'}
                    onUse={handleAbilityUse}
                  />
                </div>
              </Tooltip>
            </motion.div>
          )
        })}
      </div>

      <motion.div
        className="hero-controls-hint"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 0.8 }}
      >
        Right-click to move | Q/W/R for abilities
      </motion.div>
    </motion.div>
  )
}
