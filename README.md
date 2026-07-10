# 在测版本驾驶舱

面向测试质量团队的版本态势可视化系统。提供在测版本列表的筛选检索和单个版本的深度评估视图，帮助快速定位高风险版本和评估质量风险。

## 功能

### 版本列表页

- **搜索**：匹配版本摘要、系统名、团队、负责人、版本 ID
- **筛选**：按风险等级（高 / 中 / 低）、状态筛选
- **排序**：风险优先、总分升降序、快照最新
- **风险统计**：高 / 中 / 低风险版本数量概览
- **紧凑数据行**：一屏显示更多版本，左侧风险色条快速识别

### 版本详情页

- **Score Cockpit**：总分大字号主视觉，质量分 / 行为分辅助模块
- **版本身份横条**：系统、团队、负责人、审计时间一行展示
- **图表区**：
  - 阶段雷达图（SVG 绘制动画）
  - 阶段得分条（`meter` 语义 + 填充动画）
  - 指标得分卡网格（进度环 + 风险色边框）
- **指标风险清单**：按风险分级显示，hover 反馈
- **执行摘要**：实际周期、覆盖率、缺陷、智能测试

### 主题切换

- 浅色 / 深色 / 跟随系统三种模式
- 通过 CSS 变量实现全站主题切换
- 选择记录到 `localStorage`，刷新保持
- 页面加载前内联脚本设主题，无闪烁

## 技术栈

- React 19 + TypeScript
- Vite 构建
- React Router 路由
- 原生 CSS（CSS 变量 + 响应式）
- Vitest 单元测试
- lucide-react 图标

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 运行测试
npm test

# 生产构建
npm run build

# 预览构建产物
npm run preview
```

## Nginx 内网部署

这个项目的 ted-sbrain 客户端支持两种模式：

- 直接请求绝对后端地址
- 请求同源 `/ted-sbrain/...`，再由代理层转发

浏览器内网部署推荐第二种。原因是当前客户端默认会把空的 `VITE_TED_SBRAIN_API_BASE_URL` 解释成同源路径，生成 `/ted-sbrain/...` 请求；如果把它配置成 `http://172.21.126.221:49152` 这样的绝对地址，浏览器会把它当成跨域请求，后端没有返回 `Access-Control-Allow-Origin` 时就会被拦截。

推荐做法：

1. 构建前显式清空 `VITE_TED_SBRAIN_API_BASE_URL`
2. 让 Nginx 代理 `/ted-sbrain/` 到真实后端

```bash
VITE_TED_SBRAIN_API_BASE_URL= npm run build
```

```nginx
location / {
    root /srv/test_brain/dist;
    try_files $uri $uri/ /index.html;
}

location /ted-sbrain/ {
    proxy_pass http://172.21.126.221:49152;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

部署后在浏览器里确认接口地址是 `http://前端域名/ted-sbrain/...`，而不是 `http://172.21.126.221:49152/...`。如果仍然看到后者，说明前端包是带着旧的 Vite 环境变量构建出来的，需要重新构建并重新发布。

## 目录结构

```
src/
├── components/           # UI 组件
│   ├── InfoPanel.tsx          # 通用信息面板
│   ├── MetricRiskList.tsx     # 指标风险清单
│   ├── MetricScoreCards.tsx   # 指标得分卡网格
│   ├── PhaseScoreBars.tsx     # 阶段得分条
│   ├── RadarChart.tsx         # 阶段雷达图
│   ├── ScoreHero.tsx          # 分数主视觉
│   ├── ThemeSwitcher.tsx      # 主题切换器
│   └── VersionRowCard.tsx     # 列表行卡片
├── contexts/             # React Context
│   ├── ThemeContext.tsx       # 主题 Provider
│   └── themeHelpers.ts        # 主题解析纯函数
├── data/                 # 数据层
│   └── versionMock.ts         # Mock 数据与格式化工具
├── pages/                # 页面
│   ├── VersionListPage.tsx    # 版本列表页
│   ├── VersionDetailPage.tsx  # 版本详情页
│   └── versionListFilters.ts  # 筛选排序纯函数
├── styles.css            # 全局样式（CSS 变量 + 响应式）
├── App.tsx               # 路由
└── main.tsx              # 入口
```

## 测试

测试覆盖纯函数和组件渲染：

| 测试文件 | 覆盖内容 |
|---------|---------|
| `themeHelpers.test.ts` | 主题解析、localStorage 读写、系统模式 |
| `versionListFilters.test.ts` | 搜索、筛选、排序、风险统计 |
| `versionMock.test.ts` | 数据完整性、格式化函数 |
| `PhaseScoreBars.test.tsx` | meter 语义和宽度计算 |
| `RadarChart.test.ts` | 雷达图坐标计算和动画结构 |

```bash
npm test
```

## 数据说明

当前使用 mock 数据，包含 100 条在测版本记录，覆盖多个系统、团队、风险等级和状态。数据结构模拟后端接口，后续接入真实接口时替换 `versionMock.ts` 即可。
