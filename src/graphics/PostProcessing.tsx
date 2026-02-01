import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
  HueSaturation,
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import { screenShake, ScreenShakeIntensity } from './effects/ScreenShake'
import { useEffectsStore } from '../stores/effectsStore'

export function PostProcessing() {
  const { camera } = useThree()
  const chromaticRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0))
  const updateChromaticAberration = useEffectsStore((state) => state.updateChromaticAberration)

  // Initialize screen shake with camera reference
  useEffect(() => {
    screenShake.setCamera(camera)

    // Listen for screen shake events
    const handleScreenShake = (e: CustomEvent<{ intensity: ScreenShakeIntensity }>) => {
      screenShake.shake(e.detail.intensity)
    }

    window.addEventListener('screenShake', handleScreenShake as EventListener)

    return () => {
      window.removeEventListener('screenShake', handleScreenShake as EventListener)
      screenShake.clear()
    }
  }, [camera])

  // Update effects each frame
  useFrame((_, delta) => {
    // Update screen shake
    screenShake.update(delta)

    // Update chromatic aberration intensity
    const chromaticIntensity = updateChromaticAberration(delta)
    chromaticRef.current.set(chromaticIntensity, chromaticIntensity)
  })

  return (
    <EffectComposer multisampling={4}>
      {/* Bloom - Always on for that neon glow */}
      <Bloom
        intensity={1.5}
        luminanceThreshold={0.8}
        luminanceSmoothing={0.3}
        mipmapBlur
        radius={0.8}
      />

      {/* Vignette - Subtle darkening at edges */}
      <Vignette
        offset={0.3}
        darkness={0.3}
        blendFunction={BlendFunction.NORMAL}
      />

      {/* Chromatic Aberration - Triggered on impacts */}
      <ChromaticAberration
        offset={chromaticRef.current}
        blendFunction={BlendFunction.NORMAL}
        radialModulation={false}
        modulationOffset={0.5}
      />

      {/* Color grading - Enhanced saturation for cosmic neon aesthetic */}
      <HueSaturation
        hue={0}
        saturation={0.1} // +10% saturation for vibrant colors
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  )
}
