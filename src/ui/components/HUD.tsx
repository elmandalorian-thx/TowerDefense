import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../../stores/gameStore'

interface AnimatedCounterProps {
  value: number
  prefix?: string
  suffix?: string
  color?: string
  duration?: number
}

function AnimatedCounter({ value, prefix = '', suffix = '', color, duration = 0.5 }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const [isIncreasing, setIsIncreasing] = useState(false)
  const [isDecreasing, setIsDecreasing] = useState(false)
  const prevValue = useRef(value)

  const springValue = useSpring(value, {
    stiffness: 100,
    damping: 20,
    duration: duration * 1000,
  })

  const rounded = useTransform(springValue, Math.round)

  useEffect(() => {
    const unsubscribe = rounded.on('change', (latest) => {
      setDisplayValue(latest)
    })
    return () => unsubscribe()
  }, [rounded])

  useEffect(() => {
    springValue.set(value)

    if (value > prevValue.current) {
      setIsIncreasing(true)
      setIsDecreasing(false)
      setTimeout(() => setIsIncreasing(false), 400)
    } else if (value < prevValue.current) {
      setIsDecreasing(true)
      setIsIncreasing(false)
      setTimeout(() => setIsDecreasing(false), 400)
    }

    prevValue.current = value
  }, [value, springValue])

  return (
    <motion.span
      className="hud-value"
      animate={{
        scale: isIncreasing || isDecreasing ? [1, 1.2, 1] : 1,
        color: isIncreasing
          ? [color || '#ffffff', '#44ff44', color || '#ffffff']
          : isDecreasing
          ? [color || '#ffffff', '#ff4444', color || '#ffffff']
          : color || '#ffffff',
      }}
      transition={{ duration: 0.4 }}
      style={{
        display: 'inline-block',
        textShadow: isIncreasing
          ? '0 0 10px #44ff44'
          : isDecreasing
          ? '0 0 10px #ff4444'
          : 'none',
      }}
    >
      {prefix}
      {displayValue}
      {suffix}
    </motion.span>
  )
}

interface HudStatProps {
  icon: string
  iconClass: string
  value: number
  prefix?: string
  suffix?: string
  maxValue?: number
}

function HudStat({ icon, iconClass, value, prefix = '', suffix = '', maxValue }: HudStatProps) {
  const [isPulsing, setIsPulsing] = useState(false)
  const prevValue = useRef(value)

  useEffect(() => {
    if (value !== prevValue.current) {
      setIsPulsing(true)
      setTimeout(() => setIsPulsing(false), 300)
    }
    prevValue.current = value
  }, [value])

  return (
    <motion.div
      className="hud-stat"
      animate={isPulsing ? { scale: [1, 1.05, 1] } : undefined}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className={`hud-icon ${iconClass}`}
        animate={isPulsing ? {
          boxShadow: [
            '0 0 0px rgba(255, 255, 255, 0)',
            '0 0 15px rgba(255, 255, 255, 0.5)',
            '0 0 0px rgba(255, 255, 255, 0)',
          ],
        } : undefined}
        transition={{ duration: 0.3 }}
      >
        {icon}
      </motion.div>
      <AnimatedCounter
        value={value}
        prefix={prefix}
        suffix={maxValue !== undefined ? `/${maxValue}` : suffix}
      />
    </motion.div>
  )
}

// Warning flash component for low lives
function LowLivesWarning({ lives, maxLives }: { lives: number; maxLives: number }) {
  const isLow = lives <= maxLives * 0.25

  return (
    <AnimatePresence>
      {isLow && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            inset: -4,
            borderRadius: '12px',
            border: '2px solid #ff4444',
            boxShadow: '0 0 20px #ff444480, inset 0 0 20px #ff444440',
            pointerEvents: 'none',
          }}
        />
      )}
    </AnimatePresence>
  )
}

export function HUD() {
  const currency = useGameStore((state) => state.currency)
  const lives = useGameStore((state) => state.lives)
  const maxLives = useGameStore((state) => state.maxLives)
  const score = useGameStore((state) => state.score)

  return (
    <motion.div
      className="ui-panel hud"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{ position: 'relative' }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: 'absolute',
          inset: -1,
          borderRadius: '8px',
          background: 'linear-gradient(135deg, rgba(100, 100, 255, 0.1) 0%, rgba(255, 100, 255, 0.1) 100%)',
          filter: 'blur(4px)',
          zIndex: -1,
        }}
      />

      {/* Low lives warning border */}
      <LowLivesWarning lives={lives} maxLives={maxLives} />

      <HudStat icon="$" iconClass="currency" value={currency} />
      <HudStat icon="♥" iconClass="lives" value={lives} maxValue={maxLives} />
      <HudStat icon="★" iconClass="score" value={score} />
    </motion.div>
  )
}
