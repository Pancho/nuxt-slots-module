<template>
  <ClientOnly>
    <div ref="containerRef" class="slots-game-container">
      <canvas ref="canvasRef"></canvas>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { SlotsEngine } from '../utils/slots-engine'
import type { GameConfig, ApiReward } from '../utils/slots-engine'

export interface SlotsGameProps {
  /**
   * API endpoint to fetch game configuration
   */
  apiEndpoint?: string

  /**
   * Additional headers for API request
   */
  apiHeaders?: Record<string, string>

  /**
   * Partial game configuration overrides
   */
  config?: Partial<GameConfig>

  /**
   * Auto-start the game after initialization
   */
  autoStart?: boolean
}

const props = withDefaults(defineProps<SlotsGameProps>(), {
  autoStart: true
})

const emit = defineEmits<{
  /**
   * Emitted when a win occurs
   */
  win: [reward: ApiReward]

  /**
   * Emitted when a spin completes
   */
  spinComplete: [result: { won: boolean; reward?: ApiReward }]

  /**
   * Emitted when spin starts
   */
  spinStart: []

  /**
   * Emitted when remaining spins count changes
   */
  spinsUpdate: [remaining: number]

  /**
   * Emitted when the game is fully loaded and ready
   */
  ready: []

  /**
   * Emitted when an error occurs
   */
  error: [error: Error]
}>()

const containerRef = ref<HTMLDivElement>()
const canvasRef = ref<HTMLCanvasElement>()

let engine: SlotsEngine | null = null

onMounted(async () => {
  // Wait for ClientOnly to render
  await nextTick()

  if (!canvasRef.value) {
    console.error('❌ Canvas ref still not available after nextTick')
    emit('error', new Error('Canvas element not found'))
    return
  }

  console.log('✅ Canvas element found:', canvasRef.value)

  try {
    // Create the game engine
    engine = new SlotsEngine(canvasRef.value, props.config)

    // Fetch game configuration if API endpoint provided
    if (props.apiEndpoint) {
      await engine.fetchGameConfig(props.apiEndpoint, props.apiHeaders)
    }

    // Set up event listeners
    engine.on('spinStart', () => {
      emit('spinStart')
    })

    engine.on('spinsUpdate', (remaining: number) => {
      emit('spinsUpdate', remaining)
    })

    engine.on('win', (reward: ApiReward) => {
      emit('win', reward)
    })

    engine.on('spinComplete', (result: { won: boolean; reward?: ApiReward }) => {
      emit('spinComplete', result)
    })

    emit('ready')
  } catch (error) {
    console.error('Failed to initialize slots game:', error)
    emit('error', error as Error)
  }
})

onUnmounted(() => {
  if (engine) {
    engine.destroy()
    engine = null
  }
})

// Handle window resize with debounce
let resizeTimeout: ReturnType<typeof setTimeout> | null = null
let resizeObserver: ResizeObserver | null = null
const RESIZE_DEBOUNCE_MS = 250

const handleResize = () => {
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
  }

  resizeTimeout = setTimeout(() => {
    if (engine) {
      engine.resize()
    }
  }, RESIZE_DEBOUNCE_MS)
}

onMounted(() => {
  // Listen for window resize
  window.addEventListener('resize', handleResize)

  // Also use ResizeObserver for container-specific resizing
  if (containerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      handleResize()
    })
    resizeObserver.observe(containerRef.value)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)

  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }

  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
  }
})

/**
 * Manually trigger a spin
 */
const spin = () => {
  if (engine) {
    engine.startPlay()
  }
}

/**
 * Get the number of spins remaining
 */
const getSpinsRemaining = (): number => {
  return engine?.getSpinsRemaining() || 0
}

/**
 * Check if a spin is currently in progress
 */
const isSpinning = (): boolean => {
  return engine?.isSpinning() || false
}

// Expose methods to parent component
defineExpose({
  spin,
  getSpinsRemaining,
  isSpinning
})
</script>

<style scoped>
.slots-game-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #1a1a2e;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
