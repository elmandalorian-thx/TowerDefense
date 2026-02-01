import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useCallback } from 'react'

interface WaveAnnouncementData {
  wave: number
  isBossWave: boolean
  title?: string
}

export function WaveAnnouncement() {
  const [announcement, setAnnouncement] = useState<WaveAnnouncementData | null>(null)
  const [isShaking, setIsShaking] = useState(false)

  const handleDismiss = useCallback(() => {
    setAnnouncement(null)
    setIsShaking(false)
  }, [])

  useEffect(() => {
    const handleWaveAnnouncement = (event: CustomEvent<WaveAnnouncementData>) => {
      setAnnouncement(event.detail)
      if (event.detail.isBossWave) {
        setIsShaking(true)
      }
      // Auto dismiss after animation
      setTimeout(handleDismiss, 2500)
    }

    window.addEventListener('waveAnnouncement', handleWaveAnnouncement as EventListener)
    return () => {
      window.removeEventListener('waveAnnouncement', handleWaveAnnouncement as EventListener)
    }
  }, [handleDismiss])

  const isBoss = announcement?.isBossWave ?? false

  return (
    <AnimatePresence>
      {announcement && (
        <>
          {/* Screen shake effect for boss waves */}
          {isShaking && (
            <motion.div
              initial={{ x: 0, y: 0 }}
              animate={{
                x: [0, -8, 8, -6, 6, -4, 4, -2, 2, 0],
                y: [0, 4, -4, 3, -3, 2, -2, 1, -1, 0],
              }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{
                position: 'fixed',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 9998,
              }}
            />
          )}

          {/* Red tint overlay for boss waves */}
          {isBoss && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.4, 0.2, 0.3, 0] }}
              transition={{ duration: 2, ease: 'easeOut' }}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'radial-gradient(circle at center, rgba(255,0,50,0.4) 0%, rgba(100,0,20,0.6) 100%)',
                pointerEvents: 'none',
                zIndex: 9999,
              }}
            />
          )}

          {/* Main announcement */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              zIndex: 10000,
            }}
          >
            <motion.div
              initial={{ scale: 0.3, opacity: 0, rotateX: -90 }}
              animate={{ scale: 1, opacity: 1, rotateX: 0 }}
              exit={{ scale: 1.5, opacity: 0, y: -100 }}
              transition={{
                duration: 0.6,
                ease: [0.34, 1.56, 0.64, 1] as const,
              }}
              style={{
                textAlign: 'center',
                perspective: '1000px',
              }}
            >
              {/* Subtitle */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: isBoss ? '#ff4444' : '#00ffff',
                  textTransform: 'uppercase',
                  letterSpacing: '8px',
                  marginBottom: '8px',
                  textShadow: isBoss
                    ? '0 0 20px #ff0000, 0 0 40px #ff000080'
                    : '0 0 20px #00ffff, 0 0 40px #00ffff80',
                  fontFamily: "'Segoe UI', system-ui, sans-serif",
                }}
              >
                {isBoss ? 'BOSS WAVE' : 'INCOMING'}
              </motion.div>

              {/* Main wave number */}
              <motion.div
                initial={{ scale: 2, opacity: 0 }}
                animate={{ scale: [2, 0.9, 1], opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                style={{
                  fontSize: isBoss ? '96px' : '72px',
                  fontWeight: 'bold',
                  color: isBoss ? '#ff2244' : '#ffffff',
                  textTransform: 'uppercase',
                  letterSpacing: '4px',
                  lineHeight: 1,
                  fontFamily: "'Segoe UI', system-ui, sans-serif",
                  textShadow: isBoss
                    ? '0 0 30px #ff0044, 0 0 60px #ff004480, 0 0 90px #ff004440, 0 4px 0 #aa0022'
                    : '0 0 30px #6666ff, 0 0 60px #6666ff80, 0 0 90px #6666ff40, 0 4px 0 #3333aa',
                  WebkitTextStroke: isBoss ? '2px #ff6688' : '2px #8888ff',
                }}
              >
                WAVE {announcement.wave}
              </motion.div>

              {/* Animated glow ring */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{
                  scale: [0.5, 1.5, 2],
                  opacity: [0, 0.8, 0],
                }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '300px',
                  height: '300px',
                  borderRadius: '50%',
                  border: `3px solid ${isBoss ? '#ff4444' : '#6666ff'}`,
                  boxShadow: isBoss
                    ? '0 0 40px #ff4444, inset 0 0 40px #ff444440'
                    : '0 0 40px #6666ff, inset 0 0 40px #6666ff40',
                  pointerEvents: 'none',
                  zIndex: -1,
                }}
              />

              {/* Boss subtitle */}
              {isBoss && announcement.title && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#ffaa00',
                    marginTop: '12px',
                    textShadow: '0 0 15px #ffaa00, 0 0 30px #ffaa0080',
                    fontFamily: "'Segoe UI', system-ui, sans-serif",
                  }}
                >
                  {announcement.title}
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Helper function to show wave announcement
export function showWaveAnnouncement(wave: number, isBossWave = false, title?: string) {
  const event = new CustomEvent<WaveAnnouncementData>('waveAnnouncement', {
    detail: { wave, isBossWave, title },
  })
  window.dispatchEvent(event)
}
