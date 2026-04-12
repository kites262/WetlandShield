# Web

`apps/web` 是 WetlandShield 的前端大屏项目，基于 Vue 3 + Vite 构建。

当前目标是先完成湿地生态监测大屏的最小闭环：展示多区域图表、地图底图、风险动态、AI 研判建议，以及底部人工确认与处理记录交互。页面优先面向 16:9 大屏展示，同时保留基础响应式能力，便于后续接入真实接口和更多业务面板。

## 职责

- 作为湿地监测大屏展示层，负责渲染顶部栏、左右侧图表、中部地图与研判区
- 调用后端统一接口，不在浏览器中直接暴露上游 AI 服务
- 以流式方式展示 AI 生成建议，提升等待过程中的可感知性
- 调用后端记录接口，完成“确认异常”“记录处理”的前后端联动
- 管理页面加载态、滚动内容区、弹窗与自适应缩放行为

## 源码结构

```text
apps/web
├── src
│   ├── main.ts
│   ├── App.vue
│   ├── style.css
│   ├── env.d.ts
│   ├── config.ts
│   ├── assets
│   │   ├── README.md
│   │   ├── fontawesome
│   │   ├── fonts
│   │   └── images
│   ├── components
│   │   ├── ChartSummaryBar.vue
│   │   ├── WetlandChart.vue
│   │   ├── WetlandChart1.vue
│   │   ├── WetlandChart2.vue
│   │   ├── WetlandChart3.vue
│   │   ├── WetlandChart4.vue
│   │   ├── WetlandChart5.vue
│   │   ├── WetlandChart6.vue
│   │   └── index.ts
│   ├── composables
│   │   ├── index.ts
│   │   ├── useEcharts.ts
│   │   └── useVerticalMarquee.ts
│   ├── layout
│   │   ├── Layout.vue
│   │   ├── LayoutFooter.vue
│   │   ├── LayoutHeader.vue
│   │   ├── LayoutLoading.vue
│   │   ├── LayoutPanel.vue
│   │   └── index.ts
│   ├── services
│   │   ├── ai.ts
│   │   └── records.ts
│   └── types
│       ├── ai.ts
│       └── records.ts
├── index.html
├── package.json
├── README.md
├── tsconfig.json
└── vite.config.ts
```

## 文件职责

### 入口与全局配置

- `src/main.ts`
  创建 Vue 应用，挂载根组件，并初始化 `autofit.js` 以适配大屏尺寸。
- `src/App.vue`
  负责页面骨架、中部地图与建议区、左右面板组合，以及 AI 建议交互。
- `src/style.css`
  承载全局视觉基础样式。
- `src/config.ts`
  统一读取 `import.meta.env`，向运行时与 Vite 配置提供 API 与本地开发参数。
- `vite.config.ts`
  配置 Vue 插件、开发服务器和 `/api` 代理。

### 布局层

- `src/layout/Layout.vue`
  定义整页三栏布局、主区域占位关系和响应式切换。
- `src/layout/LayoutHeader.vue`
  定义顶部标题、时间和通知区域。
- `src/layout/LayoutFooter.vue`
  定义底部两个按钮及其弹窗，并联动后端记录接口。
- `src/layout/LayoutPanel.vue`
  封装左右侧通用卡片的标题和背景结构。
- `src/layout/LayoutLoading.vue`
  负责页面初始加载过渡。

### 图表与展示组件

- `src/components/WetlandChart.vue`
  右上联动卡片，展示重点断面风险画像。
- `src/components/WetlandChart1.vue`
  左中图表，展示月度水位与生态补水。
- `src/components/WetlandChart2.vue`
  左下图表，展示年度植被覆盖率对比。
- `src/components/WetlandChart3.vue`
  左上图表，展示近 30 日降水过程。
- `src/components/WetlandChart4.vue`
  右下指标卡，展示关键环境指标。
- `src/components/WetlandChart5.vue`
  风险处置动态滚动卡片。
- `src/components/WetlandChart6.vue`
  右侧详情联动卡片。
- `src/components/ChartSummaryBar.vue`
  图表顶部的补充摘要指标。

### 可复用能力

- `src/composables/useEcharts.ts`
  封装 ECharts 初始化、生命周期与销毁逻辑。
- `src/composables/useVerticalMarquee.ts`
  封装纵向滚动动态的节奏控制与数据切换。

### 服务与类型

- `src/services/ai.ts`
  调用后端 `/api/chat/completions`，并解析 SSE 流式结果。
- `src/services/records.ts`
  调用后端记录接口，获取当前状态并提交异常确认和处理记录。
- `src/types/ai.ts`
  定义前端消费的 OpenAI 兼容响应类型。
- `src/types/records.ts`
  定义确认记录、处理记录和状态快照类型。

## 页面交互流程

1. 页面启动后，`main.ts` 初始化 Vue 与大屏自适配。
2. `App.vue` 先展示加载态，再渲染地图区、建议区和左右卡片。
3. 用户在“预警研判建议”中输入追问后，前端向 `/api/chat/completions` 发起流式请求。
4. `src/services/ai.ts` 持续解析 SSE 数据块，并将文本逐步回填到建议卡片中。
5. 页面底部按钮在 `onMounted` 时调用 `/api/records/current` 获取当前记录状态。
6. 用户点击“确认异常”或“记录处理”后，弹窗提交到 `/api/records/*` 接口，再回写当前状态。

## 为什么这样拆分

- 布局、图表、服务与类型分层明确，便于逐步从演示版扩展到业务版
- 让页面视觉实现和接口调用分离，后续替换数据源时不需要重写大部分组件
- 将 AI 流式解析收敛到 `services/ai.ts`，避免流式处理逻辑散落在视图层
- 将底部业务交互收敛到 `services/records.ts` 和 `LayoutFooter.vue`，后续改成真实入库时改动面更集中

## 运行方式

```bash
pnpm --filter @wetland-shield/web dev
```

默认地址：

- 开发：`http://localhost:5173`
- 预览：`http://localhost:4173`

## 环境变量

前端运行配置统一由 `src/config.ts` 读取。

参考 `apps/web/.env.example`：

```bash
VITE_API_BASE=/api
VITE_PROXY_TARGET=http://localhost:3000
VITE_DEV_HOST=0.0.0.0
VITE_DEV_PORT=5173
VITE_PREVIEW_HOST=0.0.0.0
VITE_PREVIEW_PORT=4173
```

字段说明：

- `VITE_API_BASE`：前端请求接口前缀
- `VITE_PROXY_TARGET`：本地开发代理目标地址
- `VITE_DEV_HOST` / `VITE_DEV_PORT`：开发服务器地址
- `VITE_PREVIEW_HOST` / `VITE_PREVIEW_PORT`：预览服务器地址

## 静态资源约定

- 当前使用的本地图标、字体和背景图已整理到 `src/assets/`
- 后续新增素材时，请先下载静态资源文件并提交入库，再在代码中引用
- 当前地图底图允许使用外链热链，未来可替换为自有后端下发

## 后续扩展建议

- 将地图底图、断面图层和指标明细切换为后端动态返回
- 为底部记录补充历史查看、筛选与已处理状态展示
- 为 AI 建议增加取消生成、重试和历史上下文管理
- 继续细分 `views`、`stores` 或领域模块，支撑更多业务页面
