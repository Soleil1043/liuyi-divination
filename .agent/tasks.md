# 任务清单 (Tasks)

> Phase 3 产出。基于 plan.md 拆解，用户确认后进入 Phase 4 逐个执行。
> 规则：1 个任务 = 1 个可独立验证的功能点 | 严格按顺序执行 | 不跳依赖 | 每个任务标注覆盖的需求编号

---

## 任务格式说明

```
- [ ] T0XX: [任务名] | 依赖: [T0XX或无] | 涉及文件: [路径] | 验收: [标准] | 覆盖: [Fxx/Exx 或 无(基础设施)]
```

## 任务列表

<!-- 基础设施层 -->
- [x] T001: 工程脚手架（Vite + Vue 3 + TS + Vitest + ESLint/Prettier） | 依赖: 无 | 涉及文件: 项目根（package.json / vite.config.ts / tsconfig.json / index.html / src/main.ts / .gitignore） | 验收: `npm run dev` 可打开空白页；`npm run lint`、`npm run test`、`npm run build` 全部通过；依赖版本锁定 package-lock | 覆盖: 无（基础设施）
- [x] T002: 主题与视图骨架（甲·鎏金暗夜 design tokens + App.vue 三视图状态机） | 依赖: T001 | 涉及文件: src/ui/theme.css / src/App.vue / src/app.css / src/ui/views/ 空壳 | 验收: dev 打开可见暗色金调页面骨架，三视图可手动切换占位 | 覆盖: 无（基础设施）

<!-- 数据层 -->
- [x] T003: 卦典数据（64 卦卦名/爻符/八宫/世爻/卦爻辞原文/乾坤用辞） | 依赖: T001 | 涉及文件: src/data/hexagrams.json / src/data/types.ts / tests/ | 验收: 完整性测试通过——64 卦齐全、每卦 6 爻辞、binaryKey 无重复、乾坤含用九用六；原文经维基文库公版抽查核对 | 覆盖: F03, F04
- [x] T004: 白话译文数据（64 卦 + 386 条爻辞，AI 起草初稿） | 依赖: T003 | 涉及文件: src/data/hexagrams.json | 验收: 完整性测试通过——每卦 guaci.vernacular 与 6 条 yaoci[].vernacular 均非空 | 覆盖: F04

<!-- 排盘引擎层 -->
- [ ] T005: 摇卦随机引擎（三枚铜钱 → 6/7/8/9 爻值，RNG 可注入） | 依赖: T001 | 涉及文件: src/engine/types.ts / src/engine/cast.ts / tests/engine/cast.spec.ts | 验收: 确定性 RNG 注入断言单次结果；大样本比例测试通过（老阳/老阴/少阳/少阴 = 1/8, 1/8, 3/8, 3/8，±2% 容差） | 覆盖: F02
- [ ] T006: 历法引擎（公历→干支四柱 + 旬空，早晚子时规则） | 依赖: T001 | 涉及文件: src/engine/lunar.d.ts / src/engine/calendar.ts / tests/engine/calendar.spec.ts | 验收: 与权威万年历人工核对 ≥5 个时刻的四柱与旬空；含 23:00–24:00 晚子时用例（日柱不进位、时柱为子时） | 覆盖: F03, E04
- [ ] T007: 纳甲装卦（爻值→本卦/变卦映射、各爻干支） | 依赖: T003 | 涉及文件: src/engine/hexagram.ts / src/engine/najia.ts / tests/engine/ | 验收: 任一爻值序列映射卦名正确；八宫全卦纳甲干支与 najia 参照实现比对通过（抽全 8 宫 × 上下卦组合） | 覆盖: F03
- [ ] T008: 六亲/六兽/世应/伏神计算 | 依赖: T006, T007 | 涉及文件: src/engine/relatives.ts / tests/engine/ | 验收: 六亲按卦宫五行推演正确；六兽按日干起青龙正确；伏神从卦宫首卦借爻正确；用例含缺亲与不缺亲两类 | 覆盖: F03
- [ ] T009: 排盘编排 + golden 用例 | 依赖: T008 | 涉及文件: src/engine/paipan.ts / tests/fixtures/golden.json / tests/engine/paipan.spec.ts | 验收: golden ≥10 卦例（含多动爻、伏神、旬空、晚子时）与 najia/在线排盘逐字段比对全部一致 | 覆盖: F03, E04
- [ ] T010: 朱熹变占法取辞引擎 | 依赖: T003 | 涉及文件: src/engine/biangua.ts / tests/biangua.spec.ts | 验收: 0–6 动爻七种情形全覆盖用例通过（全静看卦辞；一爻动看动爻爻辞；六爻全动乾坤用九用六、余卦变卦卦辞） | 覆盖: F04, E05

<!-- UI 功能层 -->
- [ ] T011: 摇卦页（所问之事填写 + 铜钱摇卦动画 + 逐爻点亮） | 依赖: T002, T005 | 涉及文件: src/ui/views/CastView.vue / src/ui/components/CoinToss.vue / src/ui/components/LineStack.vue | 验收: 空输入无法开始摇卦（E01）；"今日一占"一键填入；连点 6 次成卦且第 n 次为第 n 爻；动画期间连点被防抖（E03）；中途刷新不落库（E02）；动爻有金色呼吸标记 | 覆盖: F01, F02, E01, E02, E03
- [ ] T012: 结果页（完整排盘表 + 白话/原文解读 + 编辑所问之事） | 依赖: T004, T009, T010, T011 | 涉及文件: src/ui/views/ResultView.vue / src/ui/components/PaipanTable.vue / src/ui/components/Reading.vue | 验收: 摇卦完成流转至此页；排盘表字段齐全（四柱、纳甲、六亲、六兽、世应、旬空、伏神、变卦）；解读白话在前原文在后；编辑所问保存后即时生效 | 覆盖: F01, F03, F04
- [ ] T013: 历史卦例（localStorage 存取 + 列表/详情/编辑/删除） | 依赖: T012 | 涉及文件: src/storage/records.ts / src/ui/views/HistoryView.vue / src/ui/components/RecordList.vue / tests/ | 验收: 成卦自动保存并出现在列表；刷新不丢；详情回看复用排盘引擎重算；编辑所问同步；删除需二次确认；localStorage 不可用时降级提示（E06） | 覆盖: F05, E06

<!-- CI/CD -->
- [ ] T014: CI 流水线（GitHub Actions lint + test） | 依赖: T013 | 涉及文件: .github/workflows/ci.yml | 验收: push 后自动跑 lint + test 全绿 | 覆盖: 无（基础设施）
- [ ] T015: 部署与文档（GitHub Pages 发布 + README 完善） | 依赖: T014 | 涉及文件: .github/workflows/deploy.yml / README.md | 验收: main 分支 push 自动构建并发布 Pages，线上可访问；README 含安装/运行/测试说明 | 覆盖: 无（交付文档）

---

## 覆盖检查（Phase 3 门禁，用户确认前逐项自查）

- [x] 每条 Fxx 至少被一个任务覆盖（F01→T011/T012/T013；F02→T005/T011；F03→T003/T006/T007/T008/T009/T012；F04→T003/T004/T010/T012；F05→T013）
- [x] 每条 Exx 有对应的校验或测试任务（E01→T011；E02→T011；E03→T011；E04→T006/T009；E05→T010；E06→T013）
- [x] 不存在既不覆盖需求、也不属于基础设施的任务（T001/T002/T014/T015 为基础设施/交付，其余均覆盖 Fxx/Exx）

---

## 进度统计

- 总任务数：15
- 已完成：4
- 进行中：0
- 待开始：11
