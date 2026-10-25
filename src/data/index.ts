import raw from './hexagrams.json'

import type { Hexagram } from './types'

export const hexagrams: Hexagram[] = raw as unknown as Hexagram[]

/** binaryKey（六位 0/1，自下而上）→ 卦 */
export const hexagramByBinaryKey: ReadonlyMap<string, Hexagram> = new Map(
  hexagrams.map((h) => [h.binaryKey, h]),
)

export type { Hexagram, PalaceName, SpecialCi, TextPair, TrigramXiang } from './types'
