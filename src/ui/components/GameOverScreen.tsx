import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useMemo, useRef } from 'react'
import { useGameStore } from '../../stores/gameStore'
import { AudioManager, playUISound } from '../../core/AudioManager'
import type { SoundId } from '../../core/AudioManager'

// Particle component for confetti/defeat effects
interface ParticleProps {
  color: string
  delay: number
  duration: number
  startX: number
  startY: number
  endX: number
  endY: number
  size: number
  rotation?: number
}

function Particle({ color, delay, duration, startX, startY, endX, endY, size, rotation = 0 }: ParticleProps) {
  return (
    <motion.div
      initial={{
        x: startX,
        y: startY,
        opacity: 1,
        scale: 0,
        rotate: 0,
      }}
      animate={{
        x: endX,
        y: endY,
        opacity: [1, 1, 0],
        scale: [0, 1.5, 0.5],
        rotate: rotation,
      }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      style={{
        position: 'absolute',
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
        boxShadow: `0 0 ${size}px ${color}80`,
        pointerEvents: 'none',
      }}
    />
  )
}

// Victory confetti particles
function VictoryParticles() {
  const particles = useMemo(() => {
    const colors = ['#44ff44', '#ffd700', '#00ffff', '#ff66ff', '#ffffff']
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      startX: window.innerWidth / 2 + (Math.random() - 0.5) * 100,
      startY: window.innerHeight / 2,
      endX: Math.random() * window.innerWidth,
      endY: Math.random() * window.innerHeight,
      size: 4 + Math.random() * 8,
      rotation: Math.random() * 720 - 360,
    }))
  }, [])

  return (
    <>
      {particles.map((p) => (
        <Particle key={p.id} {...p} />
      ))}
    </>
  )
}

// Defeat ember particles
function DefeatParticles() {
  const particles = useMemo(() => {
    const colors = ['#ff4444', '#ff6600', '#ff2222', '#cc0000']
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 1,
      duration: 3 + Math.random() * 2,
      startX: Math.random() * window.innerWidth,
      startY: window.innerHeight + 20,
      endX: Math.random() * window.innerWidth,
      endY: -50,
      size: 3 + Math.random() * 6,
      rotation: Math.random() * 360,
    }))
  }, [])

  return (
    <>
      {particles.map((p) => (
        <Particle key={p.id} {...p} />
      ))}
    </>
  )
}

// Animated counter for score
function AnimatedScore({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const duration = 1500
    const steps = 30
    const stepDuration = duration / steps
    const increment = value / steps

    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [value])

  return <span>{displayValue}</span>
}

