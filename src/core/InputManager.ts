import { useGameStore } from '../stores/gameStore'

export class InputManager {
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null

  initialize(): void {
    this.keydownHandler = this.handleKeydown.bind(this)
    window.addEventListener('keydown', this.keydownHandler)
  }

  private handleKeydown(e: KeyboardEvent): void {
    const store = useGameStore.getState()
    const { hero, gameState } = store

    if (gameState !== 'playing' || !hero) return

    const key = e.key.toUpperCase()

    if (key === 'Q' || key === 'W' || key === 'R') {
      const ability = hero.abilities[key as 'Q' | 'W' | 'R']
      if (ability && ability.currentCooldown <= 0) {
        // Ability activation will be handled by HeroAbilitySystem
        window.dispatchEvent(new CustomEvent('heroAbility', { detail: { key } }))
      }
    }
  }

  cleanup(): void {
    if (this.keydownHandler) {
      window.removeEventListener('keydown', this.keydownHandler)
    }
  }
}
