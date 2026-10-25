# 构建日志 (Progress)

> Phase 4 产出。每完成一个任务追加一条记录，只追加不删除。
> 格式：时间 | 任务编号 | 操作 | 涉及文件 | 验证方式 | 状态

---

## 日志条目

<!-- 每条记录格式：
### [T0XX] 任务名称 — YYYY-MM-DD HH:MM

**操作**：
- 创建/修改了哪些文件

**涉及文件**：
- `path/to/file.py` — [做了什么]

**验证方式**：
- [运行什么命令 / 看什么结果]

**状态**：✅ 通过验证 / ❌ 有问题（附描述）

**Git**：`abc1234` feat: T0XX 任务名称
-->

### [T001] 工程脚手架（Vite + Vue 3 + TS + Vitest + ESLint/Prettier） — 2026-10-25 18:40

**操作**：
- 手写脚手架（未用 create-vite 交互模板，因目录非空），npm install 成功，0 漏洞

**涉及文件**：
- `package.json` / `package-lock.json` — 依赖与脚本（dev/build/preview/test/typecheck/lint/format）
- `vite.config.ts` — vue 插件、`@` 别名、vitest 配置（node 环境）
- `tsconfig.json` — 单文件方案，strict + bundler resolution + `@/*` 路径
- `eslint.config.js` — flat config：@eslint/js + typescript-eslint + eslint-plugin-vue + prettier
- `.prettierrc.json` / `.prettierignore` / `.gitignore` — 格式化与忽略（含 `.mimosa/`、`.agent` 不格式化）
- `index.html` / `src/main.ts` / `src/App.vue` / `src/vite-env.d.ts` — 应用入口与占位壳
- `tests/smoke.spec.ts` — 基建冒烟测试

**版本决策**：TypeScript 锁 `~5.9.3`——最新 7.0.2 与 typescript-eslint（要求 `<6.1.0`）不兼容，符合 plan 的 ~5.x 约定；vite 8.3.5 / vitest 5.0.5 / eslint 10.13 / vue 3.5.44 均为当日 latest stable。

**验证方式**：
- `npm run lint` ✅（修复一处：eslint-plugin-vue v10 的 flat 配置键为 `configs['flat/recommended']` 而非 `configs.recommended`）
- `npm run test` ✅ 1 passed
- `npm run build` ✅（vue-tsc 类型检查 + vite build，dist 产物正常）
- `npm run dev` ✅ HTTP 200，App.vue 经 Vite 编译正常返回

**状态**：✅ 通过验证

**Git**：`f42948e` feat: T001 工程脚手架（Vite+Vue3+TS+Vitest+ESLint）

### [T002] 主题与视图骨架（甲·鎏金暗夜） — 2026-10-25 18:41

**操作**：
- 落地 design tokens 与全局样式，搭好三视图状态机骨架

**涉及文件**：
- `src/ui/theme.css` — 色彩/字体/圆角间距 tokens + body 基础样式（墨黑底 + 鎏金微光渐变）
- `src/app.css` — 应用骨架（720px 单列居中、页头/导航/页脚/占位面板样式）
- `src/App.vue` — 三视图状态机（casting/result/history），导航含临时「结果」入口（T011/T012 接通后移除）
- `src/ui/views/CastView.vue` / `ResultView.vue` / `HistoryView.vue` — 视图占位壳
- `src/main.ts` — 引入两个样式文件

**验证方式**：
- `npm run lint` ✅、`npm run test` ✅ 1 passed、`npm run build` ✅（CSS 产物 2.07 kB 含主题）
- `npm run dev` ✅ HTTP 200，theme.css 经 Vite 编译注入、tokens 齐全；三视图按钮可切换占位（待用户浏览器目验）

**状态**：✅ 通过验证

**Git**：`627629d` feat: T002 主题与视图骨架（鎏金暗夜）

### [T003] 卦典数据（64 卦全量） — 2026-10-25 19:05

