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

**Git**：`feat: T003 卦典数据（64卦全量+交叉校验）`

---

## 问题追踪

<!-- 遇到的问题记录在此，方便回溯 -->
| 编号 | 任务 | 问题 | 解决方案 | 状态 |
|------|------|------|---------|------|
| P01 | T002 | progress.md 编辑失误，T002 条目覆盖了 T001 的 Git 行 | 事后恢复 T001 Git 行 | 已解决 |
| P02 | T003 | progress.md 二次编辑失误，T003 条目插入 T001/T002 之间致 T002 正文失头 | 按"只追加"原则整体重写日志区，恢复 T001→T002→T003 顺序；后续追加一律锚定文件末尾 | 已解决 |
