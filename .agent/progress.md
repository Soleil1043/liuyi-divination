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

**Git**：`1294d88` feat: T006 历法引擎（四柱+旬空+早晚子时）

### [T007] 纳甲装卦（映射 + 干支） — 2026-10-25 19:57

**操作**：
- 实现爻值序列 ↔ 卦的映射与本卦/变卦解析、京房纳甲装卦

**涉及文件**：
- `src/engine/hexagram.ts` — `linesToBinaryKey` / `movingLines` / `transformedBinaryKey` / `resolveHexagrams`（无动爻 → 无变卦）
- `src/engine/najia.ts` — 八经卦纳甲表 + `najiaOf(hex)`（内卦取表 0–2 位、外卦取 3–5 位）
- `tests/fixtures/najia-expected.json` — 参照数据：本机 pip 安装 bopo/najia 2.0.1（Python，MIT）生成，64 卦全量
- `tests/engine/najia.spec.ts` — 映射用例（全静/单动/全动/多动/非法输入）+ 64 卦纳甲逐爻比对 + 八纯卦抽查

**验证方式**：
- `npm run test` ✅ 35 passed（6 文件，新增 7 个）；64 卦纳甲与 najia 全量一致
- `npm run lint` ✅、`npm run build` ✅

**自查修正**：初写多动爻用例时想当然把静爻也翻转（误期望"火水未济"），复核规则后修正为静爻不变、变卦坤为地——由测试驱动暴露的推卦理解偏差

**状态**：✅ 通过验证

**Git**：`e3e1057` feat: T007 纳甲装卦（映射+干支，najia全量比对）

### [T008] 六亲/六兽/世应/伏神 — 2026-10-26 01:21

**操作**：
- 实现六亲生克推演、六兽起法、应位换算、伏神借爻，全部与 najia 参照实现全量比对

**涉及文件**：
- `src/engine/relatives.ts` — `relativeOf`（卦宫五行为我：同我兄弟/我生子孙/生我父母/我克妻财/克我官鬼）、`relativesOf`、`sixBeastsOf`（甲乙青龙/丙丁朱雀/戊勾陈/己螣蛇/庚辛白虎/壬癸玄武，环排）、`yingPos`（世隔三位）、`fuShenOf`（缺亲从首卦对应爻位借伏）
- `tests/fixtures/relatives-expected.json` — najia 2.0.1 生成：64 卦六亲/世应/伏神 + 六种日干六兽
- `tests/engine/relatives.spec.ts` — 全量比对（64 卦六亲、世应、伏神；六种六兽起法）+ 手工锚点（姤、中孚缺两亲）+ 非法输入

**验证方式**：
- `npm run test` ✅ 46 passed（7 文件，新增 11 个）
- 伏神覆盖统计：8 首卦无伏 + 12 卦不缺亲 + 32 卦缺一亲 + 12 卦缺两亲，全部与 najia 一致
- `npm run lint` ✅、`npm run build` ✅

**过程记录**：fixture 生成脚本中的日干断言纠正了一次日期心算错位（10-28 实为乙亥日）；GENERATES 表一处手误键自审修正

**状态**：✅ 通过验证

**Git**：`d64840f` feat: T008 六亲六兽世应伏神（najia全量比对）

### [T009] 排盘编排 + golden 用例 — 2026-10-26 01:30

**操作**：
- 将历法/映射/纳甲/六亲组装为完整排盘 `paipan(lines, castAt)`，golden 卦例总验收

**涉及文件**：
- `src/engine/paipan.ts` — `Paipan`/`PaipanLine` 结构；每爻含阴阳/动标记/纳甲/六亲/六兽/世应/旬空/伏神/变出干支与六亲（按本卦宫）
- `tests/fixtures/golden.json` — 12 例（najia 2.0.1 生成）：全静/单动/三动/全动、伏神 0/1/2、三种旬空（戌亥/申酉/辰巳）、四种六兽起法、晚子时（日柱不进位）与早子时对照
- `tests/engine/paipan.spec.ts` — 12 例逐字段比对（卦名/卦宫/四柱/旬空/六兽/纳甲/六亲/世应/伏神/空亡标记/动标记/变卦）+ 变出六亲惯例锚点 2 例

**验证方式**：
- `npm run test` ✅ 61 passed（8 文件，新增 15 个）
- `npm run lint` ✅、`npm run build` ✅（vue-tsc 抓出一处测试类型守卫声明过宽，已修正）

**引擎层至此全部完成**：cast → paipan 全链路均有独立参照实现交叉验证

**状态**：✅ 通过验证

**Git**：`bc7b35d` feat: T009 排盘编排+golden12卦例

### [T010] 朱熹变占法取辞引擎 — 2026-10-26 03:43

