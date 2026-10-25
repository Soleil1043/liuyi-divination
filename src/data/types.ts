/** 八经卦自然象（上/下卦的象名） */
export type TrigramXiang = '天' | '地' | '雷' | '风' | '水' | '火' | '山' | '泽'

/** 八宫卦宫名（京房八宫） */
export type PalaceName = '乾' | '坎' | '艮' | '震' | '巽' | '离' | '坤' | '兑'

/** 原文 + 白话译文 */
export interface TextPair {
  /** 公版原文 */
  origin: string
  /** 白话译文（T004 填充） */
  vernacular: string
}

/** 乾坤专用辞：乾为「用九」，坤为「用六」 */
export interface SpecialCi {
  kind: 'yongjiu' | 'yongliu'
  text: TextPair
}

/** 白话译文条目（按卦序号组织，与 hexagrams.json 的原文分开存放） */
export interface VernacularEntry {
  guaci: string
  /** 自下而上 6 条 */
  yaoci: string[]
  /** 仅乾坤：用九/用六 的白话 */
  special?: string
}

export interface Hexagram {
  /** 文王卦序 1–64 */
  number: number
  /** 全名（如「天风姤」；八纯卦作「乾为天」式） */
  name: string
  /** 简名（如「姤」） */
  shortName: string
  /** 上卦象 */
  upper: TrigramXiang
  /** 下卦象 */
  lower: TrigramXiang
  /** 所属卦宫 */
  palace: PalaceName
  /** 宫内序：0 本宫卦、1–5 一至五世卦、6 游魂卦、7 归魂卦 */
  palaceIndex: number
  /** 世爻位置（1=初爻 … 6=上爻） */
  worldPos: number
  /** 六位 0/1，自下而上（1=阳 0=阴） */
  binaryKey: string
  guaci: TextPair
  /** 自下而上 6 条爻辞 */
  yaoci: TextPair[]
  /** 仅乾坤非空（乾为用九，坤为用六） */
  special: SpecialCi | null
}