**操作**：
- 手写 64 卦全量数据（公版《周易》通行本经文，简体），配强交叉校验测试与公版源抽查

**涉及文件**：
- `src/data/hexagrams.json` — 64 卦：卦序/全名/简名/上下卦象/卦宫/宫内序/世爻/binaryKey/卦辞/6 爻辞（vernacular 留空待 T004）/乾坤用辞
- `src/data/types.ts` — Hexagram 等类型；SpecialCi 为可区分联合（乾坤各只有一条用辞）
- `src/data/index.ts` — 数据加载 + binaryKey 索引 Map
- `tests/data/hexagrams.spec.ts` — 6 组校验：文王卦序对应、64×6 爻完整、乾坤用辞、binaryKey 与上下卦一致、八宫表/世爻规则独立重录比对、爻题与爻位阴阳一致
- `tsconfig.json` — 开启 resolveJsonModule

**交叉校验抓到并修复的错误**（证明测试有效）：
- 用六误放在乾卦 → 移至坤卦，schema 改为 `{kind, text}`
- 晋卦上爻爻题误写「上六」→ 修正为「上九」

**原文抽查核对**（ctext 反爬不可用，改用 GitHub bollwarm/ZHOUYI 繁体公版全文比对）：
- 乾（含用九）、姤、既济、晋、未济的卦辞与抽查爻辞逐字吻合（仅点校断句差异）
- 版本分歧记录：既济卦辞从通行本读法「亨小，利贞」；革卦从十三经注疏「巳日乃孚」（该源作「己日」，历代版本分歧）；该源乾九二「再田」系其笔误，通行本「在田」，本项目数据无误

**验证方式**：
- `npm run test` ✅ 7 passed（2 文件）
- `npm run lint` ✅、`npm run build` ✅

**状态**：✅ 通过验证

**Git**：`7e4e835` feat: T003 卦典数据（64卦全量+交叉校验）

### [T004] 白话译文数据（450 条初稿） — 2026-10-25 19:12

**操作**：
- AI 起草全部 450 条白话译文（64 卦辞 + 384 爻辞 + 2 用辞），统一文风：短、白、不故弄玄虚
- 实现方式调整：译文存放独立文件 `vernacular.json`，由 `data/index.ts` 在加载时与原文合并为同一 `Hexagram` 类型——避免重打已校验的原文引入手误。逻辑数据模型不变，仅物理存储分文件

**涉及文件**：
- `src/data/vernacular.json` — 按卦序号组织的全部译文
- `src/data/types.ts` — 新增 VernacularEntry 类型
- `src/data/index.ts` — 原文/译文合并加载
- `tests/data/vernacular.spec.ts` — 完整性（64+384+2 闭环）、英文/繁体残留黑名单校验

**自查修复**：坎卦六四译文混入英文 "humble"、无妄六二繁体"獲"，已在测试黑名单机制下修正

**验证方式**：
- `npm run test` ✅ 10 passed（3 文件）
- `npm run lint` ✅、`npm run build` ✅
- 译文质量抽检留待作者后续校对（初稿性质，持续优化不阻塞构建）

**状态**：✅ 通过验证

**Git**：`2c5e46b` feat: T004 白话译文数据（450条初稿）

### [T005] 摇卦随机引擎 — 2026-10-25 19:18

**操作**：
- 实现三枚铜钱定一爻的纯函数，RNG 可注入

**涉及文件**：
- `src/engine/types.ts` — CoinSide（字/背）、YaoValue（6/7/8/9）、CastResult
- `src/engine/cast.ts` — `castOneYao(rng?)`、`backsToValue`（3背老阳9/2背少阴8/1背少阳7/0背老阴6）
- `tests/engine/cast.spec.ts` — 映射穷举、确定性注入（恒背/恒字/混合序列）、LCG 同种子复现、20 万样本分布（1/8,1/8,3/8,3/8 ±2 个百分点）

