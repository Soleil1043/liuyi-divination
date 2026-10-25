# 静爻 (JingYao)

[![CI](https://github.com/Soleil1043/liuyi-divination/actions/workflows/ci.yml/badge.svg)](https://github.com/Soleil1043/liuyi-divination/actions/workflows/ci.yml)

极简六爻占卜网页：默念所问之事，点击摇动三枚铜钱六次成卦——白话解读在前、《周易》原文在后，附完整纳甲排盘，卦例本地留档。

线上地址：<https://soleil1043.github.io/liuyi-divination/>

## 特性

- **极简摇卦**：一事一占，填写所问之事 → 点击摇卦六次（每次三枚铜钱定一爻）→ 自动揭晓
- **完整排盘**：干支四柱、旬空、纳甲、六亲、六兽、世应、伏神、动爻与变卦，全部本地计算
- **易读解读**：按朱熹变占法取辞（0–6 动爻全覆盖），白话概括 + 原文片段，小白可读、爱好者可研
- **本地留档**：卦例存浏览器 localStorage，可回看、编辑所问之事、删除；不联网、不上传
- **鎏金暗夜**：墨黑底 + 鎏金铜钱 + 朱砂动爻点缀，铜钱 3D 翻转、逐爻点亮、动爻呼吸金光

## 快速开始

```bash
npm install        # 安装依赖
npm run dev        # 本地开发（http://localhost:5173）
npm run test       # 运行测试（78 个：引擎 golden 用例、数据完整性、存储降级等）
npm run lint       # ESLint
npm run build      # 构建产物到 dist/
npm run preview    # 本地预览构建产物
```

## 技术栈

- TypeScript ~5.9 + Vue 3（Composition API + `<script setup>`）+ Vite
- [lunar-javascript](https://github.com/6tail/lunar-javascript)（MIT）——干支四柱 / 旬空 / 节气
- Vitest —— 排盘引擎测试（[bopo/najia](https://github.com/bopo/najia) 参照实现全量交叉验证）
- 纯静态产物，GitHub Pages 部署，零后端

## 架构

```
src/
  engine/    ← 排盘核心纯函数：cast(摇卦) / calendar(历法) / hexagram(映射)
               najia(纳甲) / relatives(六亲六兽世应伏神) / paipan(编排) / biangua(变占取辞)
  data/      ← 64 卦卦爻辞（公版原文 + 自写白话，版权自持随仓库 MIT）
  storage/   ← localStorage 卦例存取（原始数据，展示时重算）
  ui/        ← views/ 三视图（摇卦 / 结果 / 历史）+ components/（铜钱、爻栈、排盘表、解读）
```

排盘确定性：同一爻值序列 + 同一起卦时间 → 盘面与解读唯一。历法口径为北京时间，晚子时（23:00–24:00）日柱不进位、时柱按次日日干起（夜子时派）。

## 开发流程

本项目以 SDD（Spec-Driven Development）范式推进：`.agent/` 目录保留完整的需求规格说明书、设计说明书、任务清单、构建日志与决策记录。

## 免责声明

本项目仅供传统文化学习与娱乐参考，占卜结果不构成任何现实建议。

## 许可证

[MIT](./LICENSE)（代码与自写白话译文均随仓库发布；《周易》原文为公有领域）
