import { motion, AnimatePresence } from 'framer-motion'
import { useState, useCallback } from 'react'
import type { Ability, AbilityKey } from '../../types'

interface AbilityButtonProps {
  abilityKey: AbilityKey
  ability: Ability
  icon: string
  color: string
  disabled?: boolean
  onUse: (key: AbilityKey) => void
}

export function AbilityButton({
  abilityKey,
  ability,
  icon,
  color,
  disabled = false,
  onUse,
}: AbilityButtonProps) {
  const [isPressed, setIsPressed] = useState(false)

  const isOnCooldown = ability.currentCooldown > 0
  const cooldownPercent = isOnCooldown
    ? (ability.currentCooldown / ability.cooldown) * 100
    : 0
  const isReady = !isOnCooldown && !disabled

  const handleClick = useCallback(() => {
    if (isReady) {
      setIsPressed(true)
      onUse(abilityKey)
      setTimeout(() => setIsPressed(false), 150)
    }
  }, [isReady, abilityKey, onUse])

  // Calculate circular progress for cooldown sweep
  const circumference = 2 * Math.PI * 28 // radius = 28
  const strokeDashoffset = circumference * (1 - cooldownPercent / 100)

  return (
    <motion.button
      className={`ability-button-animated ${isOnCooldown ? 'on-cooldown' : 'ready'}`}
      onClick={handleClick}
      disabled={disabled || isOnCooldown}
      whileHover={isReady ? { scale: 1.05, y: -2 } : undefined}
      whileTap={isReady ? { scale: 0.95 } : undefined}
      animate={isPressed ? { scale: [1, 0.9, 1.1, 1] } : undefined}
      transition={{ duration: 0.2 }}
      style={{
        '--ability-color': color,
        position: 'relative',
        width: '70px',
        height: '70px',
        background: isOnCooldown
          ? 'rgba(30, 30, 50, 0.9)'
          : 'rgba(30, 30, 60, 0.9)',
        border: `2px solid ${isOnCooldown ? 'rgba(80, 80, 80, 0.5)' : color}`,
        borderRadius: '12px',
        cursor: isReady ? 'pointer' : 'not-allowed',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2px',
        padding: '4px',
        color: '#fff',
        opacity: disabled ? 0.5 : 1,
      } as React.CSSProperties}
    >
      {/* Ready glow pulse effect */}
      <AnimatePresence>
        {isReady && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.02, 1],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              position: 'absolute',
              inset: -2,
              background: `radial-gradient(ellipse at center, ${color}40 0%, transparent 70%)`,
              borderRadius: '12px',
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      {/* Circular cooldown sweep */}
      {isOnCooldown && (
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            transform: 'rotate(-90deg)',
            pointerEvents: 'none',
          }}
        >
          <circle
            cx="35"
            cy="35"
            r="28"
            fill="none"
            stroke="rgba(0, 0, 0, 0.6)"
            strokeWidth="32"
          />
          <motion.circle
            cx="35"
            cy="35"
            r="28"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: 0 }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.1, ease: 'linear' }}
            style={{ filter: `drop-shadow(0 0 4px ${color})` }}
          />
        </svg>
      )}

      {/* Cooldown overlay */}
      <AnimatePresence>
        {isOnCooldown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      {/* Icon */}
      <motion.div
        animate={isReady ? { scale: [1, 1.1, 1] } : undefined}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          fontSize: '20px',
          lineHeight: 1,
          zIndex: 1,
          filter: isOnCooldown ? 'grayscale(0.5)' : 'none',
        }}
      >
        {icon}
      </motion.div>

      {/* Key binding */}
      <div
        style={{
          position: 'absolute',
          top: '4px',
          left: '4px',
          fontSize: '11px',
          fontWeight: 'bold',
          background: 'rgba(0, 0, 0, 0.6)',
          padding: '1px 6px',
          borderRadius: '4px',
          zIndex: 2,
        }}
      >
        {abilityKey}
      </div>

      {/* Ability name */}
      <div
        style={{
          fontSize: '9px',
          opacity: isOnCooldown ? 0.5 : 0.8,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          zIndex: 1,
        }}
      >
        {ability.name.split(' ')[0]}
      </div>

      {/* Cooldown timer */}
      <AnimatePresence>
        {isOnCooldown && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '20px',
              fontWeight: 'bold',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
              zIndex: 3,
            }}
          >
            {Math.ceil(ability.currentCooldown)}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Press flash effect */}
      <AnimatePresence>
        {isPressed && (
          <motion.div
            initial={{ opacity: 1, scale: 0.8 }}
            animate={{ opacity: 0, scale: 1.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(circle at center, ${color}80 0%, transparent 70%)`,
              pointerEvents: 'none',
              zIndex: 4,
            }}
          />
        )}
      </AnimatePresence>
    </motion.button>
  )
}
