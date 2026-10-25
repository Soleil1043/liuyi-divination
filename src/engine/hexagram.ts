import { hexagramByBinaryKey, hexagrams } from '@/data'
import type { Hexagram } from '@/data'

import type { YaoValue } from './types'

/** 爻值序列（自下而上，6/7/8/9）是否合法 */
export function isValidLines(lines: readonly number[]): lines is number[] {
  return (
    Array.isArray(lines) &&
    lines.length === 6 &&
    lines.every((v) => v === 6 || v === 7 || v === 8 || v === 9)
  )
}

/** 爻值序列 → binaryKey（六位 0/1，自下而上；7/9 阳为 1，6/8 阴为 0） */
export function linesToBinaryKey(lines: readonly number[]): string {
  if (!isValidLines(lines)) throw new Error(`invalid lines: ${JSON.stringify(lines)}`)
  return lines.map((v) => (v === 7 || v === 9 ? '1' : '0')).join('')
}

/** 动爻位置（0 = 初爻 … 5 = 上爻；爻值为 6 老阴或 9 老阳则动） */
export function movingLines(lines: readonly number[]): number[] {
  return lines.map((v, i) => ((v === 6 || v === 9 ? i : -1))).filter((i) => i >= 0)
}

/** 变卦 binaryKey：老阳 9 → 阴、老阴 6 → 阳，静爻不变；无动爻返回 null（无变卦） */
export function transformedBinaryKey(lines: readonly number[]): string | null {
  const moving = movingLines(lines)
  if (moving.length === 0) return null
  return lines.map((v) => (v === 9 ? '0' : v === 6 ? '1' : v === 7 ? '1' : '0')).join('')
}

/** 爻值序列 → 本卦与变卦（变卦仅在有动爻时存在） */
export function resolveHexagrams(lines: readonly number[]): {
  ben: Hexagram
  bian: Hexagram | null
} {
  const ben = hexagramByBinaryKey.get(linesToBinaryKey(lines))
  if (!ben) throw new Error(`no hexagram for lines: ${JSON.stringify(lines)}`)
  const bianKey = transformedBinaryKey(lines)
  const bian = bianKey ? (hexagramByBinaryKey.get(bianKey) ?? null) : null
  if (bianKey && !bian) throw new Error(`no hexagram for bianKey: ${bianKey}`)
  return { ben, bian }
}

/** 全部 64 卦（按文王卦序） */
export function allHexagrams(): readonly Hexagram[] {
  return hexagrams
}

export type { Hexagram }
export type { YaoValue }
