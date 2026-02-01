import { motion, AnimatePresence } from 'framer-motion'
import { useState, useCallback, useRef, useEffect, ReactNode } from 'react'

interface TooltipProps {
  content: ReactNode
  children: ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  maxWidth?: number
}

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 300,
  maxWidth = 250,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<number | null>(null)

  const showTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect()
        let x = rect.left + rect.width / 2
        let y = rect.top

        switch (position) {
          case 'bottom':
            y = rect.bottom
            break
          case 'left':
            x = rect.left
            y = rect.top + rect.height / 2
            break
          case 'right':
            x = rect.right
            y = rect.top + rect.height / 2
            break
        }

        setCoords({ x, y })
        setIsVisible(true)
      }
    }, delay)
  }, [delay, position])

  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }, [])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const getTransformOrigin = () => {
    switch (position) {
      case 'top':
        return 'bottom center'
      case 'bottom':
        return 'top center'
      case 'left':
        return 'right center'
      case 'right':
        return 'left center'
    }
  }

  const getOffset = () => {
    const offset = 12
    switch (position) {
      case 'top':
        return { x: '-50%', y: `calc(-100% - ${offset}px)` }
      case 'bottom':
        return { x: '-50%', y: `${offset}px` }
      case 'left':
        return { x: `calc(-100% - ${offset}px)`, y: '-50%' }
      case 'right':
        return { x: `${offset}px`, y: '-50%' }
    }
  }

  const offset = getOffset()

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        style={{ display: 'inline-block' }}
      >
        {children}
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              left: coords.x,
              top: coords.y,
              transform: `translate(${offset.x}, ${offset.y})`,
              transformOrigin: getTransformOrigin(),
              zIndex: 10000,
              pointerEvents: 'none',
              maxWidth: `${maxWidth}px`,
            }}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(20, 20, 50, 0.98) 0%, rgba(10, 10, 30, 0.98) 100%)',
                border: '1px solid rgba(100, 100, 255, 0.4)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#ffffff',
                fontSize: '13px',
                fontFamily: "'Segoe UI', system-ui, sans-serif",
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5), 0 0 20px rgba(100, 100, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                lineHeight: 1.4,
              }}
            >
              {/* Scanline overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '8px',
                  background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(100, 100, 255, 0.03) 2px, rgba(100, 100, 255, 0.03) 4px)',
                  pointerEvents: 'none',
                }}
              />
              {content}
            </div>

            {/* Arrow */}
            <div
              style={{
                position: 'absolute',
                width: '10px',
                height: '10px',
                background: 'rgba(20, 20, 50, 0.98)',
                border: '1px solid rgba(100, 100, 255, 0.4)',
                transform: 'rotate(45deg)',
                ...(position === 'top' && {
                  bottom: '-5px',
                  left: '50%',
                  marginLeft: '-5px',
                  borderTop: 'none',
                  borderLeft: 'none',
                }),
                ...(position === 'bottom' && {
                  top: '-5px',
                  left: '50%',
                  marginLeft: '-5px',
                  borderBottom: 'none',
                  borderRight: 'none',
                }),
                ...(position === 'left' && {
                  right: '-5px',
                  top: '50%',
                  marginTop: '-5px',
                  borderBottom: 'none',
                  borderLeft: 'none',
                }),
                ...(position === 'right' && {
                  left: '-5px',
                  top: '50%',
                  marginTop: '-5px',
                  borderTop: 'none',
                  borderRight: 'none',
                }),
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Tower-specific tooltip content component
interface TowerTooltipContentProps {
  name: string
  description: string
  damage: number
  range: number
  fireRate: number
  cost: number
  color: string
}

export function TowerTooltipContent({
  name,
  description,
  damage,
  range,
  fireRate,
  cost,
  color,
}: TowerTooltipContentProps) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px',
        }}
      >
        <div
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: color,
            boxShadow: `0 0 10px ${color}80`,
          }}
        />
        <span
          style={{
            fontWeight: 'bold',
            fontSize: '15px',
            color: '#ffffff',
            textShadow: `0 0 10px ${color}80`,
          }}
        >
          {name}
        </span>
      </div>
      <p style={{ margin: '0 0 10px', opacity: 0.8, fontSize: '12px' }}>
        {description}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '12px' }}>
        <div style={{ color: '#ff6666' }}>
          Damage: <span style={{ color: '#fff' }}>{damage}</span>
        </div>
        <div style={{ color: '#66ff66' }}>
          Range: <span style={{ color: '#fff' }}>{range}</span>
        </div>
        <div style={{ color: '#6666ff' }}>
          Fire Rate: <span style={{ color: '#fff' }}>{(1 / fireRate).toFixed(1)}/s</span>
        </div>
        <div style={{ color: '#ffd700' }}>
          Cost: <span style={{ color: '#fff' }}>${cost}</span>
        </div>
      </div>
    </div>
  )
}

// Ability-specific tooltip content component
interface AbilityTooltipContentProps {
  name: string
  description: string
  cooldown: number
  damage?: number
  radius?: number
  duration?: number
  color: string
}

export function AbilityTooltipContent({
  name,
  description,
  cooldown,
  damage,
  radius,
  duration,
  color,
}: AbilityTooltipContentProps) {
  return (
    <div>
      <div
        style={{
          fontWeight: 'bold',
          fontSize: '15px',
          marginBottom: '6px',
          color: color,
          textShadow: `0 0 10px ${color}80`,
        }}
      >
        {name}
      </div>
      <p style={{ margin: '0 0 8px', opacity: 0.85, fontSize: '12px' }}>
        {description}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '11px' }}>
        <span style={{ color: '#ffaa00' }}>
          Cooldown: <span style={{ color: '#fff' }}>{cooldown}s</span>
        </span>
        {damage && (
          <span style={{ color: '#ff6666' }}>
            Damage: <span style={{ color: '#fff' }}>{damage}</span>
          </span>
        )}
        {radius && (
          <span style={{ color: '#66ffff' }}>
            Radius: <span style={{ color: '#fff' }}>{radius}</span>
          </span>
        )}
        {duration && (
          <span style={{ color: '#ff66ff' }}>
            Duration: <span style={{ color: '#fff' }}>{duration}s</span>
          </span>
        )}
      </div>
    </div>
  )
}
