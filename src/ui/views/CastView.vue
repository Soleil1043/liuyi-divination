<script setup lang="ts">
import { computed, ref } from 'vue'

import { castOneYao } from '@/engine/cast'
import type { CoinSide, YaoValue } from '@/engine/types'

import CoinToss from '../components/CoinToss.vue'
import LineStack from '../components/LineStack.vue'

const emit = defineEmits<{
  done: [payload: { question: string; lines: YaoValue[]; castAt: Date }]
}>()

/** 单次摇动动画时长（与 CoinToss 的 coin-flip 0.85s + 级联延迟对齐） */
const ROLL_MS = 1100
/** 第 6 爻落定后停留片刻再揭晓 */
const REVEAL_MS = 1200

const question = ref('')
const lines = ref<YaoValue[]>([])
const lastCoins = ref<[CoinSide, CoinSide, CoinSide] | null>(null)
const castAt = ref<Date | null>(null)
const rolling = ref(false)

const isComplete = computed(() => lines.value.length === 6)

/** E01：所问之事为空（trim 后）不可开始摇卦 */
const canShake = computed(
  () => question.value.trim().length > 0 && !isComplete.value && !rolling.value,
)

const buttonLabel = computed(() => {
  if (rolling.value) return '铜钱落定中…'
  if (isComplete.value) return '卦象已成 ✦'
  return lines.value.length === 0 ? '静心摇第一爻' : `摇第 ${lines.value.length + 1} 爻`
})

function shake(): void {
  // E03：动画期间 canShake 为 false，连点被拦截，爻序不会错乱
  if (!canShake.value) return
  // E02：进行中的卦只存在于内存，刷新即丢弃，绝不提前写入历史
  rolling.value = true
  window.setTimeout(() => {
    const result = castOneYao()
    // 起卦时刻以摇出第一爻为准
    if (castAt.value === null) castAt.value = new Date()
    lines.value.push(result.value)
    lastCoins.value = result.coins
    rolling.value = false
    if (lines.value.length === 6) window.setTimeout(reveal, REVEAL_MS)
  }, ROLL_MS)
}

function reveal(): void {
  if (!isComplete.value || castAt.value === null) return
  emit('done', {
    question: question.value.trim(),
    lines: [...lines.value],
    castAt: castAt.value,
  })
}

function fillDefault(): void {
  question.value = '今日一占'
}
</script>

<template>
  <section class="cast-view">
    <div class="question-block">
      <label class="question-label" for="question">所问之事</label>
      <div class="question-row">
        <input
          id="question"
          v-model="question"
          type="text"
          maxlength="50"
          placeholder="默念所问之事，写下一句话（必填）"
          :disabled="isComplete"
        />
        <button class="ghost-btn" type="button" :disabled="isComplete" @click="fillDefault">
          今日一占
        </button>
      </div>
    </div>

    <LineStack :lines="lines" />

    <CoinToss :coins="lastCoins" :rolling="rolling" />

    <div class="action-block">
      <button class="primary-btn" type="button" :disabled="!canShake" @click="shake">
        {{ buttonLabel }}
      </button>
      <p class="hint">
        <template v-if="question.trim().length === 0 && !isComplete">
          先写下所问之事，方可开始摇卦
        </template>
        <template v-else-if="isComplete"> 六爻已成，静候揭晓 </template>
        <template v-else-if="rolling"> 心诚则灵…… </template>
        <template v-else> 已成 {{ lines.length }} / 6 爻，自下而上 </template>
      </p>
    </div>
  </section>
</template>

<style scoped>
.cast-view {
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding: 8px 0 24px;
}

.question-label {
  display: block;
  font-size: 0.9rem;
  letter-spacing: 0.3em;
  color: var(--color-gold);
  margin-bottom: 10px;
}

.question-row {
  display: flex;
  gap: 10px;
}

.question-row input {
  flex: 1;
  background: var(--color-panel);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-control);
  color: var(--color-paper);
  font-family: inherit;
  font-size: 1rem;
  padding: 10px 14px;
  outline: none;
  transition: border-color 0.2s ease;
}

.question-row input:focus {
  border-color: var(--color-gold);
}

.question-row input:disabled {
  opacity: 0.6;
}

.ghost-btn {
  appearance: none;
  background: transparent;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-control);
  color: var(--color-paper-dim);
  font-family: inherit;
  font-size: 0.9rem;
  padding: 0 16px;
  cursor: pointer;
  white-space: nowrap;
  transition:
    color 0.2s ease,
    border-color 0.2s ease;
}

.ghost-btn:hover:not(:disabled) {
  color: var(--color-gold-bright);
  border-color: var(--color-gold);
}

.ghost-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.primary-btn {
  appearance: none;
  background: rgba(201, 165, 92, 0.08);
  border: 1px solid var(--color-gold);
  border-radius: var(--radius-control);
  color: var(--color-gold-bright);
  font-family: inherit;
  font-size: 1.1rem;
  letter-spacing: 0.3em;
  padding: 14px 48px;
  cursor: pointer;
  transition:
    background 0.2s ease,
    box-shadow 0.2s ease;
}

.primary-btn:hover:not(:disabled) {
  background: rgba(201, 165, 92, 0.16);
  box-shadow: 0 0 18px rgba(201, 165, 92, 0.25);
}

.primary-btn:disabled {
  opacity: 0.45;
  cursor: default;
}

.action-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.hint {
  margin: 0;
  min-height: 1.4em;
  font-size: 0.85rem;
  color: var(--color-paper-dim);
  letter-spacing: 0.1em;
}
</style>
