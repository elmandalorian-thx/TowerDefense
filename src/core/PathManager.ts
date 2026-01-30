import type { PathPoint, Vector3D } from '../types'
import { distance2D, lerpVector3D } from '../utils/helpers'

export class PathManager {
  private path: PathPoint[] = []
  private segmentLengths: number[] = []
  private totalLength: number = 0

  setPath(path: PathPoint[]): void {
    this.path = path
    this.calculateSegmentLengths()
  }

  getPath(): PathPoint[] {
    return this.path
  }

  private calculateSegmentLengths(): void {
    this.segmentLengths = []
    this.totalLength = 0

    for (let i = 0; i < this.path.length - 1; i++) {
      const length = distance2D(this.path[i], this.path[i + 1])
      this.segmentLengths.push(length)
      this.totalLength += length
    }
  }

  getPositionAtProgress(progress: number): Vector3D {
    if (this.path.length === 0) return { x: 0, y: 0, z: 0 }
    if (this.path.length === 1) return this.path[0]
    if (progress <= 0) return this.path[0]
    if (progress >= 1) return this.path[this.path.length - 1]

    const targetDistance = progress * this.totalLength
    let accumulatedDistance = 0

    for (let i = 0; i < this.segmentLengths.length; i++) {
      const segmentLength = this.segmentLengths[i]

      if (accumulatedDistance + segmentLength >= targetDistance) {
        const segmentProgress = (targetDistance - accumulatedDistance) / segmentLength
        return lerpVector3D(this.path[i], this.path[i + 1], segmentProgress)
      }

      accumulatedDistance += segmentLength
    }

    return this.path[this.path.length - 1]
  }

  getProgressForIndex(index: number, progressInSegment: number): number {
    if (this.totalLength === 0) return 0

    let accumulatedDistance = 0
    for (let i = 0; i < index && i < this.segmentLengths.length; i++) {
      accumulatedDistance += this.segmentLengths[i]
    }

    if (index < this.segmentLengths.length) {
      accumulatedDistance += this.segmentLengths[index] * progressInSegment
    }

    return accumulatedDistance / this.totalLength
  }

  getTotalLength(): number {
    return this.totalLength
  }

  getSegmentCount(): number {
    return this.segmentLengths.length
  }
}