export function GameOverScreen() {
  const gameState = useGameStore((state) => state.gameState)
  const score = useGameStore((state) => state.score)
  const resetGame = useGameStore((state) => state.resetGame)
  const soundPlayedRef = useRef(false)

  const isWon = gameState === 'won'
  const isVisible = gameState === 'won' || gameState === 'lost'

  // Play game over sound once when visible
  useEffect(() => {
    if (isVisible && !soundPlayedRef.current) {
      soundPlayedRef.current = true
      const soundId: SoundId = isWon ? 'game_over_win' : 'game_over_lose'
      AudioManager.play(soundId)
    } else if (!isVisible) {
      soundPlayedRef.current = false
    }
  }, [isVisible, isWon])

  const handleRestart = () => {
    playUISound('click')
    resetGame()
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="game-over-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            overflow: 'hidden',
          }}
        >
          {/* Background overlay with gradient */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            style={{
              position: 'absolute',
              inset: 0,
              background: isWon
                ? 'radial-gradient(ellipse at center, rgba(0, 50, 0, 0.9) 0%, rgba(0, 0, 0, 0.95) 100%)'
                : 'radial-gradient(ellipse at center, rgba(50, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.95) 100%)',
            }}
          />

          {/* Particles */}
          {isWon ? <VictoryParticles /> : <DefeatParticles />}

          {/* Main panel */}
          <motion.div
            className="game-over-panel"
            initial={{ scale: 0.5, opacity: 0, rotateX: -30 }}
            animate={{ scale: 1, opacity: 1, rotateX: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.6,
              ease: [0.34, 1.56, 0.64, 1],
            }}
            style={{
              background: 'linear-gradient(135deg, rgba(20, 20, 50, 0.98) 0%, rgba(10, 10, 30, 0.98) 100%)',
              border: `2px solid ${isWon ? 'rgba(68, 255, 68, 0.5)' : 'rgba(255, 68, 68, 0.5)'}`,
              borderRadius: '16px',
              padding: '40px 60px',
              textAlign: 'center',
              position: 'relative',
              boxShadow: isWon
                ? '0 0 40px rgba(68, 255, 68, 0.3), inset 0 0 60px rgba(68, 255, 68, 0.1)'
                : '0 0 40px rgba(255, 68, 68, 0.3), inset 0 0 60px rgba(255, 68, 68, 0.1)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {/* Scanline effect */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '16px',
                background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(100, 100, 255, 0.02) 2px, rgba(100, 100, 255, 0.02) 4px)',
                pointerEvents: 'none',
              }}
            />

            {/* Glowing border pulse */}
            <motion.div
              animate={{
                boxShadow: isWon
                  ? [
                      '0 0 20px rgba(68, 255, 68, 0.3)',
                      '0 0 40px rgba(68, 255, 68, 0.5)',
                      '0 0 20px rgba(68, 255, 68, 0.3)',
                    ]
                  : [
                      '0 0 20px rgba(255, 68, 68, 0.3)',
                      '0 0 40px rgba(255, 68, 68, 0.5)',
                      '0 0 20px rgba(255, 68, 68, 0.3)',
                    ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                position: 'absolute',
                inset: -2,
                borderRadius: '18px',
                pointerEvents: 'none',
              }}
            />

            {/* Title */}
            <motion.h1
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              style={{
                fontSize: '56px',
                fontWeight: 'bold',
                marginBottom: '20px',
                fontFamily: "'Segoe UI', system-ui, sans-serif",
                color: isWon ? '#44ff44' : '#ff4444',
                textShadow: isWon
                  ? '0 0 20px #44ff44, 0 0 40px #44ff4480, 0 4px 0 #228822'
                  : '0 0 20px #ff4444, 0 0 40px #ff444480, 0 4px 0 #882222',
                letterSpacing: '4px',
              }}
            >
              {isWon ? 'VICTORY!' : 'DEFEAT'}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              style={{
                fontSize: '16px',
                color: 'rgba(255, 255, 255, 0.6)',
                marginBottom: '24px',
                fontFamily: "'Segoe UI', system-ui, sans-serif",
                letterSpacing: '2px',
                textTransform: 'uppercase',
              }}
            >
              {isWon ? 'The cosmos is safe... for now' : 'The invasion continues'}
            </motion.p>

            {/* Score */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              style={{
                fontSize: '28px',
                color: '#ffd700',
                marginBottom: '32px',
                fontFamily: "'Segoe UI', system-ui, sans-serif",
                fontWeight: 'bold',
                textShadow: '0 0 15px #ffd700, 0 0 30px #ffd70080',
              }}
            >
              Final Score: <AnimatedScore value={score} />
            </motion.div>

            {/* Stars for victory */}
            {isWon && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '16px',
                  marginBottom: '24px',
                }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      delay: 1.3 + i * 0.15,
                      duration: 0.5,
                      ease: [0.34, 1.56, 0.64, 1],
                    }}
                    style={{
                      fontSize: '40px',
                      filter: 'drop-shadow(0 0 10px #ffd700)',
                    }}
                  >
                    *
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Restart button */}
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.4 }}
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(51, 102, 255, 0.6)' }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRestart}
              style={{
                padding: '14px 40px',
                fontSize: '18px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #3366ff, #0033cc)',
                border: '2px solid rgba(100, 150, 255, 0.5)',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
                fontFamily: "'Segoe UI', system-ui, sans-serif",
                textTransform: 'uppercase',
                letterSpacing: '2px',
                boxShadow: '0 0 20px rgba(51, 102, 255, 0.4)',
              }}
            >
              Play Again
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
