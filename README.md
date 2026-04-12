<div align="center">

# WetlandShield

> 湿地生态监测大屏脚手架（Vue 3 + Vite + NestJS）

![Vue 3](https://img.shields.io/badge/Vue-3-42b883) ![Vite](https://img.shields.io/badge/Vite-8-646cff) ![NestJS](https://img.shields.io/badge/NestJS-11-e0234e) ![pnpm](https://img.shields.io/badge/pnpm-10-ff6c37)

一套面向湿地监测场景的前后端最小闭环：前端负责大屏可视化展示与交互，后端统一代理 AI 接口并承接临时业务记录。数据层目标采用 `Postgres + ClickHouse`，当前阶段也支持纯 mock / 演示方式运行，不强依赖数据库。

[快速开始](#快速开始) · [API](#api) · [文档](#文档) · [项目结构](#项目结构)

</div>

---

## 关键特性

- Vue 3 + Vite 前端大屏，适配 16:9 监控场景
- NestJS 后端，统一提供 `/api` 前缀接口
- 支持 OpenAI 兼容的 `/chat/completions` 代理与流式输出
- 支持“确认异常”“记录处理”的后端内存态记录接口
- 当前可使用 mock 数据与演示链路，便于先做界面与交互闭环
- 目标数据架构采用 Postgres + ClickHouse，适合后续承接业务记录与监测时序

## 快速开始

```bash
pnpm install
pnpm dev:server
pnpm dev:web
```

默认地址：

- 前端：`http://localhost:5173`
- 后端：`http://localhost:3000/api`

如果只做构建验证：

```bash
pnpm build
pnpm typecheck
```

## 开发脚本

| 命令              | 说明         |
| ----------------- | ------------ |
| `pnpm dev:web`    | 仅启动前端   |
| `pnpm dev:server` | 仅启动后端   |
| `pnpm build`      | 构建所有子包 |
| `pnpm typecheck`  | 全量类型检查 |

## 环境变量

后端配置由 `apps/server/src/config.ts` 读取，常用变量如下：

```bash
PORT=3000
API_PREFIX=/api
AI_BASE_URL=https://api.deepseek.com/v1
AI_API_KEY=your_api_key
AI_MODEL=deepseek-chat
AI_TIMEOUT_MS=30000
```

前端参考 `apps/web/.env.example`：

```bash
VITE_API_BASE=/api
VITE_PROXY_TARGET=http://localhost:3000
VITE_DEV_HOST=0.0.0.0
VITE_DEV_PORT=5173
VITE_PREVIEW_HOST=0.0.0.0
VITE_PREVIEW_PORT=4173
```

## API

当前对外接口：

- `POST /api/chat/completions`
- `GET /api/records/current`
- `POST /api/records/confirm-abnormal`
- `POST /api/records/record-action`

接口细节与示例见：

- `apps/server/docs/api.md`
- `apps/server/docs/chat.http`
- `apps/server/docs/records.http`

## 数据架构说明

项目的数据层目标方案为：

- `Postgres`
  承载异常确认、处置记录、组织用户、配置等结构化业务数据
- `ClickHouse`
  承载监测指标时序、聚合分析结果、图表查询与大屏历史数据回放

当前仓库已完成最小闭环：

- 前端可以使用 mock 展示数据
- 后端记录接口当前只做内存临时存储
- 可接入 Postgres / ClickHouse

## 文档

- `apps/server/README.md`：后端模块、配置与接口说明
- `apps/web/README.md`：前端结构、页面职责与交互说明
- `docs/info/main.md`：项目主说明草稿
- `docs/info/watch_panel.md`：大屏设计与看板说明
- `docs/report/1.md`：阶段性报告

## 项目结构

```text
WetlandShield/
├── apps/
│   ├── server/                 # NestJS API
│   └── web/                    # Vue 3 + Vite 大屏前端
├── docs/                       # 项目资料与设计文档
├── playground/                 # 试验代码与参考实现
├── package.json                # 工作区脚本
├── pnpm-workspace.yaml         # pnpm workspace
└── tsconfig.base.json          # TS 基础配置
```

## 当前状态

- 前端大屏主体、左右图表、中部地图和 AI 建议区已形成最小闭环
- 后端已支持 AI 流式代理和底部记录接口
- 数据存储层仍可先以 mock 与内存态方式演示
- 后续接入真实监测接口、Postgres 与 ClickHouse 时，不需要推翻当前目录结构

## 下一步你可以做的

1. 接入真实湿地监测数据源，替换当前 mock 指标与占位文案
2. 将 `records` 模块落到 Postgres，形成可追溯业务记录
3. 将图表与历史趋势查询接入 ClickHouse
4. 为 AI 能力增加鉴权、审计和更完整的上下文管理
