import { hexagrams } from '@/data'
import type { Hexagram, PalaceName } from '@/data'

import { najiaOf } from './najia'

/** 六亲 */
export type Relative = '父母' | '兄弟' | '子孙' | '妻财' | '官鬼'

/** 六兽（六神） */
export type SixBeast = '青龙' | '朱雀' | '勾陈' | '螣蛇' | '白虎' | '玄武'

/** 伏神：藏于某爻之下的首卦借爻 */
export interface FuShen {
  ganZhi: string
  relative: Relative
}

type Element = '金' | '木' | '水' | '火' | '土'

/** 八宫五行 */
const PALACE_ELEMENT: Record<PalaceName, Element> = {
  乾: '金',
  兑: '金',
  震: '木',
  巽: '木',
  坎: '水',
  离: '火',
  艮: '土',
  坤: '土',
}

/** 地支五行 */
const BRANCH_ELEMENT: Record<string, Element> = {
  子: '水',
  亥: '水',
  寅: '木',
  卯: '木',
  巳: '火',
  午: '火',
  申: '金',
  酉: '金',
  辰: '土',
  戌: '土',
  丑: '土',
  未: '土',
}

/** 五行相生：生者 → 被生者 */
const GENERATES: Record<Element, Element> = { 金: '水', 水: '木', 木: '火', 火: '土', 土: '金' }

/** 五行相克：克者 → 被克者 */
const CONQUERS: Record<Element, Element> = { 金: '木', 木: '土', 土: '水', 水: '火', 火: '金' }

/** 六亲推演：以卦宫五行为「我」，看爻支五行与我的生克关系 */
export function relativeOf(palace: PalaceName, branch: string): Relative {
  const me = PALACE_ELEMENT[palace]
  const it = BRANCH_ELEMENT[branch]
  if (it === me) return '兄弟'
  if (GENERATES[me] === it) return '子孙' // 我生者
  if (GENERATES[it] === me) return '父母' // 生我者
  if (CONQUERS[me] === it) return '妻财' // 我克者
  return '官鬼' // 克我者
}

/** 某卦六爻的六亲（自下而上） */
export function relativesOf(hex: Hexagram): Relative[] {
  return najiaOf(hex).map((gz) => relativeOf(hex.palace, gz[1]))
}

/** 六兽起法：按日干定初爻六兽，再按青龙→朱雀→勾陈→螣蛇→白虎→玄武顺排 */
const BEAST_CYCLE: SixBeast[] = ['青龙', '朱雀', '勾陈', '螣蛇', '白虎', '玄武']

/** 日干 → 初爻六兽在 BEAST_CYCLE 中的起始下标 */
const BEAST_START_BY_GAN: Record<string, number> = {
  甲: 0,
  乙: 0,
  丙: 1,
  丁: 1,
  戊: 2,
  己: 3,
  庚: 4,
  辛: 4,
  壬: 5,
  癸: 5,
}

/** 日干（天干字符）→ 六爻六兽（自下而上） */
export function sixBeastsOf(dayGan: string): SixBeast[] {
  const start = BEAST_START_BY_GAN[dayGan]
  if (start === undefined) throw new Error(`invalid day gan: ${dayGan}`)
  return Array.from({ length: 6 }, (_, i) => BEAST_CYCLE[(start + i) % 6])
}

/** 应爻位置（1–6）：世爻隔三位 */
export function yingPos(worldPos: number): number {
  if (worldPos < 1 || worldPos > 6) throw new Error(`invalid worldPos: ${worldPos}`)
  return worldPos <= 3 ? worldPos + 3 : worldPos - 3
}

/** 首卦（本宫卦）：同宫 palaceIndex 为 0 的卦 */
function palaceHeadOf(hex: Hexagram): Hexagram {
  const head = hexagrams.find((h) => h.palace === hex.palace && h.palaceIndex === 0)
  if (!head) throw new Error(`no palace head for ${hex.palace}`)
  return head
}

/**
 * 伏神：非首卦若缺某类六亲，从首卦借该六亲所在之爻，伏于相同爻位之下。
 * 返回 Map<爻位下标 0–5, 伏神>；首卦或不缺亲时为空 Map。
 */
export function fuShenOf(hex: Hexagram): Map<number, FuShen> {
  const result = new Map<number, FuShen>()
  if (hex.palaceIndex === 0) return result
  const own = new Set(relativesOf(hex))
  const head = palaceHeadOf(hex)
  const headRelatives = relativesOf(head)
  const headNajia = najiaOf(head)
  for (const relative of ['父母', '兄弟', '子孙', '妻财', '官鬼'] as Relative[]) {
    if (own.has(relative)) continue
    headRelatives.forEach((r, i) => {
      if (r === relative) result.set(i, { ganZhi: headNajia[i], relative })
    })
  }
  return result
}
