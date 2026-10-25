import type { Hexagram, TrigramXiang } from '@/data'

/** 八经卦名 */
export type TrigramName = '乾' | '兑' | '离' | '震' | '巽' | '坎' | '艮' | '坤'

/** 自然象 → 经卦名 */
const XIANG_TO_TRIGRAM: Record<TrigramXiang, TrigramName> = {
  天: '乾',
  泽: '兑',
  火: '离',
  雷: '震',
  风: '巽',
  水: '坎',
  山: '艮',
  地: '坤',
}

/**
 * 京房纳甲表（内卦三爻 / 外卦三爻，自下而上）。
 * 与参照实现 bopo/najia（MIT）逐卦比对一致（tests/fixtures/najia-expected.json）。
 */
const NAJIA: Record<TrigramName, readonly string[]> = {
  乾: ['甲子', '甲寅', '甲辰', '壬午', '壬申', '壬戌'],
  兑: ['丁巳', '丁卯', '丁丑', '丁亥', '丁酉', '丁未'],
  离: ['己卯', '己丑', '己亥', '己酉', '己未', '己巳'],
  震: ['庚子', '庚寅', '庚辰', '庚午', '庚申', '庚戌'],
  巽: ['辛丑', '辛亥', '辛酉', '辛未', '辛巳', '辛卯'],
  坎: ['戊寅', '戊辰', '戊午', '戊申', '戊戌', '戊子'],
  艮: ['丙辰', '丙午', '丙申', '丙戌', '丙子', '丙寅'],
  坤: ['乙未', '乙巳', '乙卯', '癸丑', '癸亥', '癸酉'],
}

/** 装卦：取某卦六爻的纳甲干支（自下而上，内卦前三爻取各经卦 0–2 位，外卦后三爻取 3–5 位） */
export function najiaOf(hex: Hexagram): string[] {
  const lower = NAJIA[XIANG_TO_TRIGRAM[hex.lower]]
  const upper = NAJIA[XIANG_TO_TRIGRAM[hex.upper]]
  return [...lower.slice(0, 3), ...upper.slice(3, 6)]
}

export { XIANG_TO_TRIGRAM }
