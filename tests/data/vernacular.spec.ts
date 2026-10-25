import { describe, expect, it } from 'vitest'

import { hexagrams } from '@/data'

describe('白话译文完整性', () => {
  it('每卦卦辞与 6 条爻辞的白话均非空（合计 64 + 384 条）', () => {
    let guaciCount = 0
    let yaociCount = 0
    for (const h of hexagrams) {
      expect(h.guaci.vernacular.length, `${h.name} 卦辞白话`).toBeGreaterThan(0)
      guaciCount++
      expect(h.yaoci, h.name).toHaveLength(6)
      h.yaoci.forEach((y, i) => {
        expect(y.vernacular.length, `${h.name} 第${i + 1}爻白话`).toBeGreaterThan(0)
        yaociCount++
      })
    }
    expect(guaciCount).toBe(64)
    expect(yaociCount).toBe(384)
  })

  it('乾坤用九/用六的白话非空（合计 450 条译文闭环）', () => {
    const qian = hexagrams.find((h) => h.number === 1)!
    const kun = hexagrams.find((h) => h.number === 2)!
    expect(qian.special?.text.vernacular.length).toBeGreaterThan(0)
    expect(kun.special?.text.vernacular.length).toBeGreaterThan(0)
  })

  it('译文不含常见混入的英文/繁体残留（抽样校验全部条目）', () => {
    for (const h of hexagrams) {
      const texts = [h.guaci.vernacular, ...h.yaoci.map((y) => y.vernacular)]
      if (h.special) texts.push(h.special.text.vernacular)
      for (const t of texts) {
        // 不应出现英文字母（含误粘的英文单词）
        expect(t, `${h.name} 译文含英文: ${t}`).not.toMatch(/[A-Za-z]/)
        // 不应出现常见繁体字残留（抽样黑名单）
        expect(t, `${h.name} 译文含繁体: ${t}`).not.toMatch(/[獲麼發裡後說時間動應來對與開關門書長樂萬億兩]/)
      }
    }
  })
})