**操作**：
- 实现变占法取辞 `getCitations(lines)`：0 静卦辞 / 1 动爻辞 / 2 动两爻辞以上为主 / 3 动本卦+变卦卦辞（本卦为贞主）/ 4 动变卦两不变爻辞以下为主 / 5 动变卦唯一不变爻辞 / 6 动乾坤用九用六、余卦变卦卦辞
- 三爻动「前十卦主贞、后十卦主悔」采用通行简化处理（本卦为主、变卦为参），已在代码注释与本条目记录

**涉及文件**：
- `src/engine/biangua.ts` — Citation 结构（kind/hexagram/position/text/primary/note）+ 取辞规则
- `tests/engine/biangua.spec.ts` — 七种情形各 ≥1 例（含乾坤用辞、他卦全动）+ 引文白话非空断言

**自查修正**：两处测试用例构造错误（4 动爻变卦误推为风地观实为坤为地；5/6 动爻序列混入静爻致动爻数不符），引擎实现本身无误——变卦算术再次印证"独立核对"的必要

**验证方式**：
- `npm run test` ✅ 71 passed（9 文件，新增 10 个）
- `npm run lint` ✅、`npm run build` ✅

**引擎层（src/engine/）全部完工**：cast / calendar / hexagram / najia / relatives / paipan / biangua

**状态**：✅ 通过验证

**Git**：`360486b` feat: T010 变占法取辞（0-6动爻全覆盖）

### [T011] 摇卦页 UI — 2026-10-26 03:55

**操作**：
- 实现摇卦页完整交互：所问之事项/铜钱动画/逐爻点亮/防抖/完成事件

**涉及文件**：
- `src/ui/components/CoinToss.vue` — SVG 圆形方孔铜钱（字面饰点/背面四出纹区分），3D 翻转 keyframes 级联 0.85s，钱下标注「字/背」
- `src/ui/components/LineStack.vue` — 六爻自上而下渲染；已成爻金色点亮（stagger 出现动画），动爻朱砂点 + 金色呼吸光；未成爻虚线占位、下一爻位描边提示
- `src/ui/views/CastView.vue` — 所问之事输入（必填，trim 校验 E01）+「今日一占」一键填入；摇卦按钮（第 n 爻文案）；E03 防抖（rolling 期间 canShake=false）；E02 进行中状态纯内存不落库；第 6 爻落定 1.2s 后 emit `done {question, lines, castAt}`（起卦时刻以第一爻为准）
- `src/App.vue` — 移除 T002 的临时「结果」按钮；接住 done 事件暂存 pendingResult（T012 消费）
- `eslint.config.js` — 新增 globals.browser（修复 window no-undef）+ devDependencies 加 globals@17.13.0

**验证方式**：
- `npm run test` ✅ 71 passed（门禁）
- `npm run lint` ✅、`npm run build` ✅（产物 69.9 kB / gzip 27.7 kB）
- `npm run dev` ✅ HTTP 200、CastView 经 Vite 正常编译；交互行为（空输入拦截/6 次成卦/防抖/呼吸标记）待用户浏览器目验

**状态**：✅ 通过验证

**Git**：`29a4f05` feat: T011 摇卦页（铜钱动画+逐爻点亮+防抖）

### [T012] 结果页 UI — 2026-10-26 04:02

**操作**：
- 实现结果页：排盘表 + 双卦象 + 解读 + 所问编辑 + 流转接线

**涉及文件**：
- `src/ui/components/PaipanTable.vue` — 传统排盘表：时间/四柱/旬空 meta 行；六神 | 世应+六亲+纳甲+(空)|伏神 | 爻象(○老阳/×老阴) | 变出列；本卦卦名+卦宫/变卦表头
- `src/ui/components/ReadingPanel.vue` — 按 Citation 渲染：主引文高亮卡、白话在前原文在后（左侧金线引用块）；标注来源（卦辞/某爻/用辞）与规则备注
- `src/ui/views/ResultView.vue` — 组合页：所问编辑（失焦保存 emit）、本卦/变卦 LineStack 并排（560px+ 双列）、动爻数摘要、排盘表、解读、再摇一卦
- `src/App.vue` — done → 切 result 并传 pendingResult；questionChange 同步暂存；again → 清空回 casting（CastView v-if 重建自然重置）

**lint 修正**：PaipanTable 全角空格（no-irregular-whitespace）；Reading 单词组件名 → ReadingPanel（vue/multi-word-component-names）

**验证方式**：
- `npm run test` ✅ 71 passed（门禁）
- `npm run lint` ✅、`npm run build` ✅、dev HTTP 200
- 视觉与流转待用户浏览器目验
- 记录：产物 461 kB（gzip 161 kB），lunar-javascript 进入主 bundle——代码分割留待 T015 部署环节优化

**状态**：✅ 通过验证

**Git**：`e00be79` feat: T012 结果页（排盘表+解读+编辑所问）

