<script setup lang="ts">
import { computed } from 'vue'

import type { Paipan } from '@/engine/paipan'

const props = defineProps<{ pan: Paipan }>()

/** 表格行自上而下（上爻在第一行） */
const reversedLines = computed(() => [...props.pan.lines].reverse())

const pillarsText = computed(() => {
  const p = props.pan.calendar.pillars
  return `${p.year}年 ${p.month}月 ${p.day}日 ${p.hour}时`
})

function movingMark(v: '老阳' | '老阴'): string {
  return v === '老阳' ? '○' : '×'
}
</script>

<template>
  <div class="paipan">
    <div class="meta">
      <span class="time">{{ pan.calendar.beijingText }}</span>
      <span class="pillars">{{ pillarsText }}</span>
      <span class="kong">旬空：{{ pan.calendar.xunKong.join(' ') }}</span>
    </div>

    <table>
      <thead>
        <tr>
          <th class="beast-col">六神</th>
          <th>
            <span class="gua-name">{{ pan.ben.name }}</span>
            <small>（{{ pan.ben.palace }}宫）</small>
          </th>
          <th class="symbol-col">爻象</th>
          <th v-if="pan.bian" class="bian-col">
            <span class="gua-name">{{ pan.bian.name }}</span>
            <small>（变卦）</small>
          </th>
        </tr>
      </thead>
      <tbody>
        <template v-for="line in reversedLines" :key="line.position">
          <tr>
            <td class="beast-col">{{ line.beast }}</td>
            <td>
              <span
                v-if="line.isWorld || line.isYing"
                class="world-ying"
                :class="{ world: line.isWorld }"
              >
                {{ line.isWorld ? '世' : '应' }}
              </span>
              <span class="relative">{{ line.relative }}</span>
              <span class="najia">{{ line.najia }}</span>
              <span v-if="line.isXunKong" class="kong-mark">空</span>
              <span v-if="line.moving" class="moving-mark">
                {{ line.yang ? movingMark('老阳') : movingMark('老阴') }}
              </span>
              <div v-if="line.fuShen" class="fu-shen">
                伏 {{ line.fuShen.relative }} {{ line.fuShen.ganZhi }}
              </div>
            </td>
            <td class="symbol-col">
              <span class="mini-line" :class="{ yang: line.yang }">
                <i /><i v-if="!line.yang" />
              </span>
            </td>
            <td v-if="pan.bian" class="bian-col">
              <template v-if="line.moving && line.bianRelative && line.bianNajia">
                <span class="arrow">→</span>
                <span class="relative">{{ line.bianRelative }}</span>
                <span class="najia">{{ line.bianNajia }}</span>
              </template>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.paipan {
  background: var(--color-panel);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-panel);
  padding: 16px 18px;
  overflow-x: auto;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 18px;
  font-size: 0.85rem;
  color: var(--color-paper-dim);
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-line);
  margin-bottom: 8px;
}

.time {
  color: var(--color-gold);
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

th {
  text-align: left;
  font-weight: 600;
  color: var(--color-gold);
  letter-spacing: 0.15em;
  padding: 8px 6px;
  border-bottom: 1px solid var(--color-line);
  white-space: nowrap;
}

th small {
  color: var(--color-paper-dim);
  font-weight: 400;
}

td {
  padding: 9px 6px;
  border-bottom: 1px solid rgba(201, 165, 92, 0.1);
  vertical-align: top;
}

tbody tr:last-child td {
  border-bottom: none;
}

.beast-col {
  width: 3.5em;
  color: var(--color-paper-dim);
  white-space: nowrap;
}

.symbol-col {
  width: 64px;
}

.bian-col {
  white-space: nowrap;
  color: var(--color-gold);
}

.world-ying {
  display: inline-block;
  margin-right: 6px;
  padding: 0 5px;
  border: 1px solid var(--color-cinnabar);
  border-radius: 4px;
  color: var(--color-cinnabar);
  font-size: 0.8rem;
}

.world {
  border-color: var(--color-gold-bright);
  color: var(--color-gold-bright);
}

.relative {
  margin-right: 6px;
}

.najia {
  color: var(--color-paper-dim);
}

.kong-mark {
  margin-left: 6px;
  color: var(--color-cinnabar);
  font-size: 0.8rem;
}

.moving-mark {
  margin-left: 6px;
  color: var(--color-cinnabar);
  font-weight: 700;
}

.fu-shen {
  margin-top: 3px;
  font-size: 0.8rem;
  color: var(--color-paper-dim);
}

.arrow {
  margin-right: 6px;
  opacity: 0.7;
}

.mini-line {
  display: inline-flex;
  gap: 5px;
  vertical-align: middle;
}

.mini-line i {
  display: block;
  width: 26px;
  height: 6px;
  border-radius: 3px;
  background: var(--color-gold);
}

.mini-line:not(.yang) i {
  width: 16px;
}
</style>
