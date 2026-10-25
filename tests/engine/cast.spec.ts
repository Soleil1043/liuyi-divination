import { describe, expect, it } from 'vitest'

import { backsToValue, castOneYao } from '@/engine/cast'
import type { Rng } from '@/engine/cast'

/** 简单 LCG：可复现的伪随机序列，避免大样本分布测试出现随机抖动 */
function seededRng(seed: number): Rng {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0x100000000
  }
}

describe('backsToValue 背数与爻值映射', () => {
  it('3 背老阳 9、2 背少阴 8、1 背少阳 7、0 背老阴 6', () => {
    expect(backsToValue(3)).toBe(9)
    expect(backsToValue(2)).toBe(8)
    expect(backsToValue(1)).toBe(7)
    expect(backsToValue(0)).toBe(6)
  })

  it('非法背数抛错', () => {
    expect(() => backsToValue(4)).toThrow()
    expect(() => backsToValue(-1)).toThrow()
  })
})

describe('castOneYao 确定性（注入 RNG）', () => {
  it('RNG 恒小于 0.5 → 三背 → 老阳 9', () => {
    const result = castOneYao(() => 0)
    expect(result.coins).toEqual(['背', '背', '背'])
    expect(result.value).toBe(9)
  })

  it('RNG 恒不小于 0.5 → 三字 → 老阴 6', () => {
    const result = castOneYao(() => 0.9)
    expect(result.coins).toEqual(['字', '字', '字'])
    expect(result.value).toBe(6)
  })

  it('混合序列 → 背字背 → 二背 → 少阴 8', () => {
    const seq = [0.1, 0.8, 0.3]
    let i = 0
    const result = castOneYao(() => seq[i++])
    expect(result.coins).toEqual(['背', '字', '背'])
    expect(result.value).toBe(8)
  })

  it('混合序列 → 背字字 → 一背 → 少阳 7', () => {
    const seq = [0.49, 0.51, 0.99]
    let i = 0
    const result = castOneYao(() => seq[i++])
    expect(result.coins).toEqual(['背', '字', '字'])
    expect(result.value).toBe(7)
  })

  it('相同种子的 LCG 输出完全一致', () => {
    const a = Array.from({ length: 20 }, () => castOneYao(seededRng(42)))
    const b = Array.from({ length: 20 }, () => castOneYao(seededRng(42)))
    expect(a).toEqual(b)
  })
})

describe('castOneYao 概率分布（F02 验收：±2% 容差）', () => {
  it('大样本下老阳/老阴/少阳/少阴 ≈ 1/8, 1/8, 3/8, 3/8', () => {
    const rng = seededRng(20261025)
    const N = 200_000
    const counts = { 6: 0, 7: 0, 8: 0, 9: 0 } as Record<number, number>
    for (let i = 0; i < N; i++) {
      counts[castOneYao(rng).value]++
    }
    expect(counts[6] + counts[7] + counts[8] + counts[9]).toBe(N)
    expect(counts[9] / N).toBeCloseTo(1 / 8, 1) // 老阳 12.5%
    expect(counts[6] / N).toBeCloseTo(1 / 8, 1) // 老阴 12.5%
    expect(counts[7] / N).toBeCloseTo(3 / 8, 1) // 少阳 37.5%
    expect(counts[8] / N).toBeCloseTo(3 / 8, 1) // 少阴 37.5%
    // ±2 个百分点硬容差
    expect(Math.abs(counts[9] / N - 1 / 8)).toBeLessThan(0.02)
    expect(Math.abs(counts[6] / N - 1 / 8)).toBeLessThan(0.02)
    expect(Math.abs(counts[7] / N - 3 / 8)).toBeLessThan(0.02)
    expect(Math.abs(counts[8] / N - 3 / 8)).toBeLessThan(0.02)
  })
})
