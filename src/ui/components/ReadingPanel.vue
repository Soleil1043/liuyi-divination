<script setup lang="ts">
import type { Citation } from '@/engine/biangua'

defineProps<{ citations: Citation[] }>()

const YAO_LABELS = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻']

function labelOf(c: Citation): string {
  if (c.kind === 'gua') return `${c.hexagram} · 卦辞`
  if (c.kind === 'yong') return `${c.hexagram} · ${c.hexagram === '乾为天' ? '用九' : '用六'}`
  return `${c.hexagram} · ${YAO_LABELS[(c.position ?? 1) - 1]}`
}
</script>

<template>
  <div class="reading">
    <h3>解读</h3>
    <article
      v-for="(c, i) in citations"
      :key="i"
      :class="c.primary ? 'primary' : 'secondary'"
    >
      <header>
        <span class="source">{{ labelOf(c) }}</span>
        <span v-if="c.note" class="note">{{ c.note }}</span>
      </header>
      <!-- F04：白话概括在前，原文片段在后 -->
      <p class="vernacular">{{ c.text.vernacular }}</p>
      <blockquote class="origin">{{ c.text.origin }}</blockquote>
    </article>
  </div>
</template>

<style scoped>
.reading {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

h3 {
  margin: 0;
  font-size: 1rem;
  letter-spacing: 0.4em;
  color: var(--color-gold);
  font-weight: 600;
}

article {
  background: var(--color-panel);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-panel);
  padding: 18px 20px;
}

article.primary {
  border-color: rgba(201, 165, 92, 0.45);
  box-shadow: 0 0 24px rgba(201, 165, 92, 0.08);
}

article.secondary {
  opacity: 0.82;
}

header {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 10px;
}

.source {
  font-size: 0.85rem;
  letter-spacing: 0.15em;
  color: var(--color-gold);
}

.note {
  font-size: 0.75rem;
  color: var(--color-paper-dim);
}

.vernacular {
  margin: 0 0 10px;
  font-size: 1.05rem;
  line-height: 1.8;
  color: var(--color-paper);
}

.origin {
  margin: 0;
  padding: 10px 14px;
  border-left: 2px solid var(--color-gold);
  background: rgba(201, 165, 92, 0.06);
  font-size: 0.9rem;
  line-height: 1.7;
  color: var(--color-paper-dim);
}
</style>
