import type { Enemy, EnemyType, Vector3D, EnemyBehaviors, EnemyBehaviorState } from '../types'
import { generateId } from '../utils/helpers'

export function createEnemy(
  type: EnemyType,
  position: Vector3D,
  stats: {
    maxHealth: number
    speed: number
    damage: number
    reward: number
  },
  behaviors?: EnemyBehaviors,
  behaviorStateOverride?: Partial<EnemyBehaviorState>
): Enemy {
  // Initialize behavior state based on behaviors
  const behaviorState: EnemyBehaviorState = {
    projectilesReceived: 0,
    isDodging: false,
    dodgeOffset: { x: 0, z: 0 },
    lastTeleportTime: 0,
    lastBurrowTime: 0,
    isBurrowed: false,
    burrowEndTime: 0,
    lastTrailTime: 0,
    animationPhase: 0,
    isMini: false,
    ...behaviorStateOverride,
  }

  return {
    id: generateId(),
    type,
    position: { ...position },
    rotation: 0,
    health: stats.maxHealth,
    maxHealth: stats.maxHealth,
    speed: stats.speed,
    damage: stats.damage,
    reward: stats.reward,
    pathIndex: 0,
    pathProgress: 0,
    isDead: false,
    reachedEnd: false,
    behaviors,
    behaviorState,
  }
}
