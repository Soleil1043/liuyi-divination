<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { isAvailable, list, remove } from '@/storage/records'
import type { HexagramRecord } from '@/storage/records'

import RecordList from '../components/RecordList.vue'

const emit = defineEmits<{
  /** 回看某条卦例详情 */
  view: [HexagramRecord]
  /** 去摇一卦 */
  castAgain: []
}>()

const records = ref<HexagramRecord[]>([])
const available = ref(true)

onMounted(() => {
  available.value = isAvailable()
  records.value = list()
})

function onRemove(id: string): void {
  remove(id)
  records.value = list()
}
</script>

<template>
  <section class="history-view">
    <!-- E06：存储不可用降级提示 -->
    <div v-if="!available" class="degraded">
      当前浏览器无法保存历史（存储不可用），摇卦与解读不受影响。
    </div>

    <template v-else>
      <div v-if="records.length === 0" class="empty">
        <p>还没有卦例</p>
        <button class="primary-btn" type="button" @click="emit('castAgain')">去摇一卦</button>
      </div>

      <div v-else class="record-list">
        <RecordList
          v-for="record in records"
          :key="record.id"
          :record="record"
          @view="emit('view', record)"
          @remove="onRemove(record.id)"
        />
      </div>
    </template>
  </section>
</template>

<style scoped>
.history-view {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 8px 0 24px;
}

.degraded {
  background: var(--color-panel);
  border: 1px dashed var(--color-cinnabar);
  border-radius: var(--radius-panel);
  padding: 24px;
  text-align: center;
  color: var(--color-paper-dim);
  font-size: 0.9rem;
  line-height: 1.7;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  padding: 64px 0;
  color: var(--color-paper-dim);
  letter-spacing: 0.2em;
}

.empty p {
  margin: 0;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
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
