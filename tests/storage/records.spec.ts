import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { YaoValue } from '@/engine/types'
import { isAvailable, list, remove, save, update } from '@/storage/records'

/** 内存版 localStorage（模拟浏览器行为） */
function memoryStorage(): Storage {
  const map = new Map<string, string>()
  return {
    get length() {
      return map.size
    },
    clear: () => map.clear(),
    getItem: (k) => (map.has(k) ? (map.get(k) as string) : null),
    key: (i) => Array.from(map.keys())[i] ?? null,
    removeItem: (k) => void map.delete(k),
    setItem: (k, v) => void map.set(k, String(v)),
  } as Storage
}

/** 全抛异常版（模拟无痕模式/禁用存储，E06） */
function brokenStorage(): Storage {
  return {
    length: 0,
    clear: () => undefined,
    getItem: () => {
      throw new Error('denied')
    },
    key: () => null,
    removeItem: () => {
      throw new Error('denied')
    },
    setItem: () => {
      throw new Error('denied')
    },
  } as unknown as Storage
}

const LINES: YaoValue[] = [7, 8, 6, 9, 7, 8]

beforeEach(() => {
  vi.stubGlobal('localStorage', memoryStorage())
  return () => vi.unstubAllGlobals()
})

describe('save / list 往返', () => {
  it('保存后可列出，字段一致且新记录在前', () => {
    const r1 = save('测试占卜一', LINES, new Date('2026-01-01T10:00:00+08:00'))
    expect(r1).not.toBeNull()
    expect(r1?.question).toBe('测试占卜一')
    expect(r1?.lines).toEqual(LINES)
    expect(r1?.castAt).toBe('2026-01-01T02:00:00.000Z')

    const r2 = save('测试占卜二', LINES, new Date('2026-01-02T10:00:00+08:00'))
    expect(r2).not.toBeNull()

    const all = list()
    expect(all).toHaveLength(2)
    expect(all[0].id).toBe(r2!.id)
    expect(all[1].id).toBe(r1!.id)
    expect(all[0].lines.every((v) => [6, 7, 8, 9].includes(v))).toBe(true)
  })
})

describe('update / remove', () => {
  it('update 修改所问之事生效', () => {
    const r = save('原问题', LINES, new Date())!
    expect(update(r.id, '新问题')).toBe(true)
    expect(list()[0].question).toBe('新问题')
  })

  it('update 不存在的 id 返回 false', () => {
    expect(update('no-such-id', 'x')).toBe(false)
  })

  it('remove 删除生效', () => {
    const r = save('待删除', LINES, new Date())!
    expect(remove(r.id)).toBe(true)
    expect(list()).toHaveLength(0)
    expect(remove(r.id)).toBe(false)
  })
})

describe('脏数据防御', () => {
  it('损坏 JSON 视为空库，不影响后续写入', () => {
    localStorage.setItem('jingyao:records', '{broken json!!')
    expect(list()).toEqual([])
    expect(save('恢复写入', LINES, new Date())).not.toBeNull()
    expect(list()).toHaveLength(1)
  })

  it('非法条目被过滤（结构校验）', () => {
    localStorage.setItem(
      'jingyao:records',
      JSON.stringify([
        { id: 'x', question: '缺 lines', castAt: '2026-01-01', savedAt: '2026-01-01' },
        { id: 'y', question: 'lines 非法', lines: [1, 2, 3], castAt: '2026-01-01', savedAt: '2026-01-01' },
      ]),
    )
    expect(list()).toEqual([])
  })
})

describe('E06：存储不可用降级', () => {
  it('localStorage 抛异常 → isAvailable false、list 空、save null', () => {
    vi.stubGlobal('localStorage', brokenStorage())
    expect(isAvailable()).toBe(false)
    expect(list()).toEqual([])
    expect(save('无法保存', LINES, new Date())).toBeNull()
    expect(update('x', 'y')).toBe(false)
    expect(remove('x')).toBe(false)
  })
})
