import { describe, expect, it } from 'vitest'

import { getCitations } from '@/engine/biangua'

describe('朱熹变占法取辞（0–6 动爻全覆盖，E05）', () => {
  it('0 动爻：乾全静 → 本卦卦辞', () => {
    const c = getCitations([7, 7, 7, 7, 7, 7])
    expect(c).toHaveLength(1)
    expect(c[0]).toMatchObject({ kind: 'gua', hexagram: '乾为天', primary: true })
    expect(c[0].text.origin).toBe('乾：元，亨，利，贞。')
  })

  it('1 动爻：天风姤初爻动 → 姤初六爻辞', () => {
    const c = getCitations([6, 7, 7, 7, 7, 7])
    expect(c).toHaveLength(1)
    expect(c[0]).toMatchObject({ kind: 'yao', hexagram: '天风姤', position: 1, primary: true })
    expect(c[0].text.origin).toContain('系于金柅')
  })

  it('2 动爻：雷水解二五爻动 → 本卦两动爻爻辞，以上爻（六五）为主', () => {
    const c = getCitations([8, 9, 8, 7, 6, 8])
    expect(c).toHaveLength(2)
    expect(c[0]).toMatchObject({ kind: 'yao', hexagram: '雷水解', position: 2, primary: false })
    expect(c[1]).toMatchObject({ kind: 'yao', hexagram: '雷水解', position: 5, primary: true })
    expect(c[1].note).toBe('以上爻为主')
    expect(c[1].text.origin).toContain('君子维有解')
  })

  it('3 动爻：水火既济初三五动 → 本卦卦辞为主 + 变卦（坤为地）卦辞为参', () => {
    const c = getCitations([9, 8, 9, 8, 9, 8])
    expect(c).toHaveLength(2)
    expect(c[0]).toMatchObject({ kind: 'gua', hexagram: '水火既济', primary: true })
    expect(c[1]).toMatchObject({ kind: 'gua', hexagram: '坤为地', primary: false })
    expect(c[0].text.origin).toContain('初吉终乱')
  })

  it('4 动爻：泽天夬初二三四动 → 变卦（坤为地）五上两不变爻爻辞，以下爻为主', () => {
    // 夬 binaryKey 111110，初二三四动 → 变卦 000000 坤为地；不变爻为五、上
    const c = getCitations([9, 9, 9, 9, 8, 8])
    expect(c).toHaveLength(2)
    expect(c[0]).toMatchObject({ kind: 'yao', hexagram: '坤为地', position: 5, primary: true })
    expect(c[0].note).toBe('以下爻为主')
    expect(c[1]).toMatchObject({ kind: 'yao', hexagram: '坤为地', position: 6, primary: false })
    expect(c[0].text.origin).toContain('黄裳')
    expect(c[1].text.origin).toContain('龙战于野')
  })

  it('5 动爻：乾为天初至五动、上爻少阳静 → 变卦（山地剥）唯一不变爻爻辞', () => {
    // [9,9,9,9,9,7]：binaryKey 111111 乾，初至五老阳动、上少阳静 → 变卦 000001 山地剥
    const c = getCitations([9, 9, 9, 9, 9, 7])
    expect(c).toHaveLength(1)
    expect(c[0]).toMatchObject({ kind: 'yao', hexagram: '山地剥', position: 6, primary: true })
    expect(c[0].text.origin).toContain('硕果不食')
  })

  it('6 动爻（乾）：用九', () => {
    const c = getCitations([9, 9, 9, 9, 9, 9])
    expect(c).toHaveLength(1)
    expect(c[0]).toMatchObject({ kind: 'yong', hexagram: '乾为天', primary: true })
    expect(c[0].text.origin).toContain('群龙无首')
  })

  it('6 动爻（坤）：用六', () => {
    const c = getCitations([6, 6, 6, 6, 6, 6])
    expect(c).toHaveLength(1)
    expect(c[0]).toMatchObject({ kind: 'yong', hexagram: '坤为地', primary: true })
    expect(c[0].text.origin).toContain('利永贞')
  })

  it('6 动爻（他卦）：火山旅全动 → 变卦（水泽节）卦辞', () => {
    // [6,6,9,9,6,9]：binaryKey 001101 火山旅，六爻皆动 → 变卦 110010 水泽节
    const c = getCitations([6, 6, 9, 9, 6, 9])
    expect(c).toHaveLength(1)
    expect(c[0]).toMatchObject({ kind: 'gua', hexagram: '水泽节', primary: true })
    expect(c[0].text.origin).toContain('苦节不可贞')
  })
})

describe('引文附带白话（F04）', () => {
  it('每条引文的白话非空', () => {
    const samples: number[][] = [
      [7, 7, 7, 7, 7, 7],
      [6, 7, 7, 7, 7, 7],
      [8, 9, 8, 7, 6, 8],
      [9, 8, 9, 8, 9, 8],
      [9, 9, 9, 9, 8, 8],
      [9, 9, 9, 9, 9, 8],
      [9, 9, 9, 9, 9, 9],
      [6, 6, 6, 7, 7, 9],
    ]
    for (const lines of samples) {
      for (const c of getCitations(lines)) {
        expect(c.text.vernacular.length, `${c.hexagram} ${c.text.origin.slice(0, 8)}`).toBeGreaterThan(0)
      }
    }
  })
})
