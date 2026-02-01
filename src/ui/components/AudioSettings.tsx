import { useState, useCallback, useEffect } from 'react'
import { AudioManager, VolumeSettings, playUISound } from '../../core/AudioManager'

interface AudioSettingsProps {
  isOpen: boolean
  onClose: () => void
}

export function AudioSettings({ isOpen, onClose }: AudioSettingsProps) {
  const [volumes, setVolumes] = useState<VolumeSettings>({
    master: 0.7,
    sfx: 0.8,
    music: 0.5,
    ambient: 0.4,
  })
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    // Load current volumes from AudioManager
    setVolumes(AudioManager.getVolumes())
    setIsMuted(AudioManager.isMuted())
  }, [isOpen])

  const handleVolumeChange = useCallback((key: keyof VolumeSettings, value: number) => {
    setVolumes(prev => ({ ...prev, [key]: value }))

    switch (key) {
      case 'master':
        AudioManager.setMasterVolume(value)
        break
      case 'sfx':
        AudioManager.setSfxVolume(value)
        break
      case 'music':
        AudioManager.setMusicVolume(value)
        break
      case 'ambient':
        AudioManager.setAmbientVolume(value)
        break
    }
  }, [])

  const handleMuteToggle = useCallback(() => {
    const newMuted = !isMuted
    setIsMuted(newMuted)
    AudioManager.mute(newMuted)
    if (!newMuted) {
      playUISound('click')
    }
  }, [isMuted])

  const handleTestSound = useCallback(() => {
    playUISound('click')
  }, [])

  const handleClose = useCallback(() => {
    playUISound('click')
    onClose()
  }, [onClose])

  if (!isOpen) return null

  return (
    <div className="audio-settings-overlay" onClick={handleClose}>
      <div className="audio-settings-panel" onClick={e => e.stopPropagation()}>
        <div className="audio-settings-header">
          <h2>Audio Settings</h2>
          <button className="audio-close-btn" onClick={handleClose}>
            X
          </button>
        </div>

        <div className="audio-settings-content">
          <div className="audio-mute-row">
            <button
              className={`mute-button ${isMuted ? 'muted' : ''}`}
              onClick={handleMuteToggle}
            >
              {isMuted ? 'UNMUTE ALL' : 'MUTE ALL'}
            </button>
          </div>

          <VolumeSlider
            label="Master Volume"
            value={volumes.master}
            onChange={(v) => handleVolumeChange('master', v)}
            disabled={isMuted}
          />

          <VolumeSlider
            label="Sound Effects"
            value={volumes.sfx}
            onChange={(v) => handleVolumeChange('sfx', v)}
            disabled={isMuted}
          />

          <VolumeSlider
            label="Music"
            value={volumes.music}
            onChange={(v) => handleVolumeChange('music', v)}
            disabled={isMuted}
          />

          <VolumeSlider
            label="Ambient"
            value={volumes.ambient}
            onChange={(v) => handleVolumeChange('ambient', v)}
            disabled={isMuted}
          />

          <div className="audio-test-row">
            <button className="test-sound-btn" onClick={handleTestSound} disabled={isMuted}>
              Test Sound
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface VolumeSliderProps {
  label: string
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}

function VolumeSlider({ label, value, onChange, disabled }: VolumeSliderProps) {
  const percentage = Math.round(value * 100)

  return (
    <div className={`volume-slider-row ${disabled ? 'disabled' : ''}`}>
      <label className="volume-label">{label}</label>
      <div className="volume-slider-container">
        <input
          type="range"
          min="0"
          max="100"
          value={percentage}
          onChange={(e) => onChange(Number(e.target.value) / 100)}
          className="volume-slider"
          disabled={disabled}
        />
        <span className="volume-value">{percentage}%</span>
      </div>
    </div>
  )
}

// Audio toggle button for HUD
export function AudioToggleButton() {
  const [isMuted, setIsMuted] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    setIsMuted(AudioManager.isMuted())
  }, [])

  const handleToggleMute = useCallback(() => {
    const newMuted = !isMuted
    setIsMuted(newMuted)
    AudioManager.mute(newMuted)
    if (!newMuted) {
      playUISound('click')
    }
  }, [isMuted])

  const handleOpenSettings = useCallback(() => {
    playUISound('click')
    setShowSettings(true)
  }, [])

  return (
    <>
      <div className="audio-toggle-container">
        <button
          className={`audio-toggle-btn ${isMuted ? 'muted' : ''}`}
          onClick={handleToggleMute}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
        <button
          className="audio-settings-btn"
          onClick={handleOpenSettings}
          title="Audio Settings"
        >
          ⚙
        </button>
      </div>
      <AudioSettings isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  )
}
