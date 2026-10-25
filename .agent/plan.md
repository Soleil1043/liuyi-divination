# 设计说明书 (Plan)

> Phase 2（方案设计）产出。基于 spec.md 设计架构；对话式迭代，必须由用户主动宣布"方案设计阶段结束，进入任务拆解"后才进入 Phase 3。
> 状态标记：✅ 已确认 | 🔄 待确认 | ❌ 需修改

**状态**：✅ 已确认

---

## 1. 技术选型

> 每个选择在对话中讨论确定，附优势与代价。

| 层面 | 选择 | 理由 | 代价/权衡 |
|------|------|------|----------|
| 语言 | TypeScript ~5.x | 排盘引擎的数据结构需要类型约束，正确性是本项目命门 | 构建链比裸 JS 复杂一层 |
| UI 框架 | Vue 3（Composition API + `<script setup>`）+ Vite | 单页应用规模刚好；组件化清晰；生态成熟稳定 | 需要 Node 构建流程（自用无碍） |
| 历法库 | lunar-javascript（MIT） | 公历→干支四柱/节气/旬空是排盘最易错的坑，用专业现成实现；支持早晚子时配置（E04） | 需自写 TS 声明文件 `lunar.d.ts` |
| 路由/状态 | **不引** vue-router / Pinia | 仅 3 个视图，顶层视图状态机切换足够；自用无需 URL 语义 | 视图无 URL 直达（可接受） |
| 动画 | CSS3 + SVG + Vue `<Transition>` | 铜钱翻转/逐爻点亮用 CSS 实现足够，零额外依赖 | 复杂物理感需手写 keyframes（可控） |
| 测试 | Vitest | 引擎纯函数单测 + golden 用例 | 无 |
| 代码质量 | ESLint（flat config）+ Prettier | CI 门禁 | 配置成本小 |
| 包管理 | npm | Windows 环境零配置可用 | 无 |
| 数据存储 | localStorage（单键 JSON 数组） | 每条记录 <1KB，500 条 << 5MB 上限；零依赖零后端 | 无痕模式不可用 → E06 降级；清数据丢失（spec 假设已接受） |
| 部署 | GitHub Pages 静态托管 | 免费、开源自用 | 大陆访问速度一般（自用可接受） |
| 开源协议 | MIT | 代码与自写白话译文版权自持，随仓库 MIT 发布 | 无 |

版本策略：T001 脚手架任务当日以 latest stable 锁定 `package-lock.json`，上表主版本约束为准。

## 2. 目录结构

```
liuyi-divination/
├── index.html
├── package.json / vite.config.ts / tsconfig.json
├── .github/workflows/ci.yml        # lint + test
├── src/
│   ├── main.ts
│   ├── App.vue                     # 顶层视图状态机：casting / result / history
│   ├── engine/                     # 排盘核心（纯函数，不依赖 DOM/Vue，可独立测试）
│   │   ├── types.ts                # YaoValue / Line / Coin / Paipan / Citation 等类型
│   │   ├── lunar.d.ts              # lunar-javascript 类型声明
│   │   ├── calendar.ts             # 公历→四柱干支、旬空（包装 lunar，早晚子时规则）
│   │   ├── hexagram.ts             # 64 卦查表：爻值→卦、八宫归属、世爻位
│   │   ├── najia.ts                # 纳甲装卦（各爻干支）
│   │   ├── relatives.ts            # 六亲 / 六兽 / 世应 / 伏神
│   │   ├── paipan.ts               # 排盘编排：lines + castAt → 完整盘面
│   │   ├── biangua.ts              # 朱熹变占法取辞（0–6 动爻规则表）
│   │   └── cast.ts                 # 三钱摇卦随机（RNG 可注入用于测试）
│   ├── data/
│   │   ├── hexagrams.json          # 64 卦卦爻辞（原文 + 白话）+ 乾坤用九用六
│   │   └── types.ts
│   ├── storage/
│   │   └── records.ts              # localStorage CRUD + 可用性降级检测
│   ├── ui/
│   │   ├── theme.css               # 甲·鎏金暗夜 design tokens + 基础样式
│   │   ├── components/
│   │   │   ├── CoinToss.vue        # 三枚铜钱摇卦动画
│   │   │   ├── LineStack.vue       # 六爻卦象（逐爻点亮、动爻标记）
│   │   │   ├── PaipanTable.vue     # 完整排盘表
│   │   │   ├── Reading.vue         # 白话概括 + 原文片段
│   │   │   └── RecordList.vue      # 历史列表项
│   │   └── views/
│   │       ├── CastView.vue        # 填写所问之事 + 摇卦
│   │       ├── ResultView.vue      # 排盘 + 解读 + 编辑所问
│   │       └── HistoryView.vue     # 历史列表 + 详情回看 + 删除
│   └── app.css
├── tests/
│   ├── fixtures/golden.json        # ≥10 个权威核对卦例
│   ├── engine/                     # 排盘引擎各模块单测
│   └── biangua.spec.ts             # 0–6 动爻取辞全覆盖用例
├── .agent/
├── AGENTS.md
└── README.md
```

