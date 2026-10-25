import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { hexagrams } from '@/data'
import { fuShenOf, relativesOf, sixBeastsOf, yingPos } from '@/engine/relatives'

interface ExpectedEntry {
  qin6: string[]
  world: number
  ying: number
  fuShen: Record<string, { ganZhi: string; relative: string }>
}

/** 参照数据：bopo/najia 2.0.1 生成（64 卦六亲/世应/伏神 + 六种日干六兽） */
const expected = JSON.parse(
  readFileSync(resolve(__dirname, '../fixtures/relatives-expected.json'), 'utf-8'),
) as { hexagrams: Record<string, ExpectedEntry>; god6ByDayGan: Record<string, string[]> }

describe('六亲：64 卦与 najia 参照全量比对', () => {
  it('8 宫 × 8 卦逐爻一致', () => {
    for (const hex of hexagrams) {
      expect(relativesOf(hex), hex.name).toEqual(expected.hexagrams[hex.name].qin6)
    }
  })

  it('手工锚点：天风姤（乾宫金）', () => {
    const gou = hexagrams.find((h) => h.name === '天风姤')!
    // 辛丑土父母、辛亥水子孙、辛酉金兄弟、壬午火官鬼、壬申金兄弟、壬戌土父母
    expect(relativesOf(gou)).toEqual(['父母', '子孙', '兄弟', '官鬼', '兄弟', '父母'])
  })
})

describe('世应', () => {
  it('64 卦世应与 najia 一致，且应爻 = 世爻隔三位', () => {
    for (const hex of hexagrams) {
      const e = expected.hexagrams[hex.name]
      expect(hex.worldPos, hex.name).toBe(e.world)
      expect(yingPos(hex.worldPos), hex.name).toBe(e.ying)
    }
  })

  it('应位换算抽查', () => {
    expect(yingPos(6)).toBe(3)
    expect(yingPos(1)).toBe(4)
    expect(yingPos(3)).toBe(6)
    expect(yingPos(4)).toBe(1)
  })
})

describe('六兽：按日干起（与 najia 六种日干比对）', () => {
  it('甲/丙/戊/己/庚/壬 六种起法一致', () => {
    for (const [gan, beasts] of Object.entries(expected.god6ByDayGan)) {
      expect(sixBeastsOf(gan), gan).toEqual(beasts)
    }
  })

  it('序列环排：壬日起玄武，接青龙朱雀…', () => {
    expect(sixBeastsOf('壬')).toEqual(['玄武', '青龙', '朱雀', '勾陈', '螣蛇', '白虎'])
    expect(sixBeastsOf('癸')).toEqual(sixBeastsOf('壬'))
    expect(sixBeastsOf('甲')).toEqual(['青龙', '朱雀', '勾陈', '螣蛇', '白虎', '玄武'])
  })

  it('非法日干抛错', () => {
    expect(() => sixBeastsOf('X')).toThrow()
  })
})

describe('伏神：从卦宫首卦借爻', () => {
  it('64 卦伏神位置与干支与 najia 全量一致（含缺一亲 32 卦、缺两亲 12 卦）', () => {
    let withFu = 0
    let missingTwo = 0
    for (const hex of hexagrams) {
      const e = expected.hexagrams[hex.name].fuShen
      const actual = fuShenOf(hex)
      expect(Object.fromEntries(actual), hex.name).toEqual(e)
      if (actual.size > 0) withFu++
      if (actual.size === 2) missingTwo++
    }
    expect(withFu).toBe(44) // 64 - 8 首卦 - 12 不缺亲
    expect(missingTwo).toBe(12)
  })

  it('首卦无伏神', () => {
    const qian = hexagrams.find((h) => h.name === '乾为天')!
    expect(fuShenOf(qian).size).toBe(0)
  })

  it('天风姤缺妻财 → 二爻下伏首卦甲寅木（妻财）', () => {
    const gou = hexagrams.find((h) => h.name === '天风姤')!
    const fu = fuShenOf(gou)
    expect(fu.get(1)).toEqual({ ganZhi: '甲寅', relative: '妻财' })
  })

  it('风泽中孚缺子孙与妻财两亲 → 三爻伏丙申金子孙、五爻伏丙子水妻财', () => {
    const zhongfu = hexagrams.find((h) => h.name === '风泽中孚')!
    const fu = fuShenOf(zhongfu)
    expect(fu.get(2)).toEqual({ ganZhi: '丙申', relative: '子孙' })
    expect(fu.get(4)).toEqual({ ganZhi: '丙子', relative: '妻财' })
  })
})
