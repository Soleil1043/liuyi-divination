import { Solar } from 'lunar-javascript'

/** 四柱干支（年/月/日/时） */
export interface FourPillars {
  year: string
  month: string
  day: string
  hour: string
}

/** 历法排盘结果（对应需求 F03 / M02） */
export interface CalendarResult {
  pillars: FourPillars
  /** 日柱旬空（空亡）的两个地支 */
  xunKong: [string, string]
  /** 北京时间（Asia/Shanghai）的公历描述，展示用 */
  beijingText: string
}

/** 排盘统一采用北京时间口径，保证任何机器时区下同一瞬间结果唯一 */
const TZ = 'Asia/Shanghai'

const ZHI = '子丑寅卯辰巳午未申酉戌亥'
const GAN = '甲乙丙丁戊己庚辛壬癸'

/** 将任意时刻换算为北京时间的 [年,月,日,时,分,秒] */
function beijingParts(date: Date): [number, number, number, number, number, number] {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const p = new Map<string, string>()
  for (const part of fmt.formatToParts(date)) {
    if (part.type !== 'literal') p.set(part.type, part.value)
  }
  let hour = Number(p.get('hour'))
  if (hour === 24) hour = 0 // 某些 ICU 版本以 24 表示子夜
  return [
    Number(p.get('year')),
    Number(p.get('month')),
    Number(p.get('day')),
    hour,
    Number(p.get('minute')),
    Number(p.get('second')),
  ]
}

/** 由日柱干支推旬空（空亡）：按六十甲子序号的旬首推算 */
function dayXunKong(dayGanZhi: string): [string, string] {
  const ganIdx = GAN.indexOf(dayGanZhi[0])
  const zhiIdx = ZHI.indexOf(dayGanZhi[1])
  if (ganIdx < 0 || zhiIdx < 0) throw new Error(`invalid ganZhi: ${dayGanZhi}`)
  // 六十甲子序号 n 满足 n ≡ ganIdx (mod 10) 且 n ≡ zhiIdx (mod 12)；
  // 合法干支配对同奇偶，从 zhiIdx 起以 12 步进必在 5 步内命中
  let n = zhiIdx
  for (let steps = 0; steps < 5 && n % 10 !== ganIdx; steps++) n += 12
  if (n % 10 !== ganIdx) throw new Error(`invalid ganZhi pairing: ${dayGanZhi}`)
  const xunHead = n - (n % 10)
  return [ZHI[(xunHead + 10) % 12], ZHI[(xunHead + 11) % 12]]
}

/**
 * 公历时刻 → 干支四柱 + 旬空。
 * 时刻按北京时间解释；晚子时（23:00–24:00）日柱不进位、时柱为夜子时（按次日日干起），
 * 0:00 后用新日柱（spec E04，对应 lunar-javascript EightChar sect 2 流派）。
 */
export function calendarOf(date: Date): CalendarResult {
  const [y, m, d, h, mi, s] = beijingParts(date)
  const lunar = Solar.fromYmdHms(y, m, d, h, mi, s).getLunar()
  const ec = lunar.getEightChar()
  ec.setSect(2)
  const pillars: FourPillars = {
    year: ec.getYear(),
    month: ec.getMonth(),
    day: ec.getDay(),
    hour: ec.getTime(),
  }
  const pad = (x: number) => String(x).padStart(2, '0')
  return {
    pillars,
    xunKong: dayXunKong(pillars.day),
    beijingText: `${y}-${pad(m)}-${pad(d)} ${pad(h)}:${pad(mi)}`,
  }
}
