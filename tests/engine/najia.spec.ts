import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { hexagrams } from '@/data'
import {
  isValidLines,
  linesToBinaryKey,
  movingLines,
  resolveHexagrams,
  transformedBinaryKey,
} from '@/engine/hexagram'
import { najiaOf } from '@/engine/najia'

/** 参照数据：由 bopo/najia 2.0.1（Python，MIT）生成，覆盖全部 64 卦 */
const expected = JSON.parse(
  readFileSync(resolve(__dirname, '../fixtures/najia-expected.json'), 'utf-8'),
) as Record<string, string[]>

describe('爻值序列与卦的映射', () => {
  it('全静 → 本卦即乾为天，无动爻无变卦', () => {
    const lines = [7, 7, 7, 7, 7, 7]
    expect(linesToBinaryKey(lines)).toBe('111111')
    expect(movingLines(lines)).toEqual([])
    expect(transformedBinaryKey(lines)).toBeNull()
    const { ben, bian } = resolveHexagrams(lines)
    expect(ben.name).toBe('乾为天')
    expect(bian).toBeNull()
  })

  it('天风姤（下巽上乾）+ 初爻老阴动 → 变卦乾为天', () => {
    const lines = [6, 7, 7, 7, 7, 7]
    expect(linesToBinaryKey(lines)).toBe('011111')
    expect(movingLines(lines)).toEqual([0])
    expect(transformedBinaryKey(lines)).toBe('111111')
    const { ben, bian } = resolveHexagrams(lines)
    expect(ben.name).toBe('天风姤')
    expect(bian?.name).toBe('乾为天')
  })

  it('坤全动（六老阴）→ 变卦乾；乾全动（六老阳）→ 变卦坤', () => {
    expect(resolveHexagrams([6, 6, 6, 6, 6, 6]).bian?.name).toBe('乾为天')
    expect(resolveHexagrams([9, 9, 9, 9, 9, 9]).bian?.name).toBe('坤为地')
  })

  it('多动爻：水火既济初三五爻老阳动 → 变卦坤为地（静爻不变）', () => {
    // 既济 binaryKey 101010；初/三/五为老阳 9（动），二/四/六为少阴 8（静）
    const lines = [9, 8, 9, 8, 9, 8]
    expect(movingLines(lines)).toEqual([0, 2, 4])
    const { ben, bian } = resolveHexagrams(lines)
    expect(ben.name).toBe('水火既济')
    expect(bian?.name).toBe('坤为地')
  })

  it('非法爻值序列抛错', () => {
    expect(isValidLines([7, 7, 7])).toBe(false)
    expect(() => linesToBinaryKey([7, 7, 7, 7, 7, 5])).toThrow()
  })
})

describe('纳甲装卦：全部 64 卦与 najia 参照实现逐爻比对', () => {
  it('8 宫 × 8 卦全量一致', () => {
    expect(Object.keys(expected)).toHaveLength(64)
    for (const hex of hexagrams) {
      expect(najiaOf(hex), hex.name).toEqual(expected[hex.name])
    }
  })

  it('八纯卦抽查', () => {
    const byName = (name: string) => hexagrams.find((h) => h.name === name)!
    expect(najiaOf(byName('乾为天'))).toEqual(['甲子', '甲寅', '甲辰', '壬午', '壬申', '壬戌'])
    expect(najiaOf(byName('坤为地'))).toEqual(['乙未', '乙巳', '乙卯', '癸丑', '癸亥', '癸酉'])
    expect(najiaOf(byName('天风姤'))).toEqual(['辛丑', '辛亥', '辛酉', '壬午', '壬申', '壬戌'])
  })
})
