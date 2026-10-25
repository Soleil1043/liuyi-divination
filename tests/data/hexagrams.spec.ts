import { describe, expect, it } from 'vitest'

import { hexagramByBinaryKey, hexagrams } from '@/data'
import type { Hexagram } from '@/data'

// 以下知识表在测试文件中独立重录（与 hexagrams.json 分开录入），用于交叉校验数据文件的手误。

/** 八经卦：象名 → 三位爻（自下而上，1=阳 0=阴） */
const TRIGRAM_BITS: Record<string, string> = {
  天: '111',
  地: '000',
  雷: '100',
  水: '010',
  山: '001',
  风: '011',
  火: '101',
  泽: '110',
}

/** 京房八宫卦序：宫名 → 宫内 8 卦名（0 本宫 … 6 游魂、7 归魂） */
const PALACE_TABLE: Record<string, string[]> = {
  乾: ['乾为天', '天风姤', '天山遁', '天地否', '风地观', '山地剥', '火地晋', '火天大有'],
  坎: ['坎为水', '水泽节', '水雷屯', '水火既济', '泽火革', '雷火丰', '地火明夷', '地水师'],
  艮: ['艮为山', '山火贲', '山天大畜', '山泽损', '火泽睽', '天泽履', '风泽中孚', '风山渐'],
  震: ['震为雷', '雷地豫', '雷水解', '雷风恒', '地风升', '水风井', '泽风大过', '泽雷随'],
  巽: ['巽为风', '风天小畜', '风火家人', '风雷益', '天雷无妄', '火雷噬嗑', '山雷颐', '山风蛊'],
  离: ['离为火', '火山旅', '火风鼎', '火水未济', '山水蒙', '风水涣', '天水讼', '天火同人'],
  坤: ['坤为地', '地雷复', '地泽临', '地天泰', '雷天大壮', '泽天夬', '水天需', '水地比'],
  兑: ['兑为泽', '泽水困', '泽地萃', '泽山咸', '水山蹇', '地山谦', '雷山小过', '雷泽归妹'],
}

/** 宫内序 → 世爻位置（本宫世 6；一至五世 1–5；游魂 4；归魂 3） */
const WORLD_POS_BY_PALACE_INDEX = [6, 1, 2, 3, 4, 5, 4, 3]

/** 文王卦序 → 卦名（全量独立重录，校验 number/name 对应） */
const KING_WEN_NAMES = [
  '乾为天', '坤为地', '水雷屯', '山水蒙', '水天需', '天水讼', '地水师', '水地比',
  '风天小畜', '天泽履', '地天泰', '天地否', '天火同人', '火天大有', '地山谦', '雷地豫',
  '泽雷随', '山风蛊', '地泽临', '风地观', '火雷噬嗑', '山火贲', '山地剥', '地雷复',
  '天雷无妄', '山天大畜', '山雷颐', '泽风大过', '坎为水', '离为火', '泽山咸', '雷风恒',
  '天山遁', '雷天大壮', '火地晋', '地火明夷', '风火家人', '火泽睽', '水山蹇', '雷水解',
  '山泽损', '风雷益', '泽天夬', '天风姤', '泽地萃', '地风升', '泽水困', '水风井',
  '泽火革', '火风鼎', '震为雷', '艮为山', '风山渐', '雷泽归妹', '雷火丰', '火山旅',
  '巽为风', '兑为泽', '风水涣', '水泽节', '风泽中孚', '雷山小过', '水火既济', '火水未济',
]

function byName(name: string): Hexagram {
  const h = hexagrams.find((x) => x.name === name)
  expect(h, `缺少卦：${name}`).toBeTruthy()
  return h as Hexagram
}

describe('卦典数据完整性', () => {
  it('共 64 卦，number 为 1..64 且与文王卦序卦名一一对应', () => {
    expect(hexagrams).toHaveLength(64)
    expect(new Set(hexagrams.map((h) => h.number)).size).toBe(64)
    hexagrams.forEach((h, i) => {
      expect(h.number).toBe(i + 1)
      expect(h.name, `第 ${h.number} 卦`).toBe(KING_WEN_NAMES[i])
    })
  })

  it('每卦有非空卦辞与 6 条非空爻辞，总计 384 条爻辞', () => {
    let total = 0
    for (const h of hexagrams) {
      expect(h.guaci.origin.length, `${h.name} 卦辞`).toBeGreaterThan(0)
      expect(h.yaoci, h.name).toHaveLength(6)
      h.yaoci.forEach((y, i) => {
        expect(y.origin.length, `${h.name} 第${i + 1}爻`).toBeGreaterThan(0)
      })
      total += h.yaoci.length
    }
    expect(total).toBe(384)
  })

  it('乾有用九、坤有用六，其余 special 为 null', () => {
    const qian = byName('乾为天')
    const kun = byName('坤为地')
    expect(qian.special?.kind).toBe('yongjiu')
    expect(qian.special?.text.origin).toContain('群龙无首')
    expect(kun.special?.kind).toBe('yongliu')
    expect(kun.special?.text.origin).toContain('利永贞')
    for (const h of hexagrams) {
      if (h.number !== 1 && h.number !== 2) {
        expect(h.special, h.name).toBeNull()
      }
    }
  })

  it('binaryKey 唯一、格式合法，且与上下卦爻值一致', () => {
    expect(new Set(hexagrams.map((h) => h.binaryKey)).size).toBe(64)
    for (const h of hexagrams) {
      expect(h.binaryKey, h.name).toMatch(/^[01]{6}$/)
      expect(h.binaryKey, h.name).toBe(TRIGRAM_BITS[h.lower] + TRIGRAM_BITS[h.upper])
      expect(hexagramByBinaryKey.get(h.binaryKey)?.name, h.name).toBe(h.name)
    }
  })

  it('卦宫、宫内序、世爻位置与八宫表一致', () => {
    for (const [palace, names] of Object.entries(PALACE_TABLE)) {
      names.forEach((name, palaceIndex) => {
        const h = byName(name)
        expect(h.palace, name).toBe(palace)
        expect(h.palaceIndex, name).toBe(palaceIndex)
        expect(h.worldPos, name).toBe(WORLD_POS_BY_PALACE_INDEX[palaceIndex])
      })
    }
  })

  it('爻辞爻题（初九/六二/上九…）与 binaryKey 爻位阴阳一致', () => {
    const positions = ['初', '二', '三', '四', '五', '上']
    for (const h of hexagrams) {
      h.yaoci.forEach((y, i) => {
        const yang = h.binaryKey[i] === '1'
        const yinYang = yang ? '九' : '六'
        const expected =
          i === 0 || i === 5 ? `${positions[i]}${yinYang}` : `${yinYang}${positions[i]}`
        expect(y.origin.slice(0, 2), `${h.name} 第${i + 1}爻爻题`).toBe(expected)
      })
    }
  })
})
