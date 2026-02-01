import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useCallback } from 'react'

export type FloatingTextType = 'damage' | 'gold' | 'heal' | 'critical' | 'miss'

export interface FloatingTextData {
  id: string
  x: number
  y: number
  text: string
  type: FloatingTextType
  amount?: number
}

const typeColors: Record<FloatingTextType, string> = {
  damage: '#ff4466',
  gold: '#ffd700',
  heal: '#44ff88',
  critical: '#ff00ff',
  miss: '#888888',
}

const typeGlow: Record<FloatingTextType, string> = {
  damage: '0 0 10px #ff4466, 0 0 20px #ff446680',
  gold: '0 0 10px #ffd700, 0 0 20px #ffd70080',
  heal: '0 0 10px #44ff88, 0 0 20px #44ff8880',
  critical: '0 0 15px #ff00ff, 0 0 30px #ff00ff80, 0 0 45px #ff00ff40',
  miss: '0 0 5px #888888',
}

// Scale based on amount - bigger numbers get bigger text
function getScale(amount: number | undefined, type: FloatingTextType): number {
  if (!amount) return 1
  if (type === 'gold') {
    if (amount >= 100) return 1.5
    if (amount >= 50) return 1.3
    if (amount >= 25) return 1.15
    return 1
  }
  if (type === 'damage' || type === 'heal') {
    if (amount >= 200) return 1.6
    if (amount >= 100) return 1.4
    if (amount >= 50) return 1.2
    return 1
  }
  if (type === 'critical') return 1.5
  return 1
}

function FloatingTextItem({ data, onComplete }: { data: FloatingTextData; onComplete: (id: string) => void }) {
  const scale = getScale(data.amount, data.type)
  const color = typeColors[data.type]
  const glow = typeGlow[data.type]

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete(data.id)
    }, 1200)
    return () => clearTimeout(timer)
  }, [data.id, onComplete])

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 0,
        scale: scale * 0.5,
        x: Math.random() * 20 - 10
      }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: -80,
        scale: [scale * 0.5, scale * 1.2, scale, scale * 0.8],
      }}
      transition={{
        duration: 1.2,
        ease: [0.25, 0.46, 0.45, 0.94],
        opacity: { times: [0, 0.1, 0.7, 1] },
        scale: { times: [0, 0.15, 0.3, 1] },
      }}
      style={{
        position: 'absolute',
        left: data.x,
        top: data.y,
        pointerEvents: 'none',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        fontWeight: 'bold',
        fontSize: `${16 * scale}px`,
        color: color,
        textShadow: glow,
        whiteSpace: 'nowrap',
        zIndex: 1000,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {data.type === 'gold' && '+'}
      {data.type === 'heal' && '+'}
      {data.text}
    </motion.div>
  )
}

export function FloatingText() {
  const [texts, setTexts] = useState<FloatingTextData[]>([])

  const handleRemove = useCallback((id: string) => {
    setTexts(prev => prev.filter(t => t.id !== id))
  }, [])

  useEffect(() => {
    const handleFloatingText = (event: CustomEvent<FloatingTextData>) => {
      setTexts(prev => [...prev, event.detail])
    }

    window.addEventListener('floatingText', handleFloatingText as EventListener)
    return () => {
      window.removeEventListener('floatingText', handleFloatingText as EventListener)
    }
  }, [])

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <AnimatePresence>
        {texts.map(text => (
          <FloatingTextItem key={text.id} data={text} onComplete={handleRemove} />
        ))}
      </AnimatePresence>
    </div>
  )
}

// Helper function to dispatch floating text events
export function showFloatingText(
  x: number,
  y: number,
  text: string,
  type: FloatingTextType,
  amount?: number
) {
  const event = new CustomEvent<FloatingTextData>('floatingText', {
    detail: {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      x,
      y,
      text,
      type,
      amount,
    },
  })
  window.dispatchEvent(event)
}
