<script setup lang="ts">
import { computed, ref } from 'vue'

import { getCitations } from '@/engine/biangua'
import { resolveHexagrams } from '@/engine/hexagram'
import { paipan } from '@/engine/paipan'
import type { YaoValue } from '@/engine/types'

import LineStack from '../components/LineStack.vue'
import PaipanTable from '../components/PaipanTable.vue'
import ReadingPanel from '../components/ReadingPanel.vue'

const props = defineProps<{
  question: string
  lines: YaoValue[]
  castAt: Date
}>()

const emit = defineEmits<{
  /** 所问之事编辑保存（T013 接入历史记录落库） */
  questionChange: [string]
  /** 再摇一卦 */
  again: []
}>()

const editedQuestion = ref(props.question)

const pan = computed(() => paipan(props.lines, props.castAt))
const citations = computed(() => getCitations(props.lines))
const movingCount = computed(() => props.lines.filter((v) => v === 6 || v === 9).length)

const bianLines = computed<YaoValue[] | null>(() => {
  const { bian } = resolveHexagrams(props.lines)
  if (!bian) return null
  return bian.binaryKey.split('').map((c) => (c === '1' ? 7 : 8) as YaoValue)
})

function saveQuestion(): void {
  const trimmed = editedQuestion.value.trim()
  if (trimmed.length === 0 || trimmed === props.question) return
  emit('questionChange', trimmed)
}
</script>

<template>
  <section class="result-view">
    <div class="question-row">
      <label for="result-question">所问</label>
      <input
        id="result-question"
        v-model="editedQuestion"
        type="text"
        maxlength="50"
        @change="saveQuestion"
      />
    </div>
    <p class="question-hint">修改后自动保存（失焦生效）</p>

    <div class="guas">
      <div class="gua-block">
        <h2 class="gua-title">{{ pan.ben.name }}</h2>
        <LineStack :lines="lines" />
      </div>
      <div v-if="bianLines" class="gua-block">
        <h2 class="gua-title dim">{{ pan.bian?.name }}</h2>
        <LineStack :lines="bianLines" />
      </div>
    </div>
    <p class="moving-summary">
      {{ movingCount === 0 ? '六爻安静' : `${movingCount} 个动爻` }}
      <template v-if="pan.bian"> · 变卦 {{ pan.bian.name }}</template>
    </p>

    <PaipanTable :pan="pan" />
    <ReadingPanel :citations="citations" />

    <div class="actions">
      <button class="primary-btn" type="button" @click="emit('again')">再摇一卦</button>
    </div>
  </section>
</template>

<style scoped>
.result-view {
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding: 8px 0 24px;
}

.question-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.question-row label {
  font-size: 0.9rem;
  letter-spacing: 0.3em;
  color: var(--color-gold);
  white-space: nowrap;
}

.question-row input {
  flex: 1;
  background: transparent;
  border: none;
  border-bottom: 1px dashed var(--color-line);
  color: var(--color-paper);
  font-family: inherit;
  font-size: 1rem;
  padding: 6px 2px;
  outline: none;
  transition: border-color 0.2s ease;
}

.question-row input:focus {
  border-bottom-color: var(--color-gold);
}

.question-hint {
  margin: -14px 0 0;
  font-size: 0.75rem;
  color: var(--color-paper-dim);
  opacity: 0.7;
}

.guas {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 560px) {
  .guas {
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }
}

.gua-block {
  background: var(--color-panel);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-panel);
  padding: 18px 12px;
}

.gua-title {
  margin: 0 0 14px;
  text-align: center;
  font-size: 1.2rem;
  letter-spacing: 0.3em;
  color: var(--color-gold-bright);
  font-weight: 600;
}

.gua-title.dim {
  color: var(--color-gold);
}

.moving-summary {
  margin: -6px 0 0;
  text-align: center;
  font-size: 0.85rem;
  color: var(--color-paper-dim);
  letter-spacing: 0.2em;
}

.actions {
  display: flex;
  justify-content: center;
  padding-top: 6px;
}

.primary-btn {
  appearance: none;
  background: rgba(201, 165, 92, 0.08);
  border: 1px solid var(--color-gold);
  border-radius: var(--radius-control);
  color: var(--color-gold-bright);
  font-family: inherit;
  font-size: 1rem;
  letter-spacing: 0.3em;
  padding: 12px 40px;
  cursor: pointer;
  transition:
    background 0.2s ease,
    box-shadow 0.2s ease;
}

.primary-btn:hover {
  background: rgba(201, 165, 92, 0.16);
  box-shadow: 0 0 18px rgba(201, 165, 92, 0.25);
}
</style>
