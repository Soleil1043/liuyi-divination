<script setup lang="ts">
import { computed } from 'vue'

import type { CoinSide } from '@/engine/types'

const props = defineProps<{
  /** 最近一次掷出的三枚铜钱面（null = 尚未开始） */
  coins: [CoinSide, CoinSide, CoinSide] | null
  /** 摇动动画进行中 */
  rolling: boolean
}>()

const slots = computed<[CoinSide | null, CoinSide | null, CoinSide | null]>(
  () => props.coins ?? [null, null, null],
)
</script>

<template>
  <div class="coin-row">
    <div v-for="(side, i) in slots" :key="i" class="coin-slot">
      <div class="coin" :class="side === '背' ? 'back' : 'face'" :data-rolling="rolling">
        <svg viewBox="0 0 72 72" aria-hidden="true">
          <circle class="rim" cx="36" cy="36" r="33" />
          <rect class="hole" x="25" y="25" width="22" height="22" />
          <!-- 背面：方孔四角四出纹；字面：孔左右饰点 -->
          <g v-if="side === '背'" class="cross">
            <line x1="25" y1="25" x2="8" y2="8" />
            <line x1="47" y1="25" x2="64" y2="8" />
            <line x1="25" y1="47" x2="8" y2="64" />
            <line x1="47" y1="47" x2="64" y2="64" />
          </g>
          <g v-else class="dots">
            <circle cx="17" cy="36" r="2" />
            <circle cx="55" cy="36" r="2" />
          </g>
        </svg>
      </div>
      <span class="side-label">{{ side ?? '' }}</span>
    </div>
  </div>
</template>

<style scoped>
.coin-row {
  display: flex;
  justify-content: center;
  gap: 28px;
  perspective: 600px;
}

.coin-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.coin {
  width: 72px;
  height: 72px;
}

.coin[data-rolling='true'] {
  animation: coin-flip 0.85s ease-in-out both;
}

.coin:nth-child(1) {
  animation-delay: 0s;
}

.side-label {
  min-height: 1.2em;
  font-size: 0.85rem;
  letter-spacing: 0.2em;
  color: var(--color-gold);
}

/* 铜钱造型：圆环金边 + 方孔 */
.rim {
  fill: rgba(201, 165, 92, 0.12);
  stroke: var(--color-gold);
  stroke-width: 2.5;
}

.hole {
  fill: var(--color-bg);
  stroke: var(--color-gold);
  stroke-width: 2;
}

.coin.back .rim {
  stroke: var(--color-gold-bright);
}

.coin.back .hole {
  stroke: var(--color-gold-bright);
}

.cross line {
  stroke: var(--color-gold);
  stroke-width: 1.5;
  opacity: 0.8;
}

.dots circle {
  fill: var(--color-gold);
}

@keyframes coin-flip {
  0% {
    transform: rotateY(0deg) translateY(0);
  }
  45% {
    transform: rotateY(400deg) translateY(-30px);
  }
  100% {
    transform: rotateY(720deg) translateY(0);
  }
}
</style>
