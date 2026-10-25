import { describe, expect, it } from 'vitest'

import { calendarOf } from '@/engine/calendar'

/**
 * 核对锚点来源：
 * - 1949-10-01 15:00 → 己丑/癸酉/甲子/壬申：著名历史锚点（开国大典甲子日申时）
 * - 2026-01-01 → 乙亥日：与天气网万年历 2026 年历一致；全年日柱自洽性经算术核对
 * - 2024-02-04 立春 16:27 → 年柱分界：与节气时刻精确吻合（10:00 癸卯 / 17:00 甲辰）
 * - 旬空由日柱六十甲子旬首推算，独立于库输出
 */
describe('calendarOf 四柱干支（权威锚点核对）', () => {
  it('1949-10-01 15:00 → 己丑年 癸酉月 甲子日 壬申时，旬空戌亥', () => {
    const r = calendarOf(new Date('1949-10-01T15:00:00+08:00'))
    expect(r.pillars).toEqual({ year: '己丑', month: '癸酉', day: '甲子', hour: '壬申' })
    expect(r.xunKong).toEqual(['戌', '亥'])
  })

  it('2026-10-25 14:00 → 丙午年 戊戌月 壬申日 丁未时，旬空戌亥', () => {
    const r = calendarOf(new Date('2026-10-25T14:00:00+08:00'))
    expect(r.pillars).toEqual({ year: '丙午', month: '戊戌', day: '壬申', hour: '丁未' })
    expect(r.xunKong).toEqual(['戌', '亥'])
  })

  it('2026-01-01 12:00 → 乙巳年 戊子月 乙亥日 壬午时，旬空申酉', () => {
    const r = calendarOf(new Date('2026-01-01T12:00:00+08:00'))
    expect(r.pillars).toEqual({ year: '乙巳', month: '戊子', day: '乙亥', hour: '壬午' })
    expect(r.xunKong).toEqual(['申', '酉'])
  })
})

describe('年柱立春分界（节气口径）', () => {
  it('2024-02-04 10:00（立春 16:27 前）→ 癸卯年 乙丑月', () => {
    const r = calendarOf(new Date('2024-02-04T10:00:00+08:00'))
    expect(r.pillars.year).toBe('癸卯')
    expect(r.pillars.month).toBe('乙丑')
  })

  it('2024-02-04 17:00（立春后）→ 甲辰年 丙寅月', () => {
    const r = calendarOf(new Date('2024-02-04T17:00:00+08:00'))
    expect(r.pillars.year).toBe('甲辰')
    expect(r.pillars.month).toBe('丙寅')
  })
})

describe('早晚子时规则（E04）', () => {
  it('晚子时 2026-10-25 23:30 → 日柱不进位（壬申），时柱为夜子时（壬子）', () => {
    const day = calendarOf(new Date('2026-10-25T23:30:00+08:00'))
    expect(day.pillars.day).toBe('壬申') // 与 25 日白天一致，不进位
    expect(day.pillars.hour).toBe('壬子') // 夜子时按次日（癸酉）日干起
  })

  it('早子时 2026-10-26 00:30 → 用新日柱（癸酉），时柱壬子', () => {
    const day = calendarOf(new Date('2026-10-26T00:30:00+08:00'))
    expect(day.pillars.day).toBe('癸酉')
    expect(day.pillars.hour).toBe('壬子')
  })
})

describe('时区确定性（CI 环境）', () => {
  it('同一瞬间以 UTC 与 +08:00 两种写法构造，结果完全一致', () => {
    const utc = calendarOf(new Date('2026-10-25T06:00:00Z')) // = 北京 14:00
    const beijing = calendarOf(new Date('2026-10-25T14:00:00+08:00'))
    expect(utc).toEqual(beijing)
  })

  it('beijingText 为北京时间展示值', () => {
    const r = calendarOf(new Date('2026-10-25T06:00:00Z'))
    expect(r.beijingText).toBe('2026-10-25 14:00')
  })
})

describe('旬空推算抽查（覆盖三种旬）', () => {
  it('甲子旬空戌亥、甲戌旬空申酉、甲午旬空辰巳', () => {
    const cases: Array<[string, string, [string, string]]> = [
      // [说明, 时刻, 期望旬空]；各时刻的日柱均已由锚点/探针核实
      ['甲子日（1949-10-01）', '1949-10-01T15:00:00+08:00', ['戌', '亥']],
      ['壬申日（2026-10-25）', '2026-10-25T14:00:00+08:00', ['戌', '亥']],
      ['癸酉日（2026-10-26 早子时）', '2026-10-26T00:30:00+08:00', ['戌', '亥']],
      ['乙亥日（2026-01-01）', '2026-01-01T12:00:00+08:00', ['申', '酉']],
      ['戊戌日（2024-02-04 立春前）', '2024-02-04T10:00:00+08:00', ['辰', '巳']],
      ['己亥日（2024-02-05）', '2024-02-05T10:00:00+08:00', ['辰', '巳']],
    ]
    for (const [label, iso, expected] of cases) {
      const r = calendarOf(new Date(iso))
      expect(r.xunKong, `${label} 实得 ${r.pillars.day}`).toEqual(expected)
    }
  })
})