## 3. 数据模型

### 卦例记录 HexagramRecord（localStorage 键：`jingyao:records`，JSON 数组）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | string | UUID，唯一 | 记录主键 |
| question | string | 1–50 字符 | 所问之事（摇前必填，摇后可编辑，F01） |
| lines | number[6] | 每项 ∈ {6,7,8,9}，自下而上 | 6=老阴(动) 7=少阳 8=少阴 9=老阳(动) |
| castAt | string | ISO 8601（含时区） | 起卦时刻，排盘重算依据 |
| savedAt | string | ISO 8601 | 保存时刻，历史列表排序用 |

### 卦典数据 hexagrams.json（静态资源）

| 字段 | 类型 | 说明 |
|------|------|------|
| number | 1–64 | 文王卦序 |
| name | string | 卦名（如「天风姤」） |
| binaryKey | string | 六位 0/1，自下而上；爻值序列→卦的映射键 |
| palace / worldPos | string / 1–6 | 八宫归属、世爻位置（预计算存表，运行时查表） |
| guaci | { origin, vernacular } | 卦辞原文 / 白话 |
| xiang | { origin, vernacular } | 大象传原文（公版，v1.1 新增）/ 白话「卦意」 |
| yaoci | [6] { origin, vernacular } | 初至上爻辞原文 / 白话 |
| special | { yongjiu?, yongliu? } | 仅乾坤：用九 / 用六（原文 + 白话） |

### 排盘输出 Paipan（引擎运行时对象，不持久化）

四柱干支与旬空、本卦/变卦（名、宫、世应）、每爻的纳甲干支/六亲/六兽/动标记/伏神、取辞结果 `Citation[]`。

### 数据关系

无表间关系：单一记录集合 + 静态卦典，展示时由引擎按 `lines + castAt` 现场重算（D003）。

## 4. 核心模块接口设计（纯前端，无后端 API）

> 本项目为纯静态网页，无网络 API；以引擎与存储模块接口代替，覆盖全部 Fxx。

| 编号 | 模块接口 | 签名 | 描述 | 对应需求 |
|------|---------|------|------|---------|
| M01 | engine/cast `castOneYao` | `(rng?: () => number) => { coins: CoinSide[3]; value: 6\|7\|8\|9 }` | 掷三枚铜钱定一爻；RNG 可注入（测试确定性） | F02, E03 |
| M02 | engine/paipan `paipan` | `(lines: number[6], castAt: Date) => Paipan` | 完整排盘：四柱、纳甲、六亲、六兽、世应、旬空、伏神、变卦 | F03, E04 |
| M03 | engine/biangua `getCitations` | `(lines: number[6], hexagrams) => Citation[]` | 朱熹变占法取辞，返回原文+白话引文列表 | F04, E05 |
| M04 | storage/records | `save / list / update / remove / isAvailable` | localStorage CRUD；不可用时返回降级标志 | F05, E06, F01 |
| M05 | ui 视图流（App.vue 状态机） | `casting → result → history` | 视图切换；未完成摇卦不落库（E02） | F01–F05 |

