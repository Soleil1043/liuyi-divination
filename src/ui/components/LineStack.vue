<script setup lang="ts">
import { computed } from 'vue'

import type { YaoValue } from '@/engine/types'

const props = defineProps<{
  /** 已摇出的爻值（自下而上，0–6 项） */
  lines: YaoValue[]
}>()

/** 自上而下渲染的爻位（6 上爻 … 1 初爻） */
const positions = [6, 5, 4, 3, 2, 1]

function valueAt(pos: number): YaoValue | null {
  return props.lines[pos - 1] ?? null
}

function isYang(v: YaoValue): boolean {
  return v === 7 || v === 9
}

function isMoving(v: YaoValue): boolean {
  return v === 6 || v === 9
}

const emptyCount = computed(() => 6 - props.lines.length)
</script>

<template>
  <div class="stack" aria-label="卦象">
    <div v-for="pos in positions" :key="pos" class="slot">
      <template v-if="valueAt(pos) !== null">
        <div
          class="line"
          :class="{
            yang: isYang(valueAt(pos)!),
            yin: !isYang(valueAt(pos)!),
            moving: isMoving(valueAt(pos)!),
          }"
          :style="{ animationDelay: `${(6 - pos) * 0.08}s` }"
        >
          <span class="bar" />
          <span v-if="!isYang(valueAt(pos)!)" class="bar" />
        </div>
        <span v-if="isMoving(valueAt(pos)!)" class="moving-dot" />
      </template>
      <div v-else class="line empty" :class="{ latest: emptyCount === 6 - pos + 1 }">
        <span class="bar" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: stretch;
  padding: 8px 24px;
}

.slot {
  position: relative;
  display: flex;
  justify-content: center;
}

.line {
  display: flex;
  gap: 14px;
  animation: line-appear 0.4s ease-out both;
}

.line .bar {
  height: 10px;
  border-radius: 5px;
  background: var(--color-gold);
  width: 180px;
  box-shadow: 0 0 6px rgba(201, 165, 92, 0.35);
}

.line.yang .bar:only-child {
  width: 220px;
}

.line.empty .bar {
  width: 220px;
  background: transparent;
  border: 1px dashed var(--color-line);
  box-shadow: none;
  opacity: 0.6;
}

.line.empty.latest .bar {
  border-color: var(--color-gold);
  opacity: 0.9;
}

/* 动爻：金色呼吸 */
.line.moving .bar {
  animation: breathe 2.2s ease-in-out infinite;
}

.moving-dot {
  position: absolute;
  left: calc(50% - 140px);
  top: 50%;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transform: translateY(-50%);
  background: var(--color-cinnabar);
  box-shadow: 0 0 8px var(--color-cinnabar);
  animation: dot-breathe 2.2s ease-in-out infinite;
}

@keyframes line-appear {
  from {
    opacity: 0;
    transform: scaleX(0.6);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes breathe {
  0%,
  100% {
    box-shadow: 0 0 4px rgba(232, 200, 126, 0.4);
  }
  50% {
    box-shadow:
      0 0 14px rgba(232, 200, 126, 0.9),
      0 0 24px rgba(201, 165, 92, 0.5);
  }
}

@keyframes dot-breathe {
  0%,
  100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
}
</style>
