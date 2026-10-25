import type { Hexagram, TextPair } from '@/data'

import { movingLines, resolveHexagrams } from './hexagram'

/** 引文类型：卦辞 / 爻辞 / 用辞（乾坤专用） */
export type CitationKind = 'gua' | 'yao' | 'yong'

/** 一条取辞引文（对应需求 F04 / M03） */
export interface Citation {
  kind: CitationKind
  /** 卦名（本卦或变卦） */
  hexagram: string
  /** 爻位 1–6（kind = 'yao' 时） */
  position?: number
  /** 原文 + 白话 */
  text: TextPair
  /** 主断（多引文时的主参考，展示排序用） */
  primary: boolean
  /** 规则备注（如「以上爻为主」） */
  note?: string
}

/**
 * 朱熹《易学启蒙》变占法取辞：
 * - 0 动爻：本卦卦辞
 * - 1 动爻：本卦动爻爻辞
 * - 2 动爻：本卦两动爻爻辞，以上爻为主
 * - 3 动爻：本卦与变卦卦辞，以本卦为贞（主）、变卦为悔（通行简化处理）
 * - 4 动爻：变卦两不变爻爻辞，以下爻为主
 * - 5 动爻：变卦唯一不变爻爻辞
 * - 6 动爻：乾用九、坤用六，余卦以变卦卦辞占
 */
export function getCitations(lines: readonly number[]): Citation[] {
  const { ben, bian } = resolveHexagrams(lines)
  const moving = movingLines(lines)
  const n = moving.length

  const gua = (hex: Hexagram, primary: boolean, note?: string): Citation => ({
    kind: 'gua',
    hexagram: hex.name,
    text: hex.guaci,
    primary,
    note,
  })
  const yao = (hex: Hexagram, pos0: number, primary: boolean, note?: string): Citation => ({
    kind: 'yao',
    hexagram: hex.name,
    position: pos0 + 1,
    text: hex.yaoci[pos0],
    primary,
    note,
  })

  if (n === 0) return [gua(ben, true)]

  if (n === 1) return [yao(ben, moving[0], true)]

  if (n === 2) {
    const [lower, upper] = moving
    return [yao(ben, lower, false), yao(ben, upper, true, '以上爻为主')]
  }

  if (n === 3) {
    if (!bian) throw new Error('三爻动必有变卦')
    return [gua(ben, true, '本卦为贞（主）'), gua(bian, false, '变卦为悔（参）')]
  }

  const staticIdx = [0, 1, 2, 3, 4, 5].filter((i) => !moving.includes(i))

  if (n === 4) {
    if (!bian) throw new Error('四爻动必有变卦')
    const [lower, upper] = staticIdx
    return [yao(bian, lower, true, '以下爻为主'), yao(bian, upper, false)]
  }

  if (n === 5) {
    if (!bian) throw new Error('五爻动必有变卦')
    return [yao(bian, staticIdx[0], true)]
  }

  // n === 6：乾坤用九用六，余卦变卦卦辞
  if (ben.name === '乾为天') {
    const yongjiu = ben.special?.text
    if (!yongjiu) throw new Error('乾为天缺少用九')
    return [{ kind: 'yong', hexagram: ben.name, text: yongjiu, primary: true }]
  }
  if (ben.name === '坤为地') {
    const yongliu = ben.special?.text
    if (!yongliu) throw new Error('坤为地缺少用六')
    return [{ kind: 'yong', hexagram: ben.name, text: yongliu, primary: true }]
  }
  if (!bian) throw new Error('六爻全动必有变卦')
  return [gua(bian, true)]
}
