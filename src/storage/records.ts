import type { YaoValue } from '@/engine/types'

/** 历史卦例记录（对应需求 F05；只存原始数据，展示时由排盘引擎重算） */
export interface HexagramRecord {
  id: string
  /** 所问之事（1–50 字符，摇前必填摇后可编辑） */
  question: string
  /** 六爻爻值（6/7/8/9，自下而上） */
  lines: YaoValue[]
  /** 起卦时刻（ISO 8601） */
  castAt: string
  /** 保存时刻（ISO 8601，列表排序用） */
  savedAt: string
}

const KEY = 'jingyao:records'

/** 生成记录 id（优先 crypto.randomUUID，非安全上下文回退） */
function newId(): string {
  const c = globalThis.crypto as { randomUUID?: () => string } | undefined
  return c?.randomUUID?.() ?? `r-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/** 探测 localStorage 可用性（E06：无痕模式/禁用存储时降级） */
function usableStorage(): Storage | null {
  try {
    const s = globalThis.localStorage
    if (!s) return null
    const probe = '__jingyao_probe__'
    s.setItem(probe, '1')
    s.removeItem(probe)
    return s
  } catch {
    return null
  }
}

export function isAvailable(): boolean {
  return usableStorage() !== null
}

/** 记录结构校验（防御存储中的脏数据/旧版本数据） */
function isRecord(v: unknown): v is HexagramRecord {
  if (typeof v !== 'object' || v === null) return false
  const r = v as Record<string, unknown>
  return (
    typeof r.id === 'string' &&
    typeof r.question === 'string' &&
    Array.isArray(r.lines) &&
    r.lines.length === 6 &&
    r.lines.every((x) => x === 6 || x === 7 || x === 8 || x === 9) &&
    typeof r.castAt === 'string' &&
    typeof r.savedAt === 'string'
  )
}

function readAll(s: Storage): HexagramRecord[] {
  try {
    const raw = s.getItem(KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isRecord).map((r) => ({ ...r, lines: r.lines as YaoValue[] }))
  } catch {
    // 损坏数据视为空库，不抛出（下次 save 会重写为合法 JSON）
    return []
  }
}

/** 全部卦例，按保存时间降序（新在前）；同毫秒写入时后保存的在前（CI 曾暴露同毫秒排序歧义） */
export function list(): HexagramRecord[] {
  const s = usableStorage()
  if (!s) return []
  return readAll(s)
    .map((record, index) => ({ record, index }))
    .sort((a, b) => b.record.savedAt.localeCompare(a.record.savedAt) || b.index - a.index)
    .map((x) => x.record)
}

/** 成卦自动保存（F05）；存储不可用返回 null（E06 降级） */
export function save(question: string, lines: YaoValue[], castAt: Date): HexagramRecord | null {
  const s = usableStorage()
  if (!s) return null
  const record: HexagramRecord = {
    id: newId(),
    question,
    lines: [...lines],
    castAt: castAt.toISOString(),
    savedAt: new Date().toISOString(),
  }
  const all = readAll(s)
  all.push(record)
  try {
    s.setItem(KEY, JSON.stringify(all))
  } catch {
    return null
  }
  return record
}

/** 编辑所问之事；成功返回 true */
export function update(id: string, question: string): boolean {
  const s = usableStorage()
  if (!s) return false
  const all = readAll(s)
  const target = all.find((r) => r.id === id)
  if (!target) return false
  target.question = question
  try {
    s.setItem(KEY, JSON.stringify(all))
  } catch {
    return false
  }
  return true
}

/** 删除卦例；成功返回 true */
export function remove(id: string): boolean {
  const s = usableStorage()
  if (!s) return false
  const all = readAll(s)
  const next = all.filter((r) => r.id !== id)
  if (next.length === all.length) return false
  try {
    s.setItem(KEY, JSON.stringify(next))
  } catch {
    return false
  }
  return true
}
