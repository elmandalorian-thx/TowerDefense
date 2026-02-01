// Synthesized audio generator using Web Audio API
// Creates sci-fi sounds procedurally without external audio files

export type SoundType =
  | 'laser'
  | 'explosion'
  | 'zap'
  | 'chord'
  | 'blip'
  | 'fanfare'
  | 'ambient'
  | 'splat'
  | 'powerup'
  | 'error'

export interface SoundParams {
  frequency?: number
  duration?: number
  pitchSweep?: number
  filterFreq?: number
  filterSweep?: number
  attack?: number
  decay?: number
  sustain?: number
  release?: number
  detune?: number
  harmonics?: number[]
  noiseAmount?: number
  reverbTime?: number
}

export class SynthAudio {
  private audioContext: AudioContext | null = null
  private soundCache: Map<string, string> = new Map()

  async initialize(): Promise<void> {
    // Create audio context (handle Safari's webkit prefix)
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioContextClass) {
      this.audioContext = new AudioContextClass()

      // Resume context on user interaction if needed
      if (this.audioContext.state === 'suspended') {
        const resume = () => {
          this.audioContext?.resume()
          document.removeEventListener('click', resume)
          document.removeEventListener('keydown', resume)
        }
        document.addEventListener('click', resume)
        document.addEventListener('keydown', resume)
      }
    }
  }

  async generateSound(type: SoundType, params: SoundParams = {}): Promise<string> {
    // Check cache first
    const cacheKey = `${type}_${JSON.stringify(params)}`
    const cached = this.soundCache.get(cacheKey)
    if (cached) return cached

    if (!this.audioContext) {
      await this.initialize()
    }

    if (!this.audioContext) {
      throw new Error('AudioContext not available')
    }

    let audioBuffer: AudioBuffer

    switch (type) {
      case 'laser':
        audioBuffer = await this.generateLaser(params)
        break
      case 'explosion':
        audioBuffer = await this.generateExplosion(params)
        break
      case 'zap':
        audioBuffer = await this.generateZap(params)
        break
      case 'chord':
        audioBuffer = await this.generateChord(params)
        break
      case 'blip':
        audioBuffer = await this.generateBlip(params)
        break
      case 'fanfare':
        audioBuffer = await this.generateFanfare(params)
        break
      case 'ambient':
        audioBuffer = await this.generateAmbient(params)
        break
      case 'splat':
        audioBuffer = await this.generateSplat(params)
        break
      case 'powerup':
        audioBuffer = await this.generatePowerup(params)
        break
      case 'error':
        audioBuffer = await this.generateError(params)
        break
      default:
        audioBuffer = await this.generateBlip(params)
    }

    // Convert to data URL
    const dataUrl = await this.bufferToDataUrl(audioBuffer)
    this.soundCache.set(cacheKey, dataUrl)

    return dataUrl
  }

  // Laser: Saw wave with pitch sweep down (for tower firing)
  private async generateLaser(params: SoundParams): Promise<AudioBuffer> {
    const ctx = this.audioContext!
    const duration = params.duration || 0.15
    const startFreq = params.frequency || 880
    const endFreq = startFreq * (params.pitchSweep || 0.3)
    const sampleRate = ctx.sampleRate
    const length = Math.floor(duration * sampleRate)

    const buffer = ctx.createBuffer(1, length, sampleRate)
    const data = buffer.getChannelData(0)

    let phase = 0
    for (let i = 0; i < length; i++) {
      // Calculate time and progress for audio synthesis
      void (i / sampleRate) // time in seconds (unused but kept for reference)
      const progress = i / length

      // Frequency sweep
      const freq = startFreq + (endFreq - startFreq) * progress

      // Sawtooth oscillator
      phase += freq / sampleRate
      if (phase > 1) phase -= 1
      const saw = 2 * phase - 1

      // Add some harmonics for richness
      const detune = params.detune || 5
      const phase2 = (phase * (1 + detune / 100)) % 1
      const saw2 = 2 * phase2 - 1

      // Envelope (quick attack, exponential decay)
      const attack = params.attack || 0.01
      const attackSamples = attack * sampleRate
      let envelope = 1
      if (i < attackSamples) {
        envelope = i / attackSamples
      } else {
        envelope = Math.exp(-3 * (i - attackSamples) / length)
      }

      data[i] = ((saw * 0.7 + saw2 * 0.3) * envelope) * 0.5
    }

    return buffer
  }

  // Explosion: White noise with lowpass filter sweep
  private async generateExplosion(params: SoundParams): Promise<AudioBuffer> {
    const ctx = this.audioContext!
    const duration = params.duration || 0.5
    const sampleRate = ctx.sampleRate
    const length = Math.floor(duration * sampleRate)

    const buffer = ctx.createBuffer(1, length, sampleRate)
    const data = buffer.getChannelData(0)

    // Generate white noise
    const noiseBuffer = new Float32Array(length)
    for (let i = 0; i < length; i++) {
      noiseBuffer[i] = Math.random() * 2 - 1
    }

    // Simple lowpass filter
    const startFilterFreq = params.filterFreq || 8000
    const filterSweep = params.filterSweep || 0.05
    let filtered = 0

    for (let i = 0; i < length; i++) {
      const progress = i / length

      // Sweep filter from high to low
      const filterFreq = startFilterFreq * Math.pow(filterSweep, progress)
      const dt = 1 / sampleRate
      const rc = 1 / (2 * Math.PI * filterFreq)
      const alpha = dt / (rc + dt)

      filtered = filtered + alpha * (noiseBuffer[i] - filtered)

      // Add some low frequency rumble
      const rumble = Math.sin(2 * Math.PI * 60 * i / sampleRate) * 0.3

      // Envelope
      const attack = 0.01
      const attackSamples = attack * sampleRate
      let envelope = 1
      if (i < attackSamples) {
        envelope = i / attackSamples
      } else {
        envelope = Math.exp(-4 * progress)
      }

      data[i] = ((filtered + rumble * (1 - progress)) * envelope) * 0.6
    }

    return buffer
  }

  // Zap: Quick frequency sweep with slight distortion
  private async generateZap(params: SoundParams): Promise<AudioBuffer> {
    const ctx = this.audioContext!
    const duration = params.duration || 0.1
    const startFreq = params.frequency || 2000
    const sampleRate = ctx.sampleRate
    const length = Math.floor(duration * sampleRate)

    const buffer = ctx.createBuffer(1, length, sampleRate)
    const data = buffer.getChannelData(0)

    let phase = 0
    for (let i = 0; i < length; i++) {
      const progress = i / length

      // Exponential frequency sweep down
      const freq = startFreq * Math.pow(0.1, progress)

      // Square wave with some sine blending
      phase += freq / sampleRate
      if (phase > 1) phase -= 1
      const square = phase < 0.5 ? 1 : -1
      const sine = Math.sin(2 * Math.PI * phase)

      // Mix and slight distortion
      let sample = square * 0.6 + sine * 0.4
      sample = Math.tanh(sample * 1.5)

      // Quick envelope
      const envelope = Math.exp(-8 * progress)

      data[i] = sample * envelope * 0.5
    }

    return buffer
  }

  // Chord: Multiple frequencies with reverb (for abilities)
  private async generateChord(params: SoundParams): Promise<AudioBuffer> {
    const ctx = this.audioContext!
    const duration = params.duration || 0.6
    const baseFreq = params.frequency || 220
    const sampleRate = ctx.sampleRate
    const length = Math.floor(duration * sampleRate)

    // Chord frequencies (minor chord with added 9th for sci-fi feel)
    const harmonics = params.harmonics || [1, 1.2, 1.5, 2, 2.25]

    const buffer = ctx.createBuffer(2, length, sampleRate)
    const dataL = buffer.getChannelData(0)
    const dataR = buffer.getChannelData(1)

    const phases = harmonics.map(() => 0)

    for (let i = 0; i < length; i++) {
      // Progress through the audio buffer (unused but kept for reference)
      void (i / length)

      let sampleL = 0
      let sampleR = 0

      for (let h = 0; h < harmonics.length; h++) {
        const freq = baseFreq * harmonics[h]
        phases[h] += freq / sampleRate
        if (phases[h] > 1) phases[h] -= 1

        // Sine with slight detune for stereo width
        const detuneAmount = 0.003 * (h % 2 === 0 ? 1 : -1)
        const sineL = Math.sin(2 * Math.PI * phases[h])
        const sineR = Math.sin(2 * Math.PI * (phases[h] + detuneAmount))

        // Higher harmonics are quieter
        const harmVolume = 1 / (h + 1)
        sampleL += sineL * harmVolume
        sampleR += sineR * harmVolume
      }

      // ADSR envelope
      const attack = params.attack || 0.05
      const decay = params.decay || 0.1
      const sustain = params.sustain || 0.6
      const release = params.release || 0.3

      let envelope = 0
      const attackEnd = attack
      const decayEnd = attack + decay
      const sustainEnd = duration - release

      const t = i / sampleRate
      if (t < attackEnd) {
        envelope = t / attack
      } else if (t < decayEnd) {
        envelope = 1 - (1 - sustain) * ((t - attackEnd) / decay)
      } else if (t < sustainEnd) {
        envelope = sustain
      } else {
        envelope = sustain * (1 - (t - sustainEnd) / release)
      }

      // Normalize and apply envelope
      const norm = 1 / harmonics.length
      dataL[i] = sampleL * norm * envelope * 0.4
      dataR[i] = sampleR * norm * envelope * 0.4
    }

    // Simple reverb (delay-based)
    const reverbTime = params.reverbTime || 0.15
    const delaySamples = Math.floor(reverbTime * sampleRate)
    for (let i = delaySamples; i < length; i++) {
      dataL[i] += dataL[i - delaySamples] * 0.3
      dataR[i] += dataR[i - delaySamples] * 0.3
    }

    return buffer
  }

  // Blip: Short sine wave (for UI)
  private async generateBlip(params: SoundParams): Promise<AudioBuffer> {
    const ctx = this.audioContext!
    const duration = params.duration || 0.08
    const frequency = params.frequency || 600
    const sampleRate = ctx.sampleRate
    const length = Math.floor(duration * sampleRate)

    const buffer = ctx.createBuffer(1, length, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < length; i++) {
      const progress = i / length
      const t = i / sampleRate

      // Simple sine wave
      const sine = Math.sin(2 * Math.PI * frequency * t)

      // Quick envelope
      const envelope = Math.sin(Math.PI * progress)

      data[i] = sine * envelope * 0.4
    }

    return buffer
  }

  // Fanfare: Rising arpeggio (for wave start/end)
  private async generateFanfare(params: SoundParams): Promise<AudioBuffer> {
    const ctx = this.audioContext!
    const duration = params.duration || 0.8
    const baseFreq = params.frequency || 330
    const sampleRate = ctx.sampleRate
    const length = Math.floor(duration * sampleRate)

    const buffer = ctx.createBuffer(2, length, sampleRate)
    const dataL = buffer.getChannelData(0)
    const dataR = buffer.getChannelData(1)

    // Arpeggio notes (major chord)
    const notes = [1, 1.25, 1.5, 2]
    const noteLength = length / notes.length

    for (let i = 0; i < length; i++) {
      const noteIndex = Math.min(Math.floor(i / noteLength), notes.length - 1)
      const noteProgress = (i % noteLength) / noteLength
      const freq = baseFreq * notes[noteIndex]

      const t = i / sampleRate

      // Triangle wave for cleaner sound
      const phase = (freq * t) % 1
      const triangle = 4 * Math.abs(phase - 0.5) - 1

      // Add octave
      const phase2 = (freq * 2 * t) % 1
      const triangle2 = 4 * Math.abs(phase2 - 0.5) - 1

      // Note envelope
      const noteEnv = Math.exp(-3 * noteProgress)

      // Overall envelope
      const progress = i / length
      const overallEnv = progress < 0.05 ? progress / 0.05 :
                         progress > 0.8 ? (1 - progress) / 0.2 : 1

      const sample = (triangle * 0.7 + triangle2 * 0.3) * noteEnv * overallEnv * 0.3

      // Slight stereo spread
      dataL[i] = sample * (1 + 0.1 * Math.sin(i * 0.01))
      dataR[i] = sample * (1 - 0.1 * Math.sin(i * 0.01))
    }

    return buffer
  }

  // Ambient: Space drone sound
  private async generateAmbient(params: SoundParams): Promise<AudioBuffer> {
    const ctx = this.audioContext!
    const duration = params.duration || 4.0
    const baseFreq = params.frequency || 55
    const sampleRate = ctx.sampleRate
    const length = Math.floor(duration * sampleRate)

    const buffer = ctx.createBuffer(2, length, sampleRate)
    const dataL = buffer.getChannelData(0)
    const dataR = buffer.getChannelData(1)

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate
      const progress = i / length

      // Multiple detuned sine waves for pad-like sound
      let sampleL = 0
      let sampleR = 0

      const freqs = [baseFreq, baseFreq * 1.5, baseFreq * 2, baseFreq * 3]

      for (let f = 0; f < freqs.length; f++) {
        const freq = freqs[f]
        // Slight LFO modulation
        const lfoL = 1 + 0.003 * Math.sin(2 * Math.PI * 0.3 * t + f)
        const lfoR = 1 + 0.003 * Math.sin(2 * Math.PI * 0.31 * t + f + 0.5)

        sampleL += Math.sin(2 * Math.PI * freq * lfoL * t) / (f + 1)
        sampleR += Math.sin(2 * Math.PI * freq * lfoR * t) / (f + 1)
      }

      // Add filtered noise for texture
      const noise = (Math.random() * 2 - 1) * 0.05

      // Smooth loop envelope
      const env = Math.sin(Math.PI * progress)

      dataL[i] = (sampleL * 0.3 + noise) * env * 0.2
      dataR[i] = (sampleR * 0.3 + noise) * env * 0.2
    }

    return buffer
  }

  // Splat: Organic squelchy sound for enemy deaths
  private async generateSplat(params: SoundParams): Promise<AudioBuffer> {
    const ctx = this.audioContext!
    const duration = params.duration || 0.2
    const sampleRate = ctx.sampleRate
    const length = Math.floor(duration * sampleRate)

    const buffer = ctx.createBuffer(1, length, sampleRate)
    const data = buffer.getChannelData(0)

    // Multiple short noise bursts
    let filtered = 0
    const noiseAmount = params.noiseAmount || 0.8

    for (let i = 0; i < length; i++) {
      const progress = i / length

      // White noise with varying filter
      const noise = Math.random() * 2 - 1

      // Filter frequency sweeps down quickly
      const filterFreq = 2000 * Math.exp(-10 * progress)
      const dt = 1 / sampleRate
      const rc = 1 / (2 * Math.PI * filterFreq)
      const alpha = dt / (rc + dt)
      filtered = filtered + alpha * (noise - filtered)

      // Add some low pitch thump
      const thump = Math.sin(2 * Math.PI * 80 * Math.exp(-8 * progress) * i / sampleRate)

      // Envelope
      const env = Math.exp(-8 * progress)

      data[i] = (filtered * noiseAmount + thump * (1 - noiseAmount)) * env * 0.6
    }

    return buffer
  }

  // Powerup: Rising sweep with shimmer
  private async generatePowerup(params: SoundParams): Promise<AudioBuffer> {
    const ctx = this.audioContext!
    const duration = params.duration || 0.3
    const startFreq = params.frequency || 300
    const sampleRate = ctx.sampleRate
    const length = Math.floor(duration * sampleRate)

    const buffer = ctx.createBuffer(2, length, sampleRate)
    const dataL = buffer.getChannelData(0)
    const dataR = buffer.getChannelData(1)

    let phase1 = 0
    let phase2 = 0

    for (let i = 0; i < length; i++) {
      const progress = i / length

      // Frequency sweeps up
      const freq = startFreq * (1 + progress * 2)

      phase1 += freq / sampleRate
      phase2 += (freq * 1.5) / sampleRate

      const sine1 = Math.sin(2 * Math.PI * phase1)
      const sine2 = Math.sin(2 * Math.PI * phase2)

      // Shimmer effect
      const shimmer = Math.sin(2 * Math.PI * 20 * i / sampleRate) * 0.5 + 0.5

      // Envelope
      const env = Math.sin(Math.PI * progress)

      dataL[i] = (sine1 * 0.6 + sine2 * 0.4 * shimmer) * env * 0.4
      dataR[i] = (sine1 * 0.4 + sine2 * 0.6 * shimmer) * env * 0.4
    }

    return buffer
  }

  // Error: Dissonant buzz
  private async generateError(params: SoundParams): Promise<AudioBuffer> {
    const ctx = this.audioContext!
    const duration = params.duration || 0.2
    const frequency = params.frequency || 200
    const sampleRate = ctx.sampleRate
    const length = Math.floor(duration * sampleRate)

    const buffer = ctx.createBuffer(1, length, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate
      const progress = i / length

      // Dissonant frequencies
      const f1 = Math.sin(2 * Math.PI * frequency * t)
      const f2 = Math.sin(2 * Math.PI * (frequency * 1.06) * t) // Minor second

      // Square wave modulation
      const mod = Math.sin(2 * Math.PI * 15 * t) > 0 ? 1 : 0.3

      // Envelope with two bumps
      const env = Math.sin(Math.PI * progress) * (1 + 0.5 * Math.sin(Math.PI * 4 * progress))

      data[i] = (f1 + f2) * 0.3 * mod * env
    }

    return buffer
  }

  // Convert AudioBuffer to data URL for use with Howler
  private async bufferToDataUrl(buffer: AudioBuffer): Promise<string> {
    // Convert to WAV format
    const wavBlob = this.bufferToWav(buffer)

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(wavBlob)
    })
  }

  private bufferToWav(buffer: AudioBuffer): Blob {
    const numChannels = buffer.numberOfChannels
    const sampleRate = buffer.sampleRate
    const format = 1 // PCM
    const bitDepth = 16

    const bytesPerSample = bitDepth / 8
    const blockAlign = numChannels * bytesPerSample

    const data = this.interleaveChannels(buffer)
    const dataSize = data.length * bytesPerSample
    const headerSize = 44

    const arrayBuffer = new ArrayBuffer(headerSize + dataSize)
    const view = new DataView(arrayBuffer)

    // Write WAV header
    this.writeString(view, 0, 'RIFF')
    view.setUint32(4, 36 + dataSize, true)
    this.writeString(view, 8, 'WAVE')
    this.writeString(view, 12, 'fmt ')
    view.setUint32(16, 16, true) // Chunk size
    view.setUint16(20, format, true)
    view.setUint16(22, numChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * blockAlign, true)
    view.setUint16(32, blockAlign, true)
    view.setUint16(34, bitDepth, true)
    this.writeString(view, 36, 'data')
    view.setUint32(40, dataSize, true)

    // Write audio data
    const offset = 44
    for (let i = 0; i < data.length; i++) {
      const sample = Math.max(-1, Math.min(1, data[i]))
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF
      view.setInt16(offset + i * 2, intSample, true)
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' })
  }

  private interleaveChannels(buffer: AudioBuffer): Float32Array {
    const numChannels = buffer.numberOfChannels
    const length = buffer.length
    const result = new Float32Array(length * numChannels)

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel)
      for (let i = 0; i < length; i++) {
        result[i * numChannels + channel] = channelData[i]
      }
    }

    return result
  }

  private writeString(view: DataView, offset: number, str: string): void {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i))
    }
  }

  dispose(): void {
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
    this.soundCache.clear()
  }
}
