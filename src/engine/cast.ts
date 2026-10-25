import type { CastResult, CoinSide, YaoValue } from './types'

/** 随机数发生器：返回 [0, 1)，可注入以获得确定性结果（测试用） */
export type Rng = () => number

/**
 * 默认随机源：crypto.getRandomValues（密码学级熵池，v1.1 强化）。
 * 三枚铜钱每枚独立调用一次，互不相关；Node/浏览器均提供 WebCrypto。
 */
const defaultRng: Rng = () => {
  const buf = new Uint32Array(1)
  globalThis.crypto.getRandomValues(buf)
  return buf[0] / 0x100000000
}

function flipCoin(rng: Rng): CoinSide {
  // 每枚铜钱字/背各半；背面为阳
  return rng() < 0.5 ? '背' : '字'
}

/** 背数 → 爻值：3 背老阳 9、2 背少阴 8、1 背少阳 7、0 背老阴 6 */
export function backsToValue(backs: number): YaoValue {
  switch (backs) {
    case 3:
      return 9
    case 2:
      return 8
    case 1:
      return 7
    case 0:
      return 6
    default:
      throw new Error(`invalid backs count: ${backs}`)
  }
}

/** 掷三枚铜钱定一爻（对应需求 F02/M01） */
export function castOneYao(rng: Rng = defaultRng): CastResult {
  const coins: [CoinSide, CoinSide, CoinSide] = [flipCoin(rng), flipCoin(rng), flipCoin(rng)]
  const backs = coins.filter((c) => c === '背').length
  return { coins, value: backsToValue(backs) }
}
