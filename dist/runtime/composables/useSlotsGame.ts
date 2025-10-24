import { ref, computed } from 'vue'
import type { Ref } from 'vue'

export interface UseSlotsGameReturn {
  isSpinning: Ref<boolean>
  spinsRemaining: Ref<number>
  lastWin: Ref<any | null>
  spin: () => void
  canSpin: Ref<boolean>
}

export function useSlotsGame(gameRef?: Ref<any>): UseSlotsGameReturn {
  const isSpinning = ref(false)
  const spinsRemaining = ref(0)
  const lastWin = ref<any | null>(null)

  const canSpin = computed(() => !isSpinning.value && spinsRemaining.value > 0)

  const spin = () => {
    if (!canSpin.value || !gameRef?.value) return

    isSpinning.value = true
    gameRef.value.spin()
  }

  return {
    isSpinning,
    spinsRemaining,
    lastWin,
    spin,
    canSpin
  }
}
