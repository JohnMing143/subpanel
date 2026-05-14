# subpanel

一个免登录的代理配置定制工具。它参考 SubBoost 的核心工作流，但不包含账户、服务端持久订阅等功能。当前配置会保存在浏览器 `localStorage`。

## 运行

```bash
npm start
```

然后打开：

```text
http://127.0.0.1:4173
```

## Cloudflare Workers

项目已经包含 Worker 入口和 Wrangler 配置：

```bash
npm run worker:dev
npm run deploy
```

Cloudflare Workers 部署会使用 `worker.mjs` 处理 `/api/fetch` 和 `/api/resolve`，静态页面由 `public/` 目录作为 Workers Assets 提供。

## 功能

- 一个粘贴框同时支持订阅链接、Clash/Mihomo YAML 和节点链接；`http/https` 按订阅抓取，其他 `scheme://` 按节点解析。
- 本地服务提供 `/api/resolve` 和 `/api/fetch`，用于识别混合输入并绕过浏览器 CORS 抓取订阅。
- 支持常见节点协议解析：`ss`、`ssr`、`vmess`、`vless`、`trojan`、`hysteria2/hy2`、`tuic`、`anytls`、`socks`。
- 默认界面只保留输入、模板、分流去向、生成、复制和下载。
- 分流去向可按策略组切换代理/直连，默认收起在主流程内。
- 高级设置默认收起：配置名称、端口、节点改名/停用/监听端口、筛选代理组、链式 relay、自定义规则、DNS 覆盖。
- 内置基础、日常、完整模板，模板模块和规则集按原版 SubBoost 的生成逻辑对齐。
- 生成 `rule-providers` 并使用 MetaCubeX `mrs` 规则集，基础模板也包含广告、私有网络、国内服务、非中国和兜底规则。
- 生成 Mihomo/Clash YAML，支持复制和下载。
- 生成前会校验端口、URL、正则、节点必需字段、DNS YAML 基本结构和生成文本中的明显非法值。

## 说明

没有账号系统，也不会把配置写入数据库。订阅链接模式会通过当前部署的 `/api/resolve` 或 `/api/fetch` 拉取远程订阅；如果远程订阅需要特殊 User-Agent，可以在导入源里填写。
