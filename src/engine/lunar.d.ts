/** lunar-javascript（1.7.x）的类型声明：仅覆盖本项目用到的 API */
declare module 'lunar-javascript' {
  export class Solar {
    static fromYmdHms(
      year: number,
      month: number,
      day: number,
      hour: number,
      minute: number,
      second: number,
    ): Solar
    getLunar(): Lunar
  }

  export class Lunar {
    getEightChar(): EightChar
  }

  export class EightChar {
    /** 流派（经实测）：1 = 晚子时日柱按次日（进位）；2 = 按当天（不进位，本项目采用，见 spec E04） */
    setSect(sect: number): void
    getSect(): number
    getYear(): string
    getMonth(): string
    getDay(): string
    getTime(): string
  }
}