## 5. 第三方依赖

| 包名 | 版本策略 | 用途 |
|------|---------|------|
| vue | ^3.5 | UI 框架 |
| vite | latest stable（锁 minor） | 构建与开发服务器 |
| typescript | ~5.x | 语言 |
| vitest | latest stable | 单元测试 |
| lunar-javascript | ^1.7 | 干支历法（四柱、旬空、节气） |
| @vitejs/plugin-vue | 与 vite 匹配 | Vue SFC 支持 |
| vue-tsc | latest stable | 类型检查 |
| eslint / prettier | latest stable | Lint 与格式化 |

不引入：vue-router、Pinia、GSAP、组件库、字体外链（D006 轻依赖原则）。

## 6. 关键技术决策

> 已同步写入 decisions.md（D001–D006）。

- **D001 技术栈**：Vue 3 + Vite + TS + Vitest，而非原生 JS / React / Svelte——排盘正确性依赖类型与测试基建。
- **D002 历法**：lunar-javascript 而非自实现——干支历（节气换月、早晚子时）自实现风险高，库成熟且 MIT。
- **D003 存储**：卦例只存原始数据（lines + castAt + question），展示时重算——存储极小，算法/译文改进后历史卦例自动受益；依赖确定性约束。
- **D004 视觉**：「甲 · 鎏金暗夜」——墨黑底 + 鎏金铜钱 + 朱砂点缀，仪式感最强，与占卜场景契合。
- **D005 白话译文**：AI 起草 + 作者校对、版权自持（随仓库 MIT）——现成现代译本有版权不可用；开源汇编数据需逐一核实，核实到许可兼容的可替换。
- **D006 轻依赖**：不引路由/状态库/动画库/组件库——3 视图用状态机、动效用 CSS/SVG、样式手写国风；换来零冗余依赖与最小产物。

## 7. 视觉设计规范（甲 · 鎏金暗夜）

- **色彩 token**：背景 `#0F0C09`（墨黑）、面板 `#1A1610`、主金 `#C9A55C`、亮金 `#E8C87E`、朱砂 `#A63A2B`（动爻点缀）、纸白 `#EDE3CF`（正文）。
- **字体**：系统衬线栈 `"Noto Serif SC", "Source Han Serif SC", "STSong", "SimSun", serif`，零外链。
- **铜钱**：SVG 圆形方孔钱，字面（有字）与纹面（背面）两种贴图；摇卦时 3D 翻转 + 落定弹跳。
- **动效**：爻自下而上逐一点亮（stagger 0.4s）；动爻呼吸金光；成卦时卦名渐显；全程 <2s 不拖节奏。
- **布局**：单列纵向流，`max-width: 720px` 居中，桌面/移动自适应。

## 8. 测试与验收策略

- **golden 用例**（`tests/fixtures/golden.json`，≥10 例）：与 najia 参照实现及权威在线排盘人工核对，覆盖：多动爻、伏神、旬空、晚子时（E04）。
- **变占法用例**：0–6 动爻七种情形全覆盖（E05），断言取辞规则。
- **概率测试**：注入确定性 RNG 序列断言单次结果；大样本断言分布比例 1/8、1/8、3/8、3/8（±2% 容差）。
- **存储测试**：mock localStorage 抛异常 → 降级路径（E06）；中断摇卦不落库（E02）。
- **CI**：GitHub Actions，push 触发 lint + test。

## 9. 构建与部署

- 开发：`npm run dev`（Vite DevServer，Windows 直接可用）。
- 产物：`npm run build` → `dist/` 纯静态文件。
- 发布：GitHub Actions 构建并部署到 GitHub Pages（Phase 5 配置）。
