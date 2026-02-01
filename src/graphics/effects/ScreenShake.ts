import * as THREE from 'three'

export type ScreenShakeIntensity = 'subtle' | 'medium' | 'heavy'

interface ShakeEvent {
  intensity: number
  duration: number
  startTime: number
  decay: number
}

const INTENSITY_VALUES: Record<ScreenShakeIntensity, number> = {
  subtle: 0.02,
  medium: 0.08,
  heavy: 0.2,
}

const DURATION_VALUES: Record<ScreenShakeIntensity, number> = {
  subtle: 0.1,
  medium: 0.2,
  heavy: 0.4,
}

class ScreenShakeManager {
  private activeShakes: ShakeEvent[] = []
  private originalPosition: THREE.Vector3 = new THREE.Vector3()
  private currentOffset: THREE.Vector3 = new THREE.Vector3()
  private camera: THREE.Camera | null = null
  private time: number = 0

  /**
   * Set the camera reference for applying shake
   */
  setCamera(camera: THREE.Camera): void {
    this.camera = camera
    this.originalPosition.copy(camera.position)
  }

  /**
   * Trigger a screen shake effect
   */
  shake(intensity: ScreenShakeIntensity = 'medium'): void {
    const shakeEvent: ShakeEvent = {
      intensity: INTENSITY_VALUES[intensity],
      duration: DURATION_VALUES[intensity],
      startTime: this.time,
      decay: 2.5, // Exponential decay factor
    }
    this.activeShakes.push(shakeEvent)
  }

  /**
   * Custom shake with specific parameters
   */
  customShake(intensity: number, duration: number): void {
    const shakeEvent: ShakeEvent = {
      intensity,
      duration,
      startTime: this.time,
      decay: 2.5,
    }
    this.activeShakes.push(shakeEvent)
  }

  /**
   * Update shake effects each frame
   */
  update(delta: number): THREE.Vector3 {
    this.time += delta
    this.currentOffset.set(0, 0, 0)

    // Remove expired shakes and calculate combined offset
    this.activeShakes = this.activeShakes.filter((shake) => {
      const elapsed = this.time - shake.startTime
      if (elapsed >= shake.duration) {
        return false
      }

      // Calculate shake progress (0 to 1)
      const progress = elapsed / shake.duration

      // Exponential decay for intensity
      const currentIntensity = shake.intensity * Math.exp(-shake.decay * progress)

      // Generate random offset with Perlin-like smoothing
      const frequency = 25 // Shake frequency
      const offsetX = Math.sin(elapsed * frequency * 1.1) * currentIntensity
      const offsetY = Math.sin(elapsed * frequency * 0.9) * currentIntensity
      const offsetZ = Math.sin(elapsed * frequency) * currentIntensity * 0.5

      this.currentOffset.x += offsetX
      this.currentOffset.y += offsetY
      this.currentOffset.z += offsetZ

      return true
    })

    // Apply to camera if available
    if (this.camera && this.activeShakes.length > 0) {
      this.camera.position.x = this.originalPosition.x + this.currentOffset.x
      this.camera.position.y = this.originalPosition.y + this.currentOffset.y
      this.camera.position.z = this.originalPosition.z + this.currentOffset.z
    } else if (this.camera && this.activeShakes.length === 0) {
      // Smoothly return to original position
      this.camera.position.lerp(this.originalPosition, delta * 10)
    }

    return this.currentOffset
  }

  /**
   * Update the original camera position (for when camera moves)
   */
  updateOriginalPosition(position: THREE.Vector3): void {
    this.originalPosition.copy(position)
  }

  /**
   * Check if any shakes are currently active
   */
  isShaking(): boolean {
    return this.activeShakes.length > 0
  }

  /**
   * Clear all active shakes
   */
  clear(): void {
    this.activeShakes = []
    if (this.camera) {
      this.camera.position.copy(this.originalPosition)
    }
  }
}

// Singleton instance for global access
export const screenShake = new ScreenShakeManager()

// Event-based triggering for easy integration
export function triggerScreenShake(intensity: ScreenShakeIntensity = 'medium'): void {
  screenShake.shake(intensity)
}

export function triggerCustomShake(intensity: number, duration: number): void {
  screenShake.customShake(intensity, duration)
}
