import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { paipan } from '@/engine/paipan'
import { resolveHexagrams } from '@/engine/hexagram'
import type { FuShen } from '@/engine/relatives'

interface GoldenCase {
  label: string
  params: number[]
  date: string
  expected: {
    name: string
    gong: string
    gz: { year: string; month: string; day: string; hour: string }
    xkong: string
    god6: string[]
    qin6: string[]
    qinx: string[]
    world: number
    ying: number
    fuShen: Record<string, { ganZhi: string; relative: string }>
  }
}

/** golden 用例：bopo/najia 2.0.1 生成，覆盖多动爻/全静/全动/伏神(0/1/2)/三种旬空/晚早子时 */
const cases = JSON.parse(
  readFileSync(resolve(__dirname, '../fixtures/golden.json'), 'utf-8'),
) as GoldenCase[]

describe('排盘编排 golden 用例（与 najia 参照逐字段比对）', () => {
  it('共 12 例（验收要求 ≥10）', () => {
    expect(cases.length).toBeGreaterThanOrEqual(10)
  })

  for (const c of cases) {
    it(`【${c.label}】逐字段一致`, () => {
      const p = paipan(c.params, new Date(c.date))
      const e = c.expected

      // 本卦与卦宫
      expect(p.ben.name, '本卦名').toBe(e.name)
      expect(p.ben.palace, '卦宫').toBe(e.gong)

      // 四柱与旬空
      expect(p.calendar.pillars, '四柱').toEqual(e.gz)
      expect(p.calendar.xunKong.join(''), '旬空').toBe(e.xkong)

      // 六爻：六兽 / 纳甲 / 六亲 / 世应 / 空亡 / 伏神
      p.lines.forEach((line, i) => {
        expect(line.beast, `第${i + 1}爻六兽`).toBe(e.god6[i])
        expect(line.najia, `第${i + 1}爻纳甲`).toBe(e.qinx[i])
        expect(line.relative, `第${i + 1}爻六亲`).toBe(e.qin6[i])
      })
      const world = p.lines.find((l) => l.isWorld)
      const ying = p.lines.find((l) => l.isYing)
      expect(world?.position, '世爻').toBe(e.world)
      expect(ying?.position, '应爻').toBe(e.ying)

      const actualFu = Object.fromEntries(
        [...p.lines]
          .map((l, i) => (l.fuShen ? [String(i), l.fuShen] : null))
          .filter((x): x is [string, FuShen] => x !== null),
      )
      expect(actualFu, '伏神').toEqual(e.fuShen)

      // 旬空标记：爻支 ∈ 旬空两支
      p.lines.forEach((line) => {
        expect(line.isXunKong, `${c.label} 第${line.position}爻空亡标记`).toBe(
          e.xkong.includes(line.najia[1]),
        )
      })

      // 动爻与变卦（映射已于 T007 单测验证，此处断言组装正确）
      const movingIdx = c.params.map((v, i) => (v === 6 || v === 9 ? i : -1)).filter((i) => i >= 0)
      p.lines.forEach((line, i) => {
        expect(line.moving, `第${i + 1}爻动标记`).toBe(movingIdx.includes(i))
      })
      const { bian } = resolveHexagrams(c.params)
      expect(p.bian?.name ?? null, '变卦').toBe(bian?.name ?? null)
      if (bian) {
        for (const i of movingIdx) {
          expect(p.lines[i].bianNajia, `第${i + 1}爻变出干支`).toBeTruthy()
          expect(p.lines[i].bianRelative, `第${i + 1}爻变出六亲`).toBeTruthy()
        }
      } else {
        p.lines.forEach((line) => {
          expect(line.bianNajia).toBeNull()
          expect(line.bianRelative).toBeNull()
        })
      }
    })
  }
})

describe('变出之爻六亲按本卦宫（排盘惯例锚点）', () => {
  it('天风姤初爻动 → 变出甲子水，按乾宫为子孙', () => {
    const p = paipan([6, 7, 7, 7, 7, 7], new Date('2026-10-25T14:00:00+08:00'))
    expect(p.lines[0].bianNajia).toBe('甲子')
    expect(p.lines[0].bianRelative).toBe('子孙')
  })

  it('坤为地全动 → 变乾，上爻变出壬戌土按坤宫为兄弟', () => {
    const p = paipan([6, 6, 6, 6, 6, 6], new Date('1949-10-01T15:00:00+08:00'))
    expect(p.lines[5].bianNajia).toBe('壬戌')
    expect(p.lines[5].bianRelative).toBe('兄弟')
  })
})
