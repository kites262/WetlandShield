# Server

`apps/server` 是 WetlandShield 的后端 API 服务，基于 NestJS 构建。

当前阶段以后端网关和演示接口为主：一方面代理上游 OpenAI 兼容模型接口，另一方面提供大屏底部交互所需的内存态记录接口。它不强依赖数据库即可运行，适合先完成前后端联调与 mock 演示。

## 职责

- 对前端统一暴露 `/api` 前缀下的服务接口
- 代理上游 AI `chat/completions` 能力，并兼容流式输出
- 为“确认异常”“记录处理”提供临时内存存储与状态汇总
- 为后续接入 Postgres、ClickHouse 与真实业务模块预留扩展位置

## 模块

### `chat`

OpenAI 兼容聊天代理模块。

- `POST /chat/completions`

能力说明：

- 接收 OpenAI 风格的 `messages` 请求体
- 将请求转发到配置的上游 AI 服务，如 DeepSeek
- 支持非流式 JSON 返回
- 支持 `stream: true` 的 SSE 流式透传

### `records`

底部按钮交互记录模块。

- `GET /records/current`
- `POST /records/confirm-abnormal`
- `POST /records/record-action`

能力说明：

- 在服务进程内临时保存异常确认记录和处理记录
- 返回当前所有记录与派生状态，如 `pendingAction`
- 便于大屏在不接数据库时完成最小业务闭环

## 源码结构

```text
apps/server
├── docs
│   ├── api.md
│   ├── chat.http
│   └── records.http
├── src
│   ├── app.module.ts
│   ├── config.ts
│   ├── main.ts
│   └── modules
│       ├── chat
│       │   ├── chat.controller.ts
│       │   ├── chat.dto.ts
│       │   ├── chat.module.ts
│       │   ├── chat.service.ts
│       │   └── chat.types.ts
│       └── records
│           ├── records.controller.ts
│           ├── records.dto.ts
│           ├── records.module.ts
│           ├── records.service.ts
│           └── records.types.ts
├── package.json
├── tsconfig.build.json
└── tsconfig.json
```

## 文件职责

### 入口与配置

- `src/main.ts`
  启动 Nest 应用，开启 CORS，并挂载全局 API 前缀。
- `src/app.module.ts`
  聚合当前服务端模块，是整个服务的模块入口。
- `src/config.ts`
  读取并归一化环境变量，统一导出端口、API 前缀与 AI 上游配置。

### `chat` 模块

- `src/modules/chat/chat.controller.ts`
  暴露 `POST /chat/completions`，根据 `stream` 选择普通返回或流式返回。
- `src/modules/chat/chat.service.ts`
  负责请求校验、上游调用、错误转换和 SSE 透传。
- `src/modules/chat/chat.dto.ts`
  定义控制器接收的请求结构。
- `src/modules/chat/chat.types.ts`
  定义 OpenAI 兼容请求与响应类型。

### `records` 模块

- `src/modules/records/records.controller.ts`
  暴露记录查询与写入接口。
- `src/modules/records/records.service.ts`
  在内存中维护确认记录、处理记录，并生成当前状态快照。
- `src/modules/records/records.dto.ts`
  定义写入接口的请求体结构。
- `src/modules/records/records.types.ts`
  定义记录实体、状态快照和响应模型。

## 运行方式

```bash
pnpm --filter @wetland-shield/server dev
```

或构建后启动：

```bash
pnpm --filter @wetland-shield/server build
pnpm --filter @wetland-shield/server start
```

默认地址：

- 服务：`http://localhost:3000`
- 默认 API 前缀：`/api`

## 环境变量

服务端配置由 `src/config.ts` 统一读取。

建议在 `apps/server/.env` 中配置：

```bash
PORT=3000
API_PREFIX=/api
AI_BASE_URL=https://api.deepseek.com/v1
AI_API_KEY=your_api_key
AI_MODEL=deepseek-chat
AI_TIMEOUT_MS=30000
```

字段说明：

- `PORT`：服务监听端口
- `API_PREFIX`：全局 API 前缀，默认 `/api`
- `AI_BASE_URL`：上游 OpenAI 兼容服务地址
- `AI_API_KEY`：上游服务鉴权密钥
- `AI_MODEL`：可选默认模型名；当请求体未传 `model` 时使用。若客户端传入
  `model`，服务会保留客户端选择，便于 Codex 等 Agent 使用支持工具调用的模型。
- `AI_TIMEOUT_MS`：请求超时时间，单位毫秒

## 当前接口

- `POST /api/chat/completions`
- `GET /api/records/current`
- `POST /api/records/confirm-abnormal`
- `POST /api/records/record-action`

接口样例见：

- `docs/api.md`
- `docs/chat.http`
- `docs/records.http`

## 当前限制

- `records` 模块仅做内存存储，服务重启后数据会清空
- 当前未接入 Postgres 或 ClickHouse
- AI 能力依赖外部兼容 OpenAI 的上游服务

## 后续扩展建议

- 将 `records` 模块接入 Postgres，沉淀结构化业务记录
- 将监测时序与分析结果接入 ClickHouse，支撑大屏历史趋势查询
- 增加真实监测数据聚合模块，如断面、预警、指标与地图图层服务
- 对 AI 代理增加鉴权、限流、审计和调用日志
