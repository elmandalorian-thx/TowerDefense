import type { Vector3D } from '../types'

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

export function distance3D(a: Vector3D, b: Vector3D): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const dz = b.z - a.z
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

export function distance2D(a: Vector3D, b: Vector3D): number {
  const dx = b.x - a.x
  const dz = b.z - a.z
  return Math.sqrt(dx * dx + dz * dz)
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function lerpVector3D(a: Vector3D, b: Vector3D, t: number): Vector3D {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    z: lerp(a.z, b.z, t),
  }
}

export function normalizeVector3D(v: Vector3D): Vector3D {
  const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
  if (length === 0) return { x: 0, y: 0, z: 0 }
  return {
    x: v.x / length,
    y: v.y / length,
    z: v.z / length,
  }
}

export function subtractVectors(a: Vector3D, b: Vector3D): Vector3D {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z,
  }
}

export function addVectors(a: Vector3D, b: Vector3D): Vector3D {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
    z: a.z + b.z,
  }
}

export function scaleVector(v: Vector3D, scale: number): Vector3D {
  return {
    x: v.x * scale,
    y: v.y * scale,
    z: v.z * scale,
  }
}

export function angleToTarget(from: Vector3D, to: Vector3D): number {
  return Math.atan2(to.x - from.x, to.z - from.z)
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
