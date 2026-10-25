<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from 'vue'

import type { YaoValue } from './engine/types'
import { isAvailable, save as saveRecord, update as updateRecord } from './storage/records'
import type { HexagramRecord } from './storage/records'

import CastView from './ui/views/CastView.vue'
import HistoryView from './ui/views/HistoryView.vue'

// 结果页动态加载：摇卦首屏不引入 lunar 排盘链（构建优化，见 progress T015）
const ResultView = defineAsyncComponent(() => import('./ui/views/ResultView.vue'))

type ViewId = 'casting' | 'result' | 'history'

const currentView = ref<ViewId>('casting')

/** 已落库的当前卦例（成卦保存 / 历史回看共用） */
const activeRecord = ref<HexagramRecord | null>(null)
/** E06 降级：无法落库时的临时卦例，仍可查看结果但不入历史 */
const transientResult = ref<{ question: string; lines: YaoValue[]; castAt: Date } | null>(null)

const storageOk = isAvailable()

const resultData = computed(() => {
  if (activeRecord.value) {
    return {
      question: activeRecord.value.question,
      lines: activeRecord.value.lines,
      castAt: new Date(activeRecord.value.castAt),
      saved: true,
    }
  }
  if (transientResult.value) {
    return { ...transientResult.value, saved: false }
  }
  return null
})

/** F05：成卦自动保存；E06 存储不可用时降级为临时结果 */
function onDone(payload: { question: string; lines: YaoValue[]; castAt: Date }): void {
  const record = storageOk ? saveRecord(payload.question, payload.lines, payload.castAt) : null
  if (record) {
    activeRecord.value = record
    transientResult.value = null
  } else {
    activeRecord.value = null
    transientResult.value = payload
  }
  currentView.value = 'result'
}

/** F01：所问之事编辑同步（历史记录 + 当前展示） */
function onQuestionChange(question: string): void {
  if (activeRecord.value) {
    updateRecord(activeRecord.value.id, question)
    activeRecord.value = { ...activeRecord.value, question }
  }
  if (transientResult.value) {
    transientResult.value = { ...transientResult.value, question }
  }
}

/** F05：历史回看（复用排盘引擎重算） */
function onViewRecord(record: HexagramRecord): void {
  activeRecord.value = record
  transientResult.value = null
  currentView.value = 'result'
}

function onAgain(): void {
  activeRecord.value = null
  transientResult.value = null
  currentView.value = 'casting'
}
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <h1 class="app-title">静爻</h1>
      <nav class="app-nav">
        <button :class="{ active: currentView === 'casting' }" @click="currentView = 'casting'">
          摇卦
        </button>
        <button :class="{ active: currentView === 'history' }" @click="currentView = 'history'">
          历史
        </button>
      </nav>
    </header>

    <main class="app-main">
      <CastView v-if="currentView === 'casting'" @done="onDone" />
      <ResultView
        v-else-if="currentView === 'result' && resultData"
        :key="activeRecord?.id ?? 'transient'"
        :question="resultData.question"
        :lines="resultData.lines"
        :cast-at="resultData.castAt"
        :saved="resultData.saved"
        @question-change="onQuestionChange"
        @again="onAgain"
      />
      <HistoryView v-else @view="onViewRecord" @cast-again="onAgain" />
    </main>

    <footer class="app-footer">仅供传统文化学习与娱乐参考</footer>
  </div>
</template>
