import raw from './hexagrams.json'
import xiangRaw from './xiang.json'
import vernacularRaw from './vernacular.json'

import type { Hexagram, TextPair, VernacularEntry } from './types'

/** hexagrams.json 的原始形态（vernacular 为空串、无 xiang，由 xiang.json 与 vernacular.json 合并填充） */
interface RawHexagram extends Omit<Hexagram, 'guaci' | 'yaoci' | 'special' | 'xiang'> {
  guaci: TextPair
  yaoci: TextPair[]
  special: { kind: 'yongjiu' | 'yongliu'; text: TextPair } | null
}

const rawHexagrams = raw as unknown as RawHexagram[]
/** 大象传原文（公版，繁体源逐条核对通行本后录入） */
const xiangOrigins = xiangRaw as unknown as Record<string, string>
const vernaculars = vernacularRaw as unknown as Record<string, VernacularEntry>

function withVernacular(origin: string, vernacular: string | undefined): TextPair {
  return { origin, vernacular: vernacular ?? '' }
}

/** 原文数据与白话译文在此合并为最终卦典（逻辑 schema 见 types.ts，Hexagram） */
export const hexagrams: Hexagram[] = rawHexagrams.map((h) => {
  const v = vernaculars[String(h.number)]
  return {
    ...h,
    guaci: withVernacular(h.guaci.origin, v?.guaci),
    xiang: withVernacular(xiangOrigins[String(h.number)] ?? '', v?.xiang),
    yaoci: h.yaoci.map((y, i) => withVernacular(y.origin, v?.yaoci[i])),
    special: h.special
      ? { kind: h.special.kind, text: withVernacular(h.special.text.origin, v?.special) }
      : null,
  }
})

/** binaryKey（六位 0/1，自下而上）→ 卦 */
export const hexagramByBinaryKey: ReadonlyMap<string, Hexagram> = new Map(
  hexagrams.map((h) => [h.binaryKey, h]),
)

export type { Hexagram, PalaceName, SpecialCi, TextPair, TrigramXiang } from './types'
