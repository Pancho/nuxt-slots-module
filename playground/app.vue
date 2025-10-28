<template>
  <div>
    <SlotsGame
      style="margin:0;padding:0;"
      ref="gameRef"
      :api-endpoint="'https://frontend-api.engagefactory.dev/api/boosters/spinner/0/en'"
      :api-headers="{
        'ef-ipcountry': 'si',
        'ef-site': 'default'
      }"
      @ready="onGameReady"
      @win="onWin"
      @spin-complete="onSpinComplete"
    />

<!--    <button @click="triggerSpin" :disabled="!canSpin">-->
<!--      Spin ({{ spinsRemaining }} left)-->
<!--    </button>-->
  </div>
</template>

<script setup lang="ts">
import {useSlotsGame} from "../src/runtime/composables/useSlotsGame";
const config = useRuntimeConfig()
const gameRef = ref()
const {isSpinning, spinsRemaining, lastWin, spin, canSpin} = useSlotsGame(gameRef)

const onGameReady = () => {
  console.log('Game is ready!')
  spinsRemaining.value = gameRef.value?.getSpinsRemaining() || 0
}

const onWin = (reward: any) => {
  console.log('You won!', reward)
  lastWin.value = reward
}

const onSpinComplete = (result: any) => {
  console.log('Spin complete', result)
  isSpinning.value = false
  spinsRemaining.value = gameRef.value?.getSpinsRemaining() || 0
}

const triggerSpin = () => {
  spin()
}
</script>
