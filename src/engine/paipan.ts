import type { Hexagram } from '@/data'

import { calendarOf } from './calendar'
import type { CalendarResult } from './calendar'
import { movingLines, resolveHexagrams } from './hexagram'
import { najiaOf } from './najia'
import { fuShenOf, relativeOf, relativesOf, sixBeastsOf, yingPos } from './relatives'
import type { FuShen, Relative, SixBeast } from './relatives'

/** 单爻的完整盘面信息（对应需求 F03 / M02） */
export interface PaipanLine {
  /** 1 = 初爻 … 6 = 上爻 */
  position: number
  /** 本爻阴阳（true = 阳） */
  yang: boolean
  /** 是否动爻（爻值 6 老阴 / 9 老阳） */
  moving: boolean
  /** 纳甲干支 */
  najia: string
  /** 六亲 */
  relative: Relative
  /** 六兽（按日干起） */
  beast: SixBeast
  /** 世爻 */
  isWorld: boolean
  /** 应爻 */
  isYing: boolean
  /** 爻支落旬空（空亡） */
  isXunKong: boolean
  /** 伏神（本卦缺亲时藏于本爻之下） */
  fuShen: FuShen | null
  /** 变出之爻的干支（仅动爻有值；六亲按本卦宫推） */
  bianNajia: string | null
  /** 变出之爻的六亲（仅动爻有值） */
  bianRelative: Relative | null
}

/** 完整排盘 */
export interface Paipan {
  calendar: CalendarResult
  /** 本卦 */
  ben: Hexagram
  /** 变卦（无动爻为 null） */
  bian: Hexagram | null
  /** 六爻盘面，自下而上 */
  lines: PaipanLine[]
}

/**
 * 排盘编排：爻值序列 + 起卦时刻 → 完整盘面（F03）。
 * 时刻按北京时间解释；晚子时规则见 calendar（E04）。
 */
export function paipan(lines: readonly number[], castAt: Date): Paipan {
  const { ben, bian } = resolveHexagrams(lines)
  const calendar = calendarOf(castAt)
  const najia = najiaOf(ben)
  const bianNajia = bian ? najiaOf(bian) : null
  /** 变出之爻的六亲按本卦宫推（排盘惯例） */
  const bianRelatives = bianNajia
    ? bianNajia.map((gz) => relativeOf(ben.palace, gz[1]))
    : null
  const relatives = relativesOf(ben)
  const beasts = sixBeastsOf(calendar.pillars.day[0])
  const ying = yingPos(ben.worldPos)
  const fuShen = fuShenOf(ben)
  const kong = new Set(calendar.xunKong)
  const moving = new Set(movingLines(lines))

  const paipanLines: PaipanLine[] = ben.binaryKey.split('').map((bit, i) => {
    const gz = najia[i]
    const isMoving = moving.has(i)
    return {
      position: i + 1,
      yang: bit === '1',
      moving: isMoving,
      najia: gz,
      relative: relatives[i],
      beast: beasts[i],
      isWorld: ben.worldPos === i + 1,
      isYing: ying === i + 1,
      isXunKong: kong.has(gz[1]),
      fuShen: fuShen.get(i) ?? null,
      bianNajia: isMoving && bianNajia ? bianNajia[i] : null,
      bianRelative: isMoving && bianRelatives ? bianRelatives[i] : null,
    }
  })

  return { calendar, ben, bian, lines: paipanLines }
}