**验证方式**：
- `npm run test` ✅ 18 passed（4 文件）——首次执行 AGENTS.md 新增的"每任务先过测试门禁"
- `npm run lint` ✅、`npm run build` ✅

**状态**：✅ 通过验证

**Git**：`74bc34f` feat: T005 摇卦随机引擎（RNG可注入+概率测试）

### [T006] 历法引擎（干支四柱 + 旬空 + 早晚子时） — 2026-10-25 19:44

**操作**：
- 安装 lunar-javascript@1.7.7（MIT），封装 `calendarOf(date)`：北京时间口径统一解释时刻（CI 时区确定性）、四柱 + 自算旬空

**涉及文件**：
- `src/engine/lunar.d.ts` — 库类型声明（含实测 sect 语义注释）
- `src/engine/calendar.ts` — beijingParts（Intl/Asia/Shanghai）→ EightChar(sect 2) → 四柱；dayXunKong 旬空自算
- `tests/engine/calendar.spec.ts` — 权威锚点 6 时刻 + 立春年柱分界 + 早晚子时 + 时区确定性 + 旬空抽查
- `package.json` / `package-lock.json` — 新增依赖

**权威核对结论**（≥5 时刻）：
- 1949-10-01 15:00 = 己丑/癸酉/甲子/壬申（历史著名锚点，逐柱吻合）
- 2026-01-01 乙亥日、2026 全年日柱自洽（与天气网万年历一致）
- 2024-02-04 立春 16:27 分界：10:00 癸卯年 vs 17:00 甲辰年，分毫不差
- 天气网摘要「10-25=乙亥日」与其自身「01-01=乙亥日」算术矛盾（相距 297 天不可能同柱），判定为网页摘要器读错行；由 01-01 锚点算术推导 10-25 = 壬申日，与库一致

**过程中抓到的 bug（问题追踪 P03/P04）**：
- dayXunKong 初版同余解法死循环（n+=10 步进时 n%10 恒定）→ 重写为 n+=12 步进 + 5 步安全上限
- sect 流派解读颠倒：实测 sect 2 = 晚子时日柱不进位（spec E04 所需，库默认即 2），sect 1 = 进位；初版误用 sect 1，测试立刻抓住

**设计要点**：时刻统一按 Asia/Shanghai 解释，任何机器时区（含 CI 的 UTC）下同一瞬间排盘唯一；夜子时时柱按次日日干起（"夜子时"派，随 sect 2 行为）

**验证方式**：
- `npm run test` ✅ 28 passed（5 文件，新增 10 个历法测试）
- `npm run lint` ✅、`npm run build` ✅

**状态**：✅ 通过验证

**Git**：`feat: T006 历法引擎（四柱+旬空+早晚子时）`

---

## 问题追踪

<!-- 遇到的问题记录在此，方便回溯 -->
| 编号 | 任务 | 问题 | 解决方案 | 状态 |
|------|------|------|---------|------|
| P01 | T002 | progress.md 编辑失误，T002 条目覆盖了 T001 的 Git 行 | 事后恢复 T001 Git 行 | 已解决 |
| P02 | T003 | progress.md 二次编辑失误，T003 条目插入 T001/T002 之间致 T002 正文失头 | 按"只追加"原则整体重写日志区，恢复 T001→T002→T003 顺序；后续追加一律锚定文件末尾 | 已解决 |
| P03 | T006 | dayXunKong 同余解法死循环（n+=10 步进 n%10 恒定），测试挂死无输出 | 重写为 n+=12 步进（同奇偶保证 5 步内命中）+ 安全上限抛错 | 已解决 |
| P04 | T006 | lunar-javascript sect 流派编号解读颠倒（误用 sect 1 导致晚子时日柱进位） | 裸 node 探针实测：sect 2 = 日柱不进位（spec E04 所需）；显式 setSect(2) 并在 d.ts 注释实测语义 | 已解决 |
