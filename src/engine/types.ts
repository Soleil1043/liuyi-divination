/** 铜钱面：字面（阴面）/ 背面（阳面，记数） */
export type CoinSide = '字' | '背'

/** 爻值：6 老阴（动）、7 少阳、8 少阴、9 老阳（动） */
export type YaoValue = 6 | 7 | 8 | 9

/** 一次摇卦（三枚铜钱）的结果 */
export interface CastResult {
  /** 三枚铜钱落定的面（展示用） */
  coins: [CoinSide, CoinSide, CoinSide]
  /** 本次所得爻值 */
  value: YaoValue
}
