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
import type { GameConfig, ApiReward, ServerSpinConfig } from '../utils/slots-engine'

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

  /**
   * Server spin endpoint configuration (NEW)
   * This is where the server determines win outcomes
   */
  serverSpin?: {
    endpoint: string
    gameId: string | number
    userId?: string
    sessionId?: string
    headers?: Record<string, string>
  }
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
    // Prepare server spin configuration if provided
    const serverSpinConfig: ServerSpinConfig | undefined = props.serverSpin ? {
      endpoint: props.serverSpin.endpoint,
      gameId: props.serverSpin.gameId,
      userId: props.serverSpin.userId,
      sessionId: props.serverSpin.sessionId,
      headers: props.serverSpin.headers
    } : undefined

    // Create the game engine with server config
    engine = new SlotsEngine(canvasRef.value, props.config, serverSpinConfig)

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

    // NEW: Handle spin errors from server
    engine.on('spinError', (error: Error) => {
      console.error('Spin error:', error)
      emit('error', error)
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
let isResizing = false
const RESIZE_DEBOUNCE_MS = 250

const handleResize = () => {
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
  }

  resizeTimeout = setTimeout(async () => {
    if (engine && !isResizing) {
      try {
        isResizing = true
        await engine.resize()
      } catch (error) {
        console.error('Error during resize:', error)
        emit('error', error as Error)
      } finally {
        isResizing = false
      }
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

/**
 * Update server spin configuration dynamically (NEW)
 */
const updateServerConfig = (config: ServerSpinConfig) => {
  if (engine) {
    engine.setServerSpinConfig(config)
  }
}

// Expose methods to parent component
defineExpose({
  spin,
  getSpinsRemaining,
  isSpinning,
  updateServerConfig  // NEW: Allow dynamic config updates
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