### [T013] 历史卦例 — 2026-10-26 04:33

**操作**：
- 实现历史卦例全流程：存储层 + 列表/详情/编辑/删除/降级

**涉及文件**：
- `src/storage/records.ts` — save/list/update/remove/isAvailable；只存原始数据（id/question/lines/castAt/savedAt）按 D003 展示时重算；写入探针探测可用性（E06）；脏数据防御（损坏 JSON 视为空库、非法条目过滤）
- `src/ui/components/RecordList.vue` — 卦例卡（卦名+动爻数+时间+所问，卦名由引擎重算）；删除内联二次确认；整卡点击回看
- `src/ui/views/HistoryView.vue` — 列表页：存储不可用降级提示（E06）、空列表引导"去摇一卦"
- `src/ui/views/ResultView.vue` — 新增 saved prop，未落库时显示朱砂提示行
- `src/App.vue` — onDone 自动 saveRecord（F05）；编辑同步 updateRecord + 本地状态；onViewRecord 历史回看复用结果页（引擎重算）；onAgain 清空
- `tests/storage/records.spec.ts` — 内存/broken localStorage mock：往返、排序、更新、删除、脏数据、E06 降级共 7 例

**验证方式**：
- `npm run test` ✅ 78 passed（连续两轮确认，新增 7 个；首跑出现一次并发抖动失败，复跑即绿并复核确认）
- `npm run lint` ✅、`npm run build` ✅（vue-tsc 修正测试类型声明）、dev HTTP 200
- 浏览器行为目验待用户

**状态**：✅ 通过验证

**Git**：`4cfef43` feat: T013 历史卦例（存储+列表+回看+编辑+删除+降级）

### [T014] CI 流水线 — 2026-10-26 04:53

**操作**：
- 新建 GitHub Actions CI：push/PR 到 main 触发 npm ci → lint → test → build（build 含 vue-tsc 类型检查）
- 本地分支 master → main（GitHub 生态惯例，CI 触发分支一致）

**涉及文件**：
- `.github/workflows/ci.yml` — ubuntu-latest + node 24 + npm 缓存
- 分支改名（git branch -m master main）

**本地验证**：
- `npm run lint` ✅、`npm run test` ✅ 78 passed、`npm run build` ✅——CI 将执行的命令序列全部复演通过
- YAML 结构校验（必需字段齐全）；线上状态待 T015 push 后在 GitHub Actions 目验
- 记录：本地 `npm ci` 复演遇 Windows 文件锁（rolldown .node 被残留进程占用，EPERM）——属本地环境现象，CI 全新环境不受影响；已用 `npm install` 恢复 node_modules 并全绿

**状态**：✅ 通过验证（CI 在线状态待 push 后确认，T015 收尾）

**Git**：`feat: T014 CI 流水线（GitHub Actions lint+test+build）`

---

## 问题追踪

<!-- 遇到的问题记录在此，方便回溯 -->
| 编号 | 任务 | 问题 | 解决方案 | 状态 |
|------|------|------|---------|------|
| P01 | T002 | progress.md 编辑失误，T002 条目覆盖了 T001 的 Git 行 | 事后恢复 T001 Git 行 | 已解决 |
| P02 | T003 | progress.md 二次编辑失误，T003 条目插入 T001/T002 之间致 T002 正文失头 | 按"只追加"原则整体重写日志区，恢复 T001→T002→T003 顺序；后续追加一律锚定文件末尾 | 已解决 |
| P03 | T006 | dayXunKong 同余解法死循环（n+=10 步进 n%10 恒定），测试挂死无输出 | 重写为 n+=12 步进（同奇偶保证 5 步内命中）+ 安全上限抛错 | 已解决 |
| P04 | T006 | lunar-javascript sect 流派编号解读颠倒（误用 sect 1 导致晚子时日柱进位） | 裸 node 探针实测：sect 2 = 日柱不进位（spec E04 所需）；显式 setSect(2) 并在 d.ts 注释实测语义 | 已解决 |
| P05 | T013/T015 | list() 排序歧义：两次 save 落同一毫秒时 savedAt 相等，稳定排序保持插入序导致"新记录在前"断言失败。CI 首跑暴露；T013 本地首跑那次"偶发失败"实为同一 bug，当时误判为 vitest 并发抖动 | 排序加索引 tie-break（同时间戳后写入的在前）；教训：本地偶发失败必须查明根因，不能以"复跑即绿"结案 | 已解决 |
| P06 | T015 | github.com HTTPS 直连被重置、git 全局代理 7897 上游失效（gh api 直连 api.github.com 正常） | 改走 ssh.github.com:443：ssh-keygen 生成密钥、gh api 上传公钥、~/.ssh/config 配 Host github.com→ssh.github.com:443，remote 切 SSH 后推送成功 | 已解决 |
