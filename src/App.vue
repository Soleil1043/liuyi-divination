<script setup lang="ts">
import { ref } from 'vue'

import CastView from './ui/views/CastView.vue'
import HistoryView from './ui/views/HistoryView.vue'
import ResultView from './ui/views/ResultView.vue'

type ViewId = 'casting' | 'result' | 'history'

const currentView = ref<ViewId>('casting')
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <h1 class="app-title">静爻</h1>
      <nav class="app-nav">
        <button :class="{ active: currentView === 'casting' }" @click="currentView = 'casting'">
          摇卦
        </button>
        <!-- 「结果」入口为临时占位，T011/T012 接通摇卦流程后移除 -->
        <button :class="{ active: currentView === 'result' }" @click="currentView = 'result'">
          结果
        </button>
        <button :class="{ active: currentView === 'history' }" @click="currentView = 'history'">
          历史
        </button>
      </nav>
    </header>

    <main class="app-main">
      <CastView v-if="currentView === 'casting'" />
      <ResultView v-else-if="currentView === 'result'" />
      <HistoryView v-else />
    </main>

    <footer class="app-footer">仅供传统文化学习与娱乐参考</footer>
  </div>
</template>
