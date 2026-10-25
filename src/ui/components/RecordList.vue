<script setup lang="ts">
import { computed, ref } from 'vue'

import { resolveHexagrams } from '@/engine/hexagram'
import type { HexagramRecord } from '@/storage/records'

const props = defineProps<{ record: HexagramRecord }>()

const emit = defineEmits<{
  /** 回看详情 */
  view: []
  /** 确认删除（父级执行 remove 后刷新列表） */
  remove: []
}>()

const confirming = ref(false)

const hexagramName = computed(() => resolveHexagrams(props.record.lines).ben.name)
const movingCount = computed(() => props.record.lines.filter((v) => v === 6 || v === 9).length)

function formatTime(iso: string): string {
  const d = new Date(iso)
  const pad = (x: number) => String(x).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
</script>

<template>
  <div class="record-card" @click="emit('view')">
    <div class="record-head">
      <span class="gua-name">{{ hexagramName }}</span>
      <span class="moving-info">{{ movingCount === 0 ? '六爻安静' : `${movingCount} 动` }}</span>
      <span class="time">{{ formatTime(record.castAt) }}</span>
    </div>
    <p class="question">{{ record.question }}</p>
    <div class="record-actions" @click.stop>
      <template v-if="!confirming">
        <button class="link-btn danger" type="button" @click="confirming = true">删除</button>
      </template>
      <template v-else>
        <span class="confirm-tip">确认删除这条卦例？</span>
        <button class="link-btn danger solid" type="button" @click="emit('remove')">
          确认删除
        </button>
        <button class="link-btn" type="button" @click="confirming = false">取消</button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.record-card {
  background: var(--color-panel);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-panel);
  padding: 14px 18px;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.record-card:hover {
  border-color: var(--color-gold);
  box-shadow: 0 0 16px rgba(201, 165, 92, 0.12);
}

.record-head {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.gua-name {
  color: var(--color-gold-bright);
  font-size: 1.05rem;
  letter-spacing: 0.2em;
}

.moving-info {
  font-size: 0.78rem;
  color: var(--color-cinnabar);
}

.time {
  margin-left: auto;
  font-size: 0.78rem;
  color: var(--color-paper-dim);
}

.question {
  margin: 8px 0 4px;
  color: var(--color-paper);
  font-size: 0.95rem;
  line-height: 1.6;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.record-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: flex-end;
  min-height: 1.4em;
}

.link-btn {
  appearance: none;
  background: none;
  border: none;
  padding: 0;
  font-family: inherit;
  font-size: 0.8rem;
  color: var(--color-paper-dim);
  cursor: pointer;
}

.link-btn.danger {
  color: var(--color-cinnabar);
  opacity: 0.8;
}

.link-btn.danger:hover {
  opacity: 1;
  text-decoration: underline;
}

.link-btn.danger.solid {
  border: 1px solid var(--color-cinnabar);
  border-radius: 4px;
  padding: 2px 8px;
  opacity: 1;
}

.confirm-tip {
  font-size: 0.8rem;
  color: var(--color-paper-dim);
}
</style>
