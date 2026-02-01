import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useCallback } from 'react'

interface GoldPopupData {
  id: string
  x: number
  y: number
  amount: number
}

function GoldPopupItem({ data, onComplete }: { data: GoldPopupData; onComplete: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete(data.id)
    }, 1500)
    return () => clearTimeout(timer)
  }, [data.id, onComplete])

  // Generate coin particles
  const coinCount = Math.min(Math.ceil(data.amount / 10), 8)
  const coins = Array.from({ length: coinCount }, (_, i) => ({
    id: i,
    angle: (360 / coinCount) * i + Math.random() * 30 - 15,
    distance: 30 + Math.random() * 20,
    delay: i * 0.05,
  }))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'absolute',
        left: data.x,
        top: data.y,
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    >
      {/* Coin particles */}
      {coins.map(coin => {
        const radians = (coin.angle * Math.PI) / 180
        const targetX = Math.cos(radians) * coin.distance
        const targetY = Math.sin(radians) * coin.distance

        return (
          <motion.div
            key={coin.id}
            initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
            animate={{
              scale: [0, 1.2, 1, 0.8],
              x: [0, targetX * 0.5, targetX],
              y: [0, targetY * 0.5 - 20, targetY - 40],
              opacity: [1, 1, 1, 0],
            }}
            transition={{
              duration: 0.8,
              delay: coin.delay,
              ease: 'easeOut',
            }}
            style={{
              position: 'absolute',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ffd700 0%, #ffaa00 50%, #cc8800 100%)',
              boxShadow: '0 0 8px #ffd700, 0 0 16px #ffd70080, inset -2px -2px 4px rgba(0,0,0,0.3)',
              transform: 'translate(-50%, -50%)',
            }}
          />
        )
      })}

      {/* Main gold text */}
      <motion.div
        initial={{ scale: 0.5, y: 10, opacity: 0 }}
        animate={{
          scale: [0.5, 1.3, 1],
          y: [10, -30, -60],
          opacity: [0, 1, 1, 0],
        }}
        transition={{
          duration: 1.2,
          times: [0, 0.2, 0.5, 1],
          ease: 'easeOut',
        }}
        style={{
          position: 'absolute',
          transform: 'translate(-50%, -50%)',
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          fontWeight: 'bold',
          fontSize: data.amount >= 50 ? '24px' : data.amount >= 25 ? '20px' : '16px',
          color: '#ffd700',
          textShadow: '0 0 10px #ffd700, 0 0 20px #ffaa00, 0 2px 4px rgba(0,0,0,0.5)',
          whiteSpace: 'nowrap',
        }}
      >
        +{data.amount}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1] }}
          transition={{ delay: 0.1, duration: 0.3 }}
          style={{
            marginLeft: '4px',
            fontSize: '14px',
          }}
        >
          $
        </motion.span>
      </motion.div>

      {/* Glow ring */}
      <motion.div
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{
          scale: [0.3, 1.5, 2.5],
          opacity: [0, 0.6, 0],
        }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          border: '2px solid #ffd700',
          boxShadow: '0 0 20px #ffd700, inset 0 0 20px #ffd70040',
          transform: 'translate(-50%, -50%)',
        }}
      />
    </motion.div>
  )
}

export function GoldPopup() {
  const [popups, setPopups] = useState<GoldPopupData[]>([])

  const handleRemove = useCallback((id: string) => {
    setPopups(prev => prev.filter(p => p.id !== id))
  }, [])

  useEffect(() => {
    const handleGoldPopup = (event: CustomEvent<Omit<GoldPopupData, 'id'>>) => {
      const newPopup: GoldPopupData = {
        ...event.detail,
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      }
      setPopups(prev => [...prev, newPopup])
    }

    window.addEventListener('goldPopup', handleGoldPopup as EventListener)
    return () => {
      window.removeEventListener('goldPopup', handleGoldPopup as EventListener)
    }
  }, [])

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <AnimatePresence>
        {popups.map(popup => (
          <GoldPopupItem key={popup.id} data={popup} onComplete={handleRemove} />
        ))}
      </AnimatePresence>
    </div>
  )
}

// Helper function to show gold popup
export function showGoldPopup(x: number, y: number, amount: number) {
  const event = new CustomEvent('goldPopup', {
    detail: { x, y, amount },
  })
  window.dispatchEvent(event)
}
