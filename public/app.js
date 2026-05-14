const STORAGE_KEY = "subpanel-state-v1";
const LEGACY_STORAGE_KEYS = ["subboost-local-state-v1"];
const STATE_VERSION = 2;

const DEFAULT_DNS = `dns:
  enable: true
  listen: 0.0.0.0:1053
  ipv6: true
  enhanced-mode: fake-ip
  fake-ip-range: 198.18.0.1/16
  fake-ip-filter:
    - "*.lan"
    - localhost.ptlogin2.qq.com
  default-nameserver:
    - 223.5.5.5
    - 119.29.29.29
  nameserver:
    - https://dns.alidns.com/dns-query
    - https://doh.pub/dns-query
  fallback:
    - https://1.1.1.1/dns-query
    - https://8.8.8.8/dns-query`;

const RULE_PROVIDER_BASE_URL = "https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo";

const MODULES = [
  {
    id: "select",
    name: "节点选择",
    category: "核心",
    groupType: "select",
    rules: []
  },
  {
    id: "auto",
    name: "自动选择",
    category: "核心",
    groupType: "url-test",
    rules: []
  },
  {
    id: "ad",
    name: "广告拦截",
    category: "核心",
    groupType: "reject-first",
    rules: [{ id: "category-ads-all", name: "广告域名", behavior: "domain", path: "geosite/category-ads-all.mrs" }]
  },
  {
    id: "private",
    name: "私有网络",
    category: "核心",
    groupType: "direct-first",
    rules: [
      { id: "private", name: "私有网络", behavior: "domain", path: "geosite/private.mrs" },
      { id: "private-ip", name: "私有 IP", behavior: "ipcidr", path: "geoip/private.mrs", noResolve: true }
    ]
  },
  {
    id: "cn",
    name: "国内服务",
    category: "核心",
    groupType: "direct-first",
    rules: [
      { id: "geolocation-cn", name: "国内域名", behavior: "domain", path: "geosite/geolocation-cn.mrs" },
      { id: "cn-ip", name: "国内 IP", behavior: "ipcidr", path: "geoip/cn.mrs", noResolve: true }
    ]
  },
  {
    id: "global",
    name: "非中国",
    category: "核心",
    groupType: "select",
    rules: [{ id: "geolocation-!cn", name: "非中国域名", behavior: "domain", path: "geosite/geolocation-!cn.mrs" }]
  },
  {
    id: "final",
    name: "漏网之鱼",
    category: "核心",
    groupType: "select",
    rules: []
  },
  {
    id: "ai",
    name: "AI 服务",
    category: "服务",
    groupType: "select",
    rules: [
      { id: "openai", name: "OpenAI", behavior: "domain", path: "geosite/openai.mrs" },
      { id: "anthropic", name: "Anthropic", behavior: "domain", path: "geosite/anthropic.mrs" },
      { id: "category-ai-chat-!cn", name: "AI 服务合集", behavior: "domain", path: "geosite/category-ai-chat-!cn.mrs" }
    ]
  },
  {
    id: "gemini",
    name: "Gemini",
    category: "服务",
    groupType: "select",
    rules: [{ id: "google-gemini", name: "Google Gemini", behavior: "domain", path: "geosite/google-gemini.mrs" }]
  },
  {
    id: "youtube",
    name: "油管视频",
    category: "服务",
    groupType: "select",
    rules: [{ id: "youtube", name: "YouTube", behavior: "domain", path: "geosite/youtube.mrs" }]
  },
  {
    id: "google",
    name: "谷歌服务",
    category: "服务",
    groupType: "select",
    rules: [
      { id: "google", name: "Google", behavior: "domain", path: "geosite/google.mrs" },
      { id: "google-ip", name: "Google IP", behavior: "ipcidr", path: "geoip/google.mrs", noResolve: true }
    ]
  },
  {
    id: "microsoft",
    name: "微软服务",
    category: "服务",
    groupType: "select",
    rules: [
      { id: "microsoft", name: "Microsoft", behavior: "domain", path: "geosite/microsoft.mrs" },
      { id: "onedrive", name: "OneDrive", behavior: "domain", path: "geosite/onedrive.mrs" }
    ]
  },
  {
    id: "apple",
    name: "苹果服务",
    category: "服务",
    groupType: "select",
    rules: [
      { id: "apple", name: "Apple", behavior: "domain", path: "geosite/apple.mrs" },
      { id: "icloud", name: "iCloud", behavior: "domain", path: "geosite/icloud.mrs" }
    ]
  },
  {
    id: "telegram",
    name: "电报消息",
    category: "社交",
    groupType: "select",
    rules: [
      { id: "telegram", name: "Telegram", behavior: "domain", path: "geosite/telegram.mrs" },
      { id: "telegram-ip", name: "Telegram IP", behavior: "ipcidr", path: "geoip/telegram.mrs", noResolve: true }
    ]
  },
  { id: "twitter", name: "Twitter/X", category: "社交", groupType: "select", rules: [
    { id: "twitter", name: "Twitter/X", behavior: "domain", path: "geosite/twitter.mrs" },
    { id: "twitter-ip", name: "Twitter IP", behavior: "ipcidr", path: "geoip/twitter.mrs", noResolve: true }
  ] },
  { id: "meta", name: "Meta 系", category: "社交", groupType: "select", rules: [
    { id: "facebook", name: "Facebook", behavior: "domain", path: "geosite/facebook.mrs" },
    { id: "instagram", name: "Instagram", behavior: "domain", path: "geosite/instagram.mrs" },
    { id: "whatsapp", name: "WhatsApp", behavior: "domain", path: "geosite/whatsapp.mrs" },
    { id: "facebook-ip", name: "Facebook IP", behavior: "ipcidr", path: "geoip/facebook.mrs", noResolve: true }
  ] },
  { id: "discord", name: "Discord", category: "社交", groupType: "select", rules: [
    { id: "discord", name: "Discord", behavior: "domain", path: "geosite/discord.mrs" }
  ] },
  { id: "social-other", name: "其他社交", category: "社交", groupType: "select", rules: [
    { id: "tiktok", name: "TikTok", behavior: "domain", path: "geosite/tiktok.mrs" },
    { id: "line", name: "Line", behavior: "domain", path: "geosite/line.mrs" },
    { id: "reddit", name: "Reddit", behavior: "domain", path: "geosite/reddit.mrs" },
    { id: "linkedin", name: "LinkedIn", behavior: "domain", path: "geosite/linkedin.mrs" },
    { id: "snap", name: "Snapchat", behavior: "domain", path: "geosite/snap.mrs" },
    { id: "pinterest", name: "Pinterest", behavior: "domain", path: "geosite/pinterest.mrs" },
    { id: "tumblr", name: "Tumblr", behavior: "domain", path: "geosite/tumblr.mrs" }
  ] },
  { id: "netflix", name: "奈飞", category: "媒体", groupType: "select", rules: [
    { id: "netflix", name: "Netflix", behavior: "domain", path: "geosite/netflix.mrs" },
    { id: "netflix-ip", name: "Netflix IP", behavior: "ipcidr", path: "geoip/netflix.mrs", noResolve: true }
  ] },
  { id: "disney", name: "迪士尼+", category: "媒体", groupType: "select", rules: [
    { id: "disney", name: "Disney+", behavior: "domain", path: "geosite/disney.mrs" }
  ] },
  { id: "streaming-west", name: "欧美流媒体", category: "媒体", groupType: "select", rules: [
    { id: "hbo", name: "HBO", behavior: "domain", path: "geosite/hbo.mrs" },
    { id: "hulu", name: "Hulu", behavior: "domain", path: "geosite/hulu.mrs" },
    { id: "primevideo", name: "Prime Video", behavior: "domain", path: "geosite/primevideo.mrs" },
    { id: "apple-tvplus", name: "Apple TV+", behavior: "domain", path: "geosite/apple-tvplus.mrs" },
    { id: "spotify", name: "Spotify", behavior: "domain", path: "geosite/spotify.mrs" },
    { id: "twitch", name: "Twitch", behavior: "domain", path: "geosite/twitch.mrs" },
    { id: "dazn", name: "DAZN", behavior: "domain", path: "geosite/dazn.mrs" }
  ] },
  { id: "streaming-asia", name: "亚洲流媒体", category: "媒体", groupType: "select", rules: [
    { id: "bahamut", name: "巴哈姆特", behavior: "domain", path: "geosite/bahamut.mrs" },
    { id: "biliintl", name: "哔哩哔哩国际版", behavior: "domain", path: "geosite/biliintl.mrs" },
    { id: "niconico", name: "Niconico", behavior: "domain", path: "geosite/niconico.mrs" },
    { id: "abema", name: "Abema", behavior: "domain", path: "geosite/abema.mrs" },
    { id: "viu", name: "Viu", behavior: "domain", path: "geosite/viu.mrs" },
    { id: "kktv", name: "KKTV", behavior: "domain", path: "geosite/kktv.mrs" }
  ] },
  { id: "steam", name: "Steam", category: "游戏", groupType: "select", rules: [
    { id: "steam", name: "Steam", behavior: "domain", path: "geosite/steam.mrs" }
  ] },
  { id: "gaming-pc", name: "PC 游戏", category: "游戏", groupType: "select", rules: [
    { id: "epicgames", name: "Epic Games", behavior: "domain", path: "geosite/epicgames.mrs" },
    { id: "ea", name: "EA", behavior: "domain", path: "geosite/ea.mrs" },
    { id: "ubisoft", name: "Ubisoft", behavior: "domain", path: "geosite/ubisoft.mrs" },
    { id: "blizzard", name: "Blizzard", behavior: "domain", path: "geosite/blizzard.mrs" },
    { id: "gog", name: "GOG", behavior: "domain", path: "geosite/gog.mrs" },
    { id: "riot", name: "Riot Games", behavior: "domain", path: "geosite/riot.mrs" }
  ] },
  { id: "gaming-console", name: "主机游戏", category: "游戏", groupType: "select", rules: [
    { id: "playstation", name: "PlayStation", behavior: "domain", path: "geosite/playstation.mrs" },
    { id: "xbox", name: "Xbox", behavior: "domain", path: "geosite/xbox.mrs" },
    { id: "nintendo", name: "Nintendo", behavior: "domain", path: "geosite/nintendo.mrs" }
  ] },
  { id: "github", name: "代码托管", category: "技术", groupType: "select", rules: [
    { id: "github", name: "GitHub", behavior: "domain", path: "geosite/github.mrs" },
    { id: "gitlab", name: "GitLab", behavior: "domain", path: "geosite/gitlab.mrs" },
    { id: "atlassian", name: "Atlassian / Bitbucket", behavior: "domain", path: "geosite/atlassian.mrs" }
  ] },
  { id: "cloud", name: "云服务", category: "技术", groupType: "select", rules: [
    { id: "aws", name: "AWS", behavior: "domain", path: "geosite/aws.mrs" },
    { id: "azure", name: "Azure", behavior: "domain", path: "geosite/azure.mrs" },
    { id: "cloudflare", name: "Cloudflare", behavior: "domain", path: "geosite/cloudflare.mrs" },
    { id: "digitalocean", name: "DigitalOcean", behavior: "domain", path: "geosite/digitalocean.mrs" },
    { id: "vercel", name: "Vercel", behavior: "domain", path: "geosite/vercel.mrs" },
    { id: "netlify", name: "Netlify", behavior: "domain", path: "geosite/netlify.mrs" },
    { id: "cloudflare-ip", name: "Cloudflare IP", behavior: "ipcidr", path: "geoip/cloudflare.mrs", noResolve: true }
  ] },
  { id: "dev-tools", name: "开发工具", category: "技术", groupType: "select", rules: [
    { id: "docker", name: "Docker", behavior: "domain", path: "geosite/docker.mrs" },
    { id: "npmjs", name: "npmjs", behavior: "domain", path: "geosite/npmjs.mrs" },
    { id: "jetbrains", name: "JetBrains", behavior: "domain", path: "geosite/jetbrains.mrs" },
    { id: "stackexchange", name: "Stack Exchange", behavior: "domain", path: "geosite/stackexchange.mrs" }
  ] },
  { id: "storage", name: "网盘存储", category: "技术", groupType: "select", rules: [
    { id: "dropbox", name: "Dropbox", behavior: "domain", path: "geosite/dropbox.mrs" },
    { id: "notion", name: "Notion", behavior: "domain", path: "geosite/notion.mrs" }
  ] },
  { id: "payment", name: "支付平台", category: "金融", groupType: "select", rules: [
    { id: "paypal", name: "PayPal", behavior: "domain", path: "geosite/paypal.mrs" },
    { id: "stripe", name: "Stripe", behavior: "domain", path: "geosite/stripe.mrs" },
    { id: "wise", name: "Wise", behavior: "domain", path: "geosite/wise.mrs" }
  ] },
  { id: "crypto", name: "加密货币", category: "金融", groupType: "select", rules: [
    { id: "binance", name: "Binance", behavior: "domain", path: "geosite/binance.mrs" }
  ] },
  { id: "google-scholar", name: "谷歌学术", category: "其他", groupType: "select", rules: [
    { id: "google-scholar", name: "Google Scholar", behavior: "domain", path: "geosite/google-scholar.mrs" }
  ] },
  { id: "education", name: "教育学术", category: "其他", groupType: "select", rules: [
    { id: "category-scholar-!cn", name: "学术资源", behavior: "domain", path: "geosite/category-scholar-!cn.mrs" },
    { id: "coursera", name: "Coursera", behavior: "domain", path: "geosite/coursera.mrs" },
    { id: "udemy", name: "Udemy", behavior: "domain", path: "geosite/udemy.mrs" },
    { id: "edx", name: "edX", behavior: "domain", path: "geosite/edx.mrs" },
    { id: "khanacademy", name: "Khan Academy", behavior: "domain", path: "geosite/khanacademy.mrs" },
    { id: "wikimedia", name: "Wikimedia / Wikipedia", behavior: "domain", path: "geosite/wikimedia.mrs" }
  ] },
  { id: "news", name: "新闻资讯", category: "其他", groupType: "select", rules: [
    { id: "bbc", name: "BBC", behavior: "domain", path: "geosite/bbc.mrs" },
    { id: "cnn", name: "CNN", behavior: "domain", path: "geosite/cnn.mrs" },
    { id: "nytimes", name: "NYT", behavior: "domain", path: "geosite/nytimes.mrs" },
    { id: "wsj", name: "WSJ", behavior: "domain", path: "geosite/wsj.mrs" },
    { id: "bloomberg", name: "Bloomberg", behavior: "domain", path: "geosite/bloomberg.mrs" }
  ] },
  { id: "shopping", name: "海淘购物", category: "其他", groupType: "select", rules: [
    { id: "amazon", name: "Amazon", behavior: "domain", path: "geosite/amazon.mrs" },
    { id: "ebay", name: "eBay", behavior: "domain", path: "geosite/ebay.mrs" }
  ] },
  { id: "adult", name: "成人内容", category: "其他", groupType: "select", rules: [
    { id: "category-porn", name: "成人网站", behavior: "domain", path: "geosite/category-porn.mrs" }
  ] }
];

const MODULE_BY_ID = new Map(MODULES.map((module) => [module.id, { ...module, group: module.name }]));
const PROXY_GROUP_ORDER = [
  "select", "auto", "ad", "ai", "gemini", "youtube", "google", "microsoft", "apple",
  "telegram", "twitter", "meta", "discord", "social-other", "netflix", "disney",
  "streaming-west", "streaming-asia", "steam", "gaming-pc", "gaming-console",
  "github", "cloud", "dev-tools", "storage", "payment", "crypto", "google-scholar",
  "education", "news", "shopping", "adult", "private", "cn", "global", "final"
];
const RULE_ORDER = [
  "ad", "private", "gemini", "ai", "cn", "youtube", "google-scholar", "education",
  "cloud", "google", "telegram", "github", "microsoft", "apple", "twitter", "meta",
  "discord", "social-other", "netflix", "disney", "streaming-west", "streaming-asia",
  "steam", "gaming-pc", "gaming-console", "dev-tools", "storage", "payment", "crypto",
  "news", "shopping", "adult", "global"
];
const TEMPLATE_MODULES = {
  minimal: ["select", "auto", "ad", "private", "cn", "global", "final"],
  standard: ["select", "auto", "ad", "private", "cn", "global", "ai", "youtube", "google", "microsoft", "apple", "github", "telegram", "final"],
  full: MODULES.filter((module) => !["adult", "gemini", "google-scholar"].includes(module.id)).map((module) => module.id)
};

const TEMPLATES = {
  minimal: {
    name: "基础",
    description: "基础代理组、广告、私有网络、国内与非中国分流",
    modules: TEMPLATE_MODULES.minimal
  },
  standard: {
    name: "日常",
    description: "基础分流加 AI、视频、常用平台",
    modules: TEMPLATE_MODULES.standard
  },
  full: {
    name: "完整",
    description: "开启扩展服务分流",
    modules: TEMPLATE_MODULES.full
  }
};

const POLICY_LABELS = {
  proxy: "代理",
  direct: "直连",
  reject: "拦截"
};

const I18N = {
  zh: {
    "app.subtitle": "Clash / Mihomo 配置生成器",
    "app.nodes": "{count} 个节点",
    "app.nodeBadge": "{count} 节点",
    "app.providerBadge": "{count} provider",
    "theme.label": "外观",
    "theme.system": "跟随系统",
    "theme.light": "浅色",
    "theme.dark": "深色",
    "language.label": "语言",
    "language.zh": "中文",
    "language.en": "English",
    "template.label": "分流模板",
    "template.minimal.name": "基础",
    "template.minimal.description": "基础代理组、广告、私有网络、国内与非中国分流",
    "template.standard.name": "日常",
    "template.standard.description": "基础分流加 AI、视频、常用平台",
    "template.full.name": "完整",
    "template.full.description": "开启扩展服务分流",
    "ready": "可以生成配置",
    "waitingImport": "等待导入节点",
    "generate": "生成配置",
    "routing.title": "分流去向",
    "policy.proxy": "代理",
    "policy.direct": "直连",
    "policy.reject": "拦截",
    "source.title": "输入",
    "source.parseAfterPaste": "粘贴后解析",
    "source.placeholder": "粘贴订阅链接或节点链接，一行一个；也可粘贴完整 Clash / Mihomo YAML",
    "source.parse": "解析",
    "source.parseTitle": "解析此来源",
    "source.providerTitle": "保存 provider 源",
    "source.removeTitle": "删除导入源",
    "source.advanced": "高级导入选项",
    "source.name": "名称",
    "source.namePlaceholder": "导入源名称",
    "source.tag": "标签",
    "source.tagPlaceholder": "例：机场 A",
    "source.nameTemplate": "命名模板",
    "source.providerMode": "使用 proxy-providers",
    "source.nameHint": "命名占位符：{name}、{tag}、{type}、{index}",
    "source.restrictedHeaders": "受限订阅兼容",
    "source.requestHeaders": "临时请求头",
    "source.requestHeadersPlaceholder": "一行一个请求头，例如：\nAccept: */*\nAuthorization: Bearer ...\nCookie: ...",
    "source.requestHeadersHint": "这些请求头只在本次页面会话中使用，不会写入本地存储。Host、Content-Length 等连接控制头会被忽略。",
    "status.notImported": "未导入",
    "status.parsing": "解析中...",
    "status.providerSaved": "provider 模式已保存",
    "status.providerMode": "provider 模式",
    "status.importFailed": "导入失败",
    "status.importedNodes": "已导入 {count} 节点",
    "status.importedWarnings": "已导入 {count} 节点，{warnings} 个提醒",
    "advanced.nodes.title": "节点管理",
    "advanced.nodes.subtitle": "改名、停用、监听端口和批量处理",
    "advanced.nodes.hint": "需要精修节点名或端口时再打开这里。",
    "advanced.nodes.clear": "清空节点",
    "advanced.nodes.empty": "先导入订阅、YAML 或节点链接。",
    "advanced.nodes.deleted": "已删除节点",
    "advanced.nodes.restoreAll": "全部恢复",
    "advanced.nodes.restore": "恢复",
    "advanced.nodes.moreDeleted": "还有 {count} 个已删除节点。",
    "bulk.title": "批量重命名与端口",
    "bulk.include": "筛选包含正则",
    "bulk.exclude": "筛选排除正则",
    "bulk.find": "查找正则",
    "bulk.replace": "替换为",
    "bulk.trim": "去除首尾空格",
    "bulk.normalizeSpaces": "空白归一化",
    "bulk.rename": "批量重命名",
    "bulk.portStart": "起始端口",
    "bulk.fillPorts": "填充端口",
    "bulk.clearPorts": "删除端口",
    "table.enabled": "启用",
    "table.name": "名称",
    "table.type": "类型",
    "table.source": "来源",
    "table.address": "地址",
    "table.listenerPort": "监听端口",
    "table.order": "顺序",
    "table.action": "操作",
    "common.empty": "可空",
    "common.manual": "手动",
    "common.deleteNode": "删除节点",
    "common.enabled": "启用",
    "common.all": "全部",
    "common.none": "无",
    "groups.title": "代理组",
    "groups.subtitle": "筛选组、自动测速组与链式 relay",
    "groups.customBadge": "{count} 自定义",
    "groups.filterTitle": "筛选代理组",
    "groups.filterHint": "按来源、地区关键词或正则创建独立分组。",
    "groups.type": "类型",
    "groups.source": "来源",
    "groups.allSources": "全部来源",
    "groups.currentMatches": "当前命中 {count} 个节点",
    "groups.addFilter": "添加筛选组",
    "groups.noFilter": "暂无筛选组。",
    "groups.chainTitle": "链式代理组",
    "groups.chainHint": "生成 Mihomo relay 组：入口节点到落地节点。",
    "groups.entry": "入口节点",
    "groups.exit": "落地节点",
    "groups.selectNode": "选择节点",
    "groups.relayHint": "relay 组通常需要客户端内核支持。",
    "groups.addChain": "添加链式组",
    "groups.noChain": "暂无链式代理组。",
    "groups.include": "包含",
    "groups.exclude": "排除",
    "groups.entryShort": "入口",
    "groups.exitShort": "落地",
    "groups.unselected": "未选择",
    "rules.title": "分流规则",
    "rules.subtitle": "内置模块默认够用，自定义规则按需添加",
    "rules.bulkTitle": "批量导入规则",
    "rules.bulkHint": "缺少目标时使用右侧选择的目标。",
    "rules.target": "目标分组",
    "rules.example": "快速示例",
    "rules.customCount": "当前已有 {count} 条自定义规则。",
    "rules.import": "导入规则",
    "rules.ruleCount": "{count} 条",
    "preview.title": "配置预览",
    "preview.generatedAt": "生成于 {time}",
    "preview.waiting": "等待生成",
    "preview.copy": "复制",
    "preview.download": "下载",
    "preview.placeholder": "# 请先添加订阅或节点并点击生成配置\n",
    "system.title": "系统设置",
    "system.subtitle": "端口、测速、局域网、IPv6 和 DNS YAML",
    "system.profileName": "配置名称",
    "system.profilePlaceholder": "我的配置",
    "system.mode": "运行模式",
    "system.testUrl": "测速 URL",
    "system.testInterval": "测速间隔秒",
    "system.allowLan": "允许局域网连接",
    "system.ipv6": "启用 IPv6",
    "system.resetDns": "恢复默认",
    "system.dnsPolicyTitle": "私有 DNS 映射",
    "system.dnsPolicyHint": "给受限节点域名指定机场要求的 DNS 服务器，生成到 dns.nameserver-policy。",
    "system.dnsPolicyDomain": "节点域名",
    "system.dnsPolicyDomainPlaceholder": "例：+.node.example.com",
    "system.dnsPolicyServer": "DNS 服务器",
    "system.dnsPolicyServerPlaceholder": "例：https://dns.example.com/dns-query",
    "system.addDnsPolicy": "添加映射",
    "system.noDnsPolicy": "暂无私有 DNS 映射。",
    "system.removeDnsPolicy": "删除 DNS 映射",
    "validation.errorTitle": "生成前需要修正",
    "validation.warnTitle": "可用性提醒",
    "module.category.core": "核心",
    "module.category.service": "服务",
    "module.category.social": "社交",
    "module.category.media": "媒体",
    "module.category.game": "游戏",
    "module.category.tech": "技术",
    "module.category.finance": "金融",
    "module.category.other": "其他",
    "module.select": "节点选择",
    "module.auto": "自动选择",
    "module.ad": "广告拦截",
    "module.private": "私有网络",
    "module.cn": "国内服务",
    "module.global": "非中国",
    "module.final": "漏网之鱼",
    "module.ai": "AI 服务",
    "module.gemini": "Gemini",
    "module.youtube": "油管视频",
    "module.google": "谷歌服务",
    "module.microsoft": "微软服务",
    "module.apple": "苹果服务",
    "module.telegram": "电报消息",
    "module.twitter": "Twitter/X",
    "module.meta": "Meta 系",
    "module.discord": "Discord",
    "module.social-other": "其他社交",
    "module.netflix": "奈飞",
    "module.disney": "迪士尼+",
    "module.streaming-west": "欧美流媒体",
    "module.streaming-asia": "亚洲流媒体",
    "module.steam": "Steam",
    "module.gaming-pc": "PC 游戏",
    "module.gaming-console": "主机游戏",
    "module.github": "代码托管",
    "module.cloud": "云服务",
    "module.dev-tools": "开发工具",
    "module.storage": "网盘存储",
    "module.payment": "支付平台",
    "module.crypto": "加密货币",
    "module.google-scholar": "谷歌学术",
    "module.education": "教育学术",
    "module.news": "新闻资讯",
    "module.shopping": "海淘购物",
    "module.adult": "成人内容",
    "toast.sourceRemoved": "导入源已删除，相关节点已移到删除列表",
    "toast.providerSaved": "已保存为 proxy-provider 源",
    "toast.importedNodes": "已导入 {count} 个节点",
    "toast.templateApplied": "已应用 {name}",
    "toast.nodesCleared": "节点已清空，可在删除列表恢复",
    "toast.invalidRegex": "查找正则无效",
    "toast.renamedNodes": "已重命名 {count} 个节点",
    "toast.invalidPortStart": "起始端口无效或超出范围",
    "toast.filledPorts": "已填充 {count} 个监听端口",
    "toast.clearedPorts": "已删除 {count} 个监听端口",
    "toast.noFilterMatches": "当前筛选条件没有命中节点",
    "toast.needDifferentChainNodes": "请选择不同的入口和落地节点",
    "toast.importedRules": "已导入 {count} 条规则",
    "toast.dnsPolicyAdded": "已添加 DNS 映射",
    "toast.invalidDnsPolicy": "请填写节点域名和 DNS 服务器",
    "toast.fixErrors": "配置未生成，请先修正校验错误",
    "toast.generatedBlocked": "生成结果存在语法风险，已阻止更新",
    "toast.generatedWarn": "配置已生成，但有提醒需要留意",
    "toast.generated": "配置已生成",
    "toast.copied": "YAML 已复制",
    "error.pasteFirst": "请先粘贴订阅链接或节点链接",
    "error.providerSingleUrl": "proxy-providers 只适合单个订阅链接；混合输入请关闭该选项",
    "error.noParsedNodes": "未解析到有效节点",
    "error.noNodesInSubscription": "订阅未解析到节点：{url}",
    "error.unparsedChunk": "粘贴内容里有片段未解析到节点",
    "error.fetchFailed": "获取失败",
    "error.remoteHttp": "远程返回 HTTP {status}",
    "error.backendFailed": "后端解析失败",
    "validation.needNode": "至少需要一个启用节点，或一个 proxy-providers 订阅源。",
    "validation.mode": "运行模式只能是 rule、global 或 direct。",
    "validation.testUrl": "测速 URL 必须是 http 或 https 地址。",
    "validation.testInterval": "测速间隔至少需要 30 秒。",
    "validation.providerUrl": "Provider 源「{name}」必须使用 http/https 订阅链接。",
    "validation.duplicateNames": "存在重复节点名，生成时会自动追加序号避免 YAML 代理名冲突。",
    "validation.portRequired": "{label} 必须填写。",
    "validation.portInteger": "{label} 必须是 1-65535 的整数。",
    "validation.portDuplicate": "{label} 与 {owner} 使用了同一个端口 {port}。",
    "validation.invalidRegex": "{label} 不是有效正则。",
    "validation.nodeUnnamed": "存在未命名节点。",
    "validation.nodeMissingType": "节点「{label}」缺少 type。",
    "validation.yamlNodeMissing": "YAML 节点「{label}」缺少 name 或 type。",
    "validation.nodeMissingServer": "节点「{label}」缺少 server。",
    "validation.nodeInvalidPort": "节点「{label}」端口无效。",
    "validation.nodeMissingField": "节点「{label}」缺少 {field}。",
    "validation.nodeUnsupported": "节点「{label}」类型 {type} 可能需要手动确认客户端是否支持。",
    "validation.dnsEmpty": "DNS YAML 不能为空。",
    "validation.dnsRoot": "DNS YAML 必须包含顶层 dns:。",
    "validation.dnsTab": "DNS YAML 不能包含 Tab，请使用空格缩进。",
    "validation.dnsUndefined": "DNS YAML 中包含 undefined 或 NaN。",
    "validation.dnsQuote": "DNS YAML 中存在未闭合的引号。",
    "validation.dnsTopKeys": "DNS 编辑区只能放 dns 配置，不应包含顶层字段：{keys}。",
    "validation.dnsIndent": "DNS YAML 第 {line} 行缩进不是 2 的倍数。",
    "validation.generatedUndefined": "生成结果中包含 undefined 或 NaN。",
    "validation.generatedMissing": "生成结果缺少 {section}",
    "validation.generatedZeroPort": "生成结果中存在 0 端口。",
    "validation.generatedDuplicateTop": "生成结果存在重复顶层字段：{keys}。",
    "validation.noMatch": "生成结果没有 MATCH 兜底规则。"
  },
  en: {
    "app.subtitle": "Clash / Mihomo config generator",
    "app.nodes": "{count} nodes",
    "app.nodeBadge": "{count} nodes",
    "app.providerBadge": "{count} providers",
    "theme.label": "Theme",
    "theme.system": "System",
    "theme.light": "Light",
    "theme.dark": "Dark",
    "language.label": "Language",
    "language.zh": "Chinese",
    "language.en": "English",
    "template.label": "Routing Template",
    "template.minimal.name": "Basic",
    "template.minimal.description": "Core groups, ads, private network, China, and non-China routing",
    "template.standard.name": "Daily",
    "template.standard.description": "Basic routing plus AI, video, and common platforms",
    "template.full.name": "Full",
    "template.full.description": "Enable extended service routing",
    "ready": "Ready to generate",
    "waitingImport": "Waiting for nodes",
    "generate": "Generate",
    "routing.title": "Routing",
    "policy.proxy": "Proxy",
    "policy.direct": "Direct",
    "policy.reject": "Reject",
    "source.title": "Input",
    "source.parseAfterPaste": "Paste, then parse",
    "source.placeholder": "Paste subscription URLs or node links, one per line. Full Clash / Mihomo YAML also works.",
    "source.parse": "Parse",
    "source.parseTitle": "Parse this source",
    "source.providerTitle": "Save as provider source",
    "source.removeTitle": "Remove source",
    "source.advanced": "Advanced import options",
    "source.name": "Name",
    "source.namePlaceholder": "Source name",
    "source.tag": "Tag",
    "source.tagPlaceholder": "Example: Provider A",
    "source.nameTemplate": "Name template",
    "source.providerMode": "Use proxy-providers",
    "source.nameHint": "Placeholders: {name}, {tag}, {type}, {index}",
    "source.restrictedHeaders": "Restricted Subscription",
    "source.requestHeaders": "Temporary request headers",
    "source.requestHeadersPlaceholder": "One header per line, for example:\nAccept: */*\nAuthorization: Bearer ...\nCookie: ...",
    "source.requestHeadersHint": "These headers are only used in the current page session and are not saved locally. Host, Content-Length, and other connection headers are ignored.",
    "status.notImported": "Not imported",
    "status.parsing": "Parsing...",
    "status.providerSaved": "Provider mode saved",
    "status.providerMode": "Provider mode",
    "status.importFailed": "Import failed",
    "status.importedNodes": "Imported {count} nodes",
    "status.importedWarnings": "Imported {count} nodes, {warnings} warnings",
    "advanced.nodes.title": "Nodes",
    "advanced.nodes.subtitle": "Rename, disable, listener ports, and bulk tools",
    "advanced.nodes.hint": "Open this only when you need to tune names or ports.",
    "advanced.nodes.clear": "Clear nodes",
    "advanced.nodes.empty": "Import a subscription, YAML, or node links first.",
    "advanced.nodes.deleted": "Deleted nodes",
    "advanced.nodes.restoreAll": "Restore all",
    "advanced.nodes.restore": "Restore",
    "advanced.nodes.moreDeleted": "{count} more deleted nodes.",
    "bulk.title": "Bulk rename and ports",
    "bulk.include": "Include regex",
    "bulk.exclude": "Exclude regex",
    "bulk.find": "Find regex",
    "bulk.replace": "Replace with",
    "bulk.trim": "Trim ends",
    "bulk.normalizeSpaces": "Normalize spaces",
    "bulk.rename": "Bulk rename",
    "bulk.portStart": "Start port",
    "bulk.fillPorts": "Fill ports",
    "bulk.clearPorts": "Clear ports",
    "table.enabled": "Enabled",
    "table.name": "Name",
    "table.type": "Type",
    "table.source": "Source",
    "table.address": "Address",
    "table.listenerPort": "Listener port",
    "table.order": "Order",
    "table.action": "Action",
    "common.empty": "Optional",
    "common.manual": "Manual",
    "common.deleteNode": "Delete node",
    "common.enabled": "Enabled",
    "common.all": "All",
    "common.none": "None",
    "groups.title": "Proxy Groups",
    "groups.subtitle": "Filter groups, url-test groups, and relay chains",
    "groups.customBadge": "{count} custom",
    "groups.filterTitle": "Filter Groups",
    "groups.filterHint": "Create groups by source, region keywords, or regex.",
    "groups.type": "Type",
    "groups.source": "Source",
    "groups.allSources": "All sources",
    "groups.currentMatches": "{count} nodes matched",
    "groups.addFilter": "Add filter group",
    "groups.noFilter": "No filter groups yet.",
    "groups.chainTitle": "Relay Chains",
    "groups.chainHint": "Generate Mihomo relay groups from entry node to exit node.",
    "groups.entry": "Entry node",
    "groups.exit": "Exit node",
    "groups.selectNode": "Select node",
    "groups.relayHint": "Relay groups require client core support.",
    "groups.addChain": "Add relay group",
    "groups.noChain": "No relay groups yet.",
    "groups.include": "Include",
    "groups.exclude": "Exclude",
    "groups.entryShort": "Entry",
    "groups.exitShort": "Exit",
    "groups.unselected": "Not selected",
    "rules.title": "Rules",
    "rules.subtitle": "Built-in modules are enough by default. Add custom rules only when needed.",
    "rules.bulkTitle": "Bulk Import Rules",
    "rules.bulkHint": "When a target is missing, the selected target is used.",
    "rules.target": "Target group",
    "rules.example": "Quick example",
    "rules.customCount": "{count} custom rules.",
    "rules.import": "Import rules",
    "rules.ruleCount": "{count} rules",
    "preview.title": "Preview",
    "preview.generatedAt": "Generated at {time}",
    "preview.waiting": "Waiting",
    "preview.copy": "Copy",
    "preview.download": "Download",
    "preview.placeholder": "# Add a subscription or node, then generate the config\n",
    "system.title": "System",
    "system.subtitle": "Ports, health check, LAN, IPv6, and DNS YAML",
    "system.profileName": "Profile name",
    "system.profilePlaceholder": "My config",
    "system.mode": "Mode",
    "system.testUrl": "Health check URL",
    "system.testInterval": "Health check interval",
    "system.allowLan": "Allow LAN",
    "system.ipv6": "Enable IPv6",
    "system.resetDns": "Reset defaults",
    "system.dnsPolicyTitle": "Private DNS Mapping",
    "system.dnsPolicyHint": "Route restricted node domains to the DNS server required by the provider. Generated into dns.nameserver-policy.",
    "system.dnsPolicyDomain": "Node domain",
    "system.dnsPolicyDomainPlaceholder": "Example: +.node.example.com",
    "system.dnsPolicyServer": "DNS server",
    "system.dnsPolicyServerPlaceholder": "Example: https://dns.example.com/dns-query",
    "system.addDnsPolicy": "Add mapping",
    "system.noDnsPolicy": "No private DNS mappings yet.",
    "system.removeDnsPolicy": "Remove DNS mapping",
    "validation.errorTitle": "Fix before generating",
    "validation.warnTitle": "Usability note",
    "module.category.core": "Core",
    "module.category.service": "Services",
    "module.category.social": "Social",
    "module.category.media": "Media",
    "module.category.game": "Games",
    "module.category.tech": "Tech",
    "module.category.finance": "Finance",
    "module.category.other": "Other",
    "module.select": "Node Select",
    "module.auto": "Auto Select",
    "module.ad": "Ad Blocking",
    "module.private": "Private Network",
    "module.cn": "China Services",
    "module.global": "Non-China",
    "module.final": "Final",
    "module.ai": "AI Services",
    "module.gemini": "Gemini",
    "module.youtube": "YouTube",
    "module.google": "Google Services",
    "module.microsoft": "Microsoft",
    "module.apple": "Apple",
    "module.telegram": "Telegram",
    "module.twitter": "Twitter/X",
    "module.meta": "Meta",
    "module.discord": "Discord",
    "module.social-other": "Other Social",
    "module.netflix": "Netflix",
    "module.disney": "Disney+",
    "module.streaming-west": "Western Streaming",
    "module.streaming-asia": "Asian Streaming",
    "module.steam": "Steam",
    "module.gaming-pc": "PC Games",
    "module.gaming-console": "Console Games",
    "module.github": "Code Hosting",
    "module.cloud": "Cloud Services",
    "module.dev-tools": "Developer Tools",
    "module.storage": "Cloud Storage",
    "module.payment": "Payments",
    "module.crypto": "Crypto",
    "module.google-scholar": "Google Scholar",
    "module.education": "Education",
    "module.news": "News",
    "module.shopping": "Shopping",
    "module.adult": "Adult Content",
    "toast.sourceRemoved": "Source removed. Its nodes moved to deleted nodes.",
    "toast.providerSaved": "Saved as a proxy-provider source",
    "toast.importedNodes": "Imported {count} nodes",
    "toast.templateApplied": "{name} template applied",
    "toast.nodesCleared": "Nodes cleared. You can restore them from deleted nodes.",
    "toast.invalidRegex": "Invalid find regex",
    "toast.renamedNodes": "Renamed {count} nodes",
    "toast.invalidPortStart": "Start port is invalid or out of range",
    "toast.filledPorts": "Filled {count} listener ports",
    "toast.clearedPorts": "Cleared {count} listener ports",
    "toast.noFilterMatches": "No nodes match the current filter",
    "toast.needDifferentChainNodes": "Choose different entry and exit nodes",
    "toast.importedRules": "Imported {count} rules",
    "toast.dnsPolicyAdded": "DNS mapping added",
    "toast.invalidDnsPolicy": "Fill both node domain and DNS server",
    "toast.fixErrors": "Config not generated. Fix validation errors first.",
    "toast.generatedBlocked": "Generated output has syntax risks, so the preview was not updated.",
    "toast.generatedWarn": "Config generated with notes to review",
    "toast.generated": "Config generated",
    "toast.copied": "YAML copied",
    "error.pasteFirst": "Paste a subscription URL or node link first",
    "error.providerSingleUrl": "proxy-providers only supports a single subscription URL. Disable it for mixed input.",
    "error.noParsedNodes": "No valid nodes parsed",
    "error.noNodesInSubscription": "No nodes parsed from subscription: {url}",
    "error.unparsedChunk": "Some pasted content could not be parsed into nodes",
    "error.fetchFailed": "Fetch failed",
    "error.remoteHttp": "Remote returned HTTP {status}",
    "error.backendFailed": "Backend parsing failed",
    "validation.needNode": "At least one enabled node or one proxy-providers subscription source is required.",
    "validation.mode": "Mode must be rule, global, or direct.",
    "validation.testUrl": "Health check URL must be an http or https URL.",
    "validation.testInterval": "Health check interval must be at least 30 seconds.",
    "validation.providerUrl": "Provider source \"{name}\" must use an http/https subscription URL.",
    "validation.duplicateNames": "Duplicate node names exist. Unique suffixes will be added when generating YAML.",
    "validation.portRequired": "{label} is required.",
    "validation.portInteger": "{label} must be an integer from 1 to 65535.",
    "validation.portDuplicate": "{label} uses the same port {port} as {owner}.",
    "validation.invalidRegex": "{label} is not a valid regex.",
    "validation.nodeUnnamed": "A node is missing its name.",
    "validation.nodeMissingType": "Node \"{label}\" is missing type.",
    "validation.yamlNodeMissing": "YAML node \"{label}\" is missing name or type.",
    "validation.nodeMissingServer": "Node \"{label}\" is missing server.",
    "validation.nodeInvalidPort": "Node \"{label}\" has an invalid port.",
    "validation.nodeMissingField": "Node \"{label}\" is missing {field}.",
    "validation.nodeUnsupported": "Node \"{label}\" uses type {type}; confirm your client supports it.",
    "validation.dnsEmpty": "DNS YAML cannot be empty.",
    "validation.dnsRoot": "DNS YAML must contain top-level dns:.",
    "validation.dnsTab": "DNS YAML cannot contain tabs. Use spaces for indentation.",
    "validation.dnsUndefined": "DNS YAML contains undefined or NaN.",
    "validation.dnsQuote": "DNS YAML contains an unclosed quote.",
    "validation.dnsTopKeys": "The DNS editor should only contain dns config. Unexpected top-level fields: {keys}.",
    "validation.dnsIndent": "DNS YAML line {line} has indentation that is not a multiple of 2.",
    "validation.generatedUndefined": "Generated output contains undefined or NaN.",
    "validation.generatedMissing": "Generated output is missing {section}",
    "validation.generatedZeroPort": "Generated output contains port 0.",
    "validation.generatedDuplicateTop": "Generated output contains duplicate top-level fields: {keys}.",
    "validation.noMatch": "Generated output has no MATCH fallback rule."
  }
};

const ICONS = {
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
  import: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="m19 6-1 14H6L5 6"/></svg>',
  spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 21l-1.9-7.8L4 11l6.1-2.2Z"/></svg>',
  save: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 0 1-15.5 6.2"/><path d="M3 12A9 9 0 0 1 18.5 5.8"/><path d="M18 2v4h4"/><path d="M6 22v-4H2"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>',
  system: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8"/><path d="M12 16v4"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 7 7 0 1 0 20.5 14.5Z"/></svg>'
};

let state = loadState();
applyPreferences();

function createDefaultState() {
  return {
    version: STATE_VERSION,
    profileName: "我的配置",
    template: "standard",
    sources: [createSource("url")],
    nodes: [],
    deletedNodes: [],
    modules: modulesForTemplate("standard"),
    groupPolicies: {},
    customRules: [],
    filterGroups: [],
    chainGroups: [],
    dnsPolicies: [],
    base: {
      mixedPort: 7890,
      socksPort: "",
      redirPort: "",
      mode: "rule",
      allowLan: true,
      ipv6: true,
      testUrl: "https://www.gstatic.com/generate_204",
      testInterval: 300,
      providerInterval: 86400
    },
    dnsYaml: DEFAULT_DNS,
    ruleInput: "",
    ruleTarget: "节点选择",
    preview: "",
    previewTab: "yaml",
    lastGeneratedAt: "",
    activeProfileId: "",
    validation: {
      errors: [],
      warnings: []
    },
    ui: {
      theme: "system",
      lang: "zh",
      advancedOpen: {
        nodes: false,
        groups: false,
        rules: false,
        system: false
      }
    },
    bulk: {
      include: "",
      exclude: "",
      find: "",
      replace: "",
      trim: true,
      normalizeSpaces: true,
      portStart: 42000
    },
    newFilter: {
      name: "",
      source: "all",
      include: "",
      exclude: "",
      type: "select"
    },
    newChain: {
      name: "",
      entry: "",
      exit: ""
    },
    newDnsPolicy: {
      domain: "",
      server: ""
    }
  };
}

function modulesForTemplate(templateId) {
  const moduleIds = new Set(TEMPLATES[templateId]?.modules || TEMPLATES.standard.modules);
  return Object.fromEntries(MODULES.map((item) => [item.id, moduleIds.has(item.id)]));
}

function createSource(type) {
  const id = uid("src");
  return {
    id,
    type,
    name: "输入",
    tag: "",
    nameTemplate: "{tag}{name}",
    content: "",
    userAgent: "clash.meta/v1.19.16",
    providerMode: false,
    requestHeaders: "",
    status: "未导入",
    userinfo: "",
    error: "",
    nodeIds: []
  };
}

function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) || LEGACY_STORAGE_KEYS.map((key) => localStorage.getItem(key)).find(Boolean);
    if (!stored) return createDefaultState();
    const next = mergeState(createDefaultState(), JSON.parse(stored));
    const safe = storageSafeState(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
    return mergeState(createDefaultState(), safe);
  } catch {
    return createDefaultState();
  }
}

function mergeState(base, saved) {
  const merged = { ...base, ...saved };
  const isOldState = saved.version !== STATE_VERSION;
  merged.version = STATE_VERSION;
  merged.base = { ...base.base, ...(saved.base || {}) };
  merged.bulk = { ...base.bulk, ...(saved.bulk || {}) };
  merged.newFilter = { ...base.newFilter, ...(saved.newFilter || {}) };
  merged.newChain = { ...base.newChain, ...(saved.newChain || {}) };
  merged.newDnsPolicy = { ...base.newDnsPolicy, ...(saved.newDnsPolicy || {}) };
  const savedModules = saved.modules || {};
  const hasCurrentModuleShape = ["select", "auto", "ad", "global", "final"].every((key) => Object.prototype.hasOwnProperty.call(savedModules, key));
  merged.modules = !isOldState && hasCurrentModuleShape ? { ...base.modules, ...savedModules } : modulesForTemplate(saved.template || base.template);
  merged.groupPolicies = { ...base.groupPolicies, ...(saved.groupPolicies || {}) };
  merged.validation = { ...base.validation, ...(saved.validation || {}) };
  merged.ui = {
    ...base.ui,
    ...(saved.ui || {}),
    advancedOpen: { ...base.ui.advancedOpen, ...((saved.ui || {}).advancedOpen || {}) }
  };
  if (!["system", "light", "dark"].includes(merged.ui.theme)) merged.ui.theme = base.ui.theme;
  if (!["zh", "en"].includes(merged.ui.lang)) merged.ui.lang = base.ui.lang;
  merged.sources = (Array.isArray(saved.sources) && saved.sources.length ? saved.sources : base.sources).map(normalizeSource);
  merged.nodes = Array.isArray(saved.nodes) ? saved.nodes : [];
  merged.deletedNodes = Array.isArray(saved.deletedNodes) ? saved.deletedNodes : [];
  merged.customRules = Array.isArray(saved.customRules) ? saved.customRules : [];
  merged.filterGroups = Array.isArray(saved.filterGroups) ? saved.filterGroups : [];
  merged.chainGroups = Array.isArray(saved.chainGroups) ? saved.chainGroups : [];
  merged.dnsPolicies = Array.isArray(saved.dnsPolicies) ? saved.dnsPolicies : [];
  if (typeof merged.preview === "string") {
    merged.preview = merged.preview.replace("# Generated by SubBoost Local", "# Generated by subpanel");
  }
  return merged;
}

function saveState() {
  writeStoredState(state);
}

function writeStoredState(nextState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(storageSafeState(nextState)));
}

function storageSafeState(nextState) {
  return {
    ...nextState,
    sources: sanitizeSources(nextState.sources),
    nodes: [],
    deletedNodes: [],
    dnsPolicies: [],
    newDnsPolicy: {
      domain: "",
      server: ""
    },
    preview: "",
    lastGeneratedAt: "",
    activeProfileId: "",
    ruleInput: "",
    validation: {
      errors: [],
      warnings: []
    }
  };
}

function sanitizeSources(sources) {
  const list = Array.isArray(sources) && sources.length ? sources : [createSource("url")];
  return list.map((source) => ({
    id: source.id || uid("src"),
    type: source.type || "url",
    name: source.name || "输入",
    tag: source.tag || "",
    nameTemplate: source.nameTemplate || "{tag}{name}",
    content: "",
    userAgent: "clash.meta/v1.19.16",
    providerMode: !!source.providerMode,
    requestHeaders: "",
    status: "",
    userinfo: "",
    error: "",
    nodeIds: []
  }));
}

function normalizeSource(source) {
  return {
    ...createSource(source?.type || "url"),
    ...source,
    content: source?.content || "",
    userAgent: source?.userAgent || "clash.meta/v1.19.16",
    requestHeaders: source?.requestHeaders || "",
    nodeIds: Array.isArray(source?.nodeIds) ? source.nodeIds : []
  };
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function attr(value) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

function icon(name) {
  return ICONS[name] || "";
}

function getLang() {
  return state?.ui?.lang === "en" ? "en" : "zh";
}

function t(key, values = {}) {
  const catalog = I18N[getLang()] || I18N.zh;
  const template = catalog[key] || I18N.zh[key] || key;
  return template.replace(/\{([A-Za-z0-9_-]+)\}/g, (match, name) => (
    Object.prototype.hasOwnProperty.call(values, name) ? values[name] : match
  ));
}

function applyPreferences() {
  const preference = state?.ui?.theme || "system";
  const resolvedTheme = preference === "system"
    ? (window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light")
    : preference;
  document.documentElement.dataset.theme = resolvedTheme;
  document.documentElement.dataset.themePreference = preference;
  document.documentElement.lang = getLang() === "en" ? "en" : "zh-CN";
}

function setThemePreference(theme) {
  if (!["system", "light", "dark"].includes(theme)) return;
  state.ui.theme = theme;
  saveState();
  applyPreferences();
  render();
}

function setLanguage(lang) {
  if (!["zh", "en"].includes(lang)) return;
  state.ui.lang = lang;
  saveState();
  applyPreferences();
  render();
}

function templateName(id) {
  return t(`template.${id}.name`);
}

function templateDescription(id) {
  return t(`template.${id}.description`);
}

function policyLabel(value) {
  return t(`policy.${value}`);
}

function moduleDisplayName(moduleOrName) {
  const module = typeof moduleOrName === "string" ? moduleByName(moduleOrName) : moduleOrName;
  if (!module) return String(moduleOrName || "");
  return t(`module.${module.id}`);
}

function categoryDisplayName(category) {
  const keys = {
    "核心": "core",
    "服务": "service",
    "社交": "social",
    "媒体": "media",
    "游戏": "game",
    "技术": "tech",
    "金融": "finance",
    "其他": "other"
  };
  return t(`module.category.${keys[category] || "other"}`);
}

function formatSourceStatus(source, count) {
  if (source.error) return source.error;
  const status = source.status || "";
  const imported = status.match(/^已导入\s+(\d+)\s+节点(?:，(\d+)\s+个提醒)?$/) || status.match(/^Imported\s+(\d+)\s+nodes(?:,\s+(\d+)\s+warnings)?$/i);
  if (imported) {
    return importedStatusText(Number(imported[1]), Number(imported[2] || 0));
  }
  const map = {
    "未导入": "status.notImported",
    "Not imported": "status.notImported",
    "解析中...": "status.parsing",
    "Parsing...": "status.parsing",
    "provider 模式已保存": "status.providerSaved",
    "Provider mode saved": "status.providerSaved",
    "provider 模式": "status.providerMode",
    "Provider mode": "status.providerMode",
    "导入失败": "status.importFailed",
    "Import failed": "status.importFailed"
  };
  if (map[status]) return t(map[status]);
  if (count) return t("status.importedNodes", { count });
  return status || t("status.notImported");
}

function localeCode() {
  return getLang() === "en" ? "en-US" : "zh-CN";
}

function localText(zh, en) {
  return getLang() === "en" ? en : zh;
}

function nodeCount(count) {
  return getLang() === "en" ? `${count} node${count === 1 ? "" : "s"}` : `${count} 个节点`;
}

function providerCount(count) {
  return getLang() === "en" ? `${count} provider${count === 1 ? "" : "s"}` : `${count} provider`;
}

function ruleCount(count) {
  return getLang() === "en" ? `${count} rule${count === 1 ? "" : "s"}` : `${count} 条`;
}

function importedStatusText(count, warnings = 0) {
  if (getLang() === "en") {
    const nodeText = `${count} node${Number(count) === 1 ? "" : "s"}`;
    const warningText = warnings ? `, ${warnings} warning${Number(warnings) === 1 ? "" : "s"}` : "";
    return `Imported ${nodeText}${warningText}`;
  }
  return warnings ? `已导入 ${count} 节点，${warnings} 个提醒` : `已导入 ${count} 节点`;
}

function renderTopbarActions() {
  const theme = state.ui?.theme || "system";
  const lang = getLang();
  const themeOptions = [
    { value: "system", icon: "system" },
    { value: "light", icon: "sun" },
    { value: "dark", icon: "moon" }
  ];
  return `
    <div class="topbar-actions">
      <div class="header-segment icon-segment" aria-label="${attr(t("theme.label"))}">
        ${themeOptions.map((option) => `
          <button data-action="set-theme" data-theme="${option.value}" class="${theme === option.value ? "active" : ""}" title="${attr(t(`theme.${option.value}`))}" aria-label="${attr(t(`theme.${option.value}`))}">
            ${icon(option.icon)}
          </button>
        `).join("")}
      </div>
      <div class="header-segment language-segment" aria-label="${attr(t("language.label"))}">
        <button data-action="set-language" data-lang="zh" class="${lang === "zh" ? "active" : ""}" title="${attr(t("language.zh"))}">中</button>
        <button data-action="set-language" data-lang="en" class="${lang === "en" ? "active" : ""}" title="${attr(t("language.en"))}">EN</button>
      </div>
    </div>
  `;
}

function render() {
  const activeNodes = getActiveNodes();
  const providers = getProviderSources();
  const app = document.querySelector("#app");
  const currentTemplateName = templateName(state.template || "standard");

  app.innerHTML = `
    <div class="app-shell">
      <header class="topbar">
        <div class="brand">
          <div class="brand-mark">SP</div>
          <div>
            <h1>subpanel</h1>
            <p>${activeNodes.length ? nodeCount(activeNodes.length) : t("app.subtitle")} · ${escapeHtml(currentTemplateName)}</p>
          </div>
        </div>
        ${renderTopbarActions()}
      </header>

      <main class="workspace">
        <section class="workbench">
          <div class="stack">
            ${renderSourcesPanel()}
            ${renderProjectPanel(activeNodes, providers)}
          </div>
          ${renderPreviewPanel(activeNodes, providers)}
        </section>

        <section class="advanced-grid">
          ${renderNodesPanel()}
          ${renderGroupsPanel()}
          ${renderRulesPanel()}
          ${renderSystemPanel()}
        </section>
      </main>
      <div class="toast-stack" id="toast-stack"></div>
    </div>
  `;
}

function renderProjectPanel(activeNodes, providers) {
  return `
    <section class="panel flow-panel" id="config">
      <div class="panel-body stack">
        <div class="template-picker">
          <div class="row between wrap">
            <strong>${t("template.label")}</strong>
            <span class="hint">${escapeHtml(templateDescription(state.template || "standard"))}</span>
          </div>
          <div class="segmented">
            ${Object.entries(TEMPLATES).map(([id, template]) => `
              <button data-action="apply-template" data-template="${id}" class="${state.template === id ? "active" : ""}" title="${attr(templateDescription(id))}">${escapeHtml(templateName(id))}</button>
            `).join("")}
          </div>
        </div>
        ${renderRoutingPolicyPanel()}
        <div class="generate-strip">
          <div>
            <strong>${activeNodes.length || providers.length ? t("ready") : t("waitingImport")}</strong>
            <span>${nodeCount(activeNodes.length)} · ${providerCount(providers.length)}</span>
          </div>
          <button class="btn primary hero-action" data-action="generate">${icon("spark")}${t("generate")}</button>
        </div>
        ${renderValidationSummary()}
      </div>
    </section>
  `;
}

function renderRoutingPolicyPanel() {
  const groups = getPolicyGroups();
  if (!groups.length) return "";
  return `
    <details class="routing-details">
      <summary>
        <span>${t("routing.title")}</span>
        <small>${summarizePolicies(groups)}</small>
      </summary>
      <div class="policy-list">
        ${groups.map(renderPolicyRow).join("")}
      </div>
    </details>
  `;
}

function renderPolicyRow(group) {
  const value = getGroupPolicy(group);
  return `
    <div class="policy-row">
      <span>${escapeHtml(moduleDisplayName(group))}</span>
      <div class="policy-toggle">
        ${policyOptionsForGroup(group).map((option) => `
          <label class="${value === option.value ? "active" : ""}">
            <input type="radio" name="policy-${attr(group)}" data-policy-group="${attr(group)}" value="${attr(option.value)}" ${value === option.value ? "checked" : ""}>
            ${escapeHtml(option.label)}
          </label>
        `).join("")}
      </div>
    </div>
  `;
}

function renderCheck(field, checked, label) {
  return `
    <label class="checkline">
      <input type="checkbox" data-field="${attr(field)}" ${checked ? "checked" : ""}>
      ${escapeHtml(label)}
    </label>
  `;
}

function renderSourcesPanel() {
  return `
    <section class="panel" id="sources">
      <div class="panel-header">
        <div class="panel-title">
          ${icon("import")}
          <div>
            <h2>${t("source.title")}</h2>
            <span>${sourcePanelStatus()}</span>
          </div>
        </div>
      </div>
      <div class="panel-body source-list">
        ${state.sources.map(renderSource).join("")}
      </div>
    </section>
  `;
}

function renderSource(source) {
  const count = state.nodes.filter((node) => node.sourceId === source.id).length;
  const statusClass = source.error ? "bad" : count || source.providerMode ? "good" : "warn";
  const canRemove = state.sources.length > 1;
  return `
    <div class="source-item" data-source-id="${attr(source.id)}">
      <div class="source-top">
        <div class="row wrap">
          <span class="badge ${statusClass}">${escapeHtml(formatSourceStatus(source, count))}</span>
          <span class="badge">${nodeCount(count)}</span>
          ${source.userinfo ? `<span class="badge">${escapeHtml(source.userinfo)}</span>` : ""}
        </div>
        <div class="row source-actions">
          <button class="btn primary" data-action="import-source" data-id="${attr(source.id)}" title="${attr(source.providerMode ? t("source.providerTitle") : t("source.parseTitle"))}">${icon("refresh")}${t("source.parse")}</button>
          ${canRemove ? `<button class="btn icon danger" data-action="remove-source" data-id="${attr(source.id)}" title="${attr(t("source.removeTitle"))}">${icon("trash")}</button>` : ""}
        </div>
      </div>
      <textarea class="mono smart-input" data-source="${attr(source.id)}" data-source-field="content" placeholder="${attr(sourcePlaceholder())}">${escapeHtml(source.content)}</textarea>
      <div class="row between wrap">
        <details class="inline-details">
          <summary>${t("source.advanced")}</summary>
          <div class="source-meta">
            <label>${t("source.name")}
              <input data-source="${attr(source.id)}" data-source-field="name" value="${attr(source.name)}" placeholder="${attr(t("source.namePlaceholder"))}">
            </label>
            <label>${t("source.tag")}
              <input data-source="${attr(source.id)}" data-source-field="tag" value="${attr(source.tag)}" placeholder="${attr(t("source.tagPlaceholder"))}">
            </label>
          </div>
          <div class="source-meta">
            <label>${t("source.nameTemplate")}
              <input data-source="${attr(source.id)}" data-source-field="nameTemplate" value="${attr(source.nameTemplate)}" placeholder="{tag}{name}">
            </label>
            <label>User-Agent
              <input data-source="${attr(source.id)}" data-source-field="userAgent" value="${attr(source.userAgent)}">
            </label>
          </div>
          <div class="source-item nested-source">
            <div class="row between wrap">
              <strong>${t("source.restrictedHeaders")}</strong>
              <span class="hint">${t("source.requestHeadersHint")}</span>
            </div>
            <label>${t("source.requestHeaders")}
              <textarea class="mono header-textarea" data-source="${attr(source.id)}" data-source-field="requestHeaders" placeholder="${attr(t("source.requestHeadersPlaceholder"))}">${escapeHtml(source.requestHeaders || "")}</textarea>
            </label>
          </div>
          <label class="checkline">
            <input type="checkbox" data-source="${attr(source.id)}" data-source-field="providerMode" ${source.providerMode ? "checked" : ""}>
            ${t("source.providerMode")}
          </label>
          ${source.userinfo ? `<span class="hint">${escapeHtml(source.userinfo)}</span>` : ""}
          <span class="hint">${escapeHtml(t("source.nameHint"))}</span>
        </details>
      </div>
    </div>
  `;
}

function sourcePlaceholder() {
  return t("source.placeholder");
}

function sourcePanelStatus() {
  const count = getActiveNodes().length;
  if (count) return nodeCount(count);
  return t("source.parseAfterPaste");
}

function renderNodesPanel() {
  const activeNodes = getActiveNodes();
  const deleted = state.deletedNodes;
  return renderAdvancedCard({
    id: "nodes",
    icon: icon("spark"),
    title: t("advanced.nodes.title"),
    subtitle: t("advanced.nodes.subtitle"),
    badge: `${activeNodes.length}/${state.nodes.length}`,
    body: `
      <div class="row between wrap advanced-toolbar">
        <span class="hint">${t("advanced.nodes.hint")}</span>
        <button class="btn" data-action="clear-nodes">${icon("trash")}${t("advanced.nodes.clear")}</button>
      </div>
      <details class="subdetails">
        <summary>${t("bulk.title")}</summary>
        ${renderBulkTools()}
      </details>
      ${state.nodes.length ? renderNodeTable() : `<div class="empty">${t("advanced.nodes.empty")}</div>`}
      ${deleted.length ? `
        <div class="item-list">
          <div class="row between">
            <strong>${t("advanced.nodes.deleted")}</strong>
            <button class="btn" data-action="restore-all">${t("advanced.nodes.restoreAll")}</button>
          </div>
          ${deleted.slice(0, 12).map((node) => `
            <div class="deleted-item row between">
              <span class="muted">${escapeHtml(node.name)}</span>
              <button class="btn" data-action="restore-node" data-id="${attr(node.id)}">${t("advanced.nodes.restore")}</button>
            </div>
          `).join("")}
          ${deleted.length > 12 ? `<span class="hint">${t("advanced.nodes.moreDeleted", { count: deleted.length - 12 })}</span>` : ""}
        </div>
      ` : ""}
    `
  });
}

function renderBulkTools() {
  return `
    <div class="source-item">
      <div class="grid-2">
        <label>${t("bulk.include")}
          <input data-bulk="include" value="${attr(state.bulk.include)}" placeholder="${attr(localText("例：HK|Japan|专线", "Example: HK|Japan|premium"))}">
        </label>
        <label>${t("bulk.exclude")}
          <input data-bulk="exclude" value="${attr(state.bulk.exclude)}" placeholder="${attr(localText("例：过期|测试", "Example: expired|test"))}">
        </label>
      </div>
      <div class="grid-2">
        <label>${t("bulk.find")}
          <input data-bulk="find" value="${attr(state.bulk.find)}" placeholder="${attr(localText("例：\\s+\\|\\s+", "Example: \\s+\\|\\s+"))}">
        </label>
        <label>${t("bulk.replace")}
          <input data-bulk="replace" value="${attr(state.bulk.replace)}" placeholder="${attr(localText("例： - ", "Example: - "))}">
        </label>
      </div>
      <div class="row wrap">
        ${renderCheck("bulk.trim", state.bulk.trim, t("bulk.trim"))}
        ${renderCheck("bulk.normalizeSpaces", state.bulk.normalizeSpaces, t("bulk.normalizeSpaces"))}
        <button class="btn primary" data-action="bulk-rename">${icon("spark")}${t("bulk.rename")}</button>
        <label style="width: 150px;">${t("bulk.portStart")}
          <input type="number" data-bulk="portStart" value="${attr(state.bulk.portStart)}">
        </label>
        <button class="btn" data-action="fill-ports">${t("bulk.fillPorts")}</button>
        <button class="btn" data-action="clear-ports">${t("bulk.clearPorts")}</button>
      </div>
    </div>
  `;
}

function renderNodeTable() {
  return `
    <div class="node-table-wrap">
      <table class="node-table">
        <thead>
          <tr>
            <th>${t("table.enabled")}</th>
            <th>${t("table.name")}</th>
            <th>${t("table.type")}</th>
            <th>${t("table.source")}</th>
            <th>${t("table.address")}</th>
            <th>${t("table.listenerPort")}</th>
            <th>${t("table.order")}</th>
            <th>${t("table.action")}</th>
          </tr>
        </thead>
        <tbody>
          ${state.nodes.map((node, index) => `
            <tr>
              <td><input type="checkbox" data-node="${attr(node.id)}" data-node-field="enabled" ${node.enabled !== false ? "checked" : ""}></td>
              <td><input class="small node-name-input" data-node="${attr(node.id)}" data-node-field="name" value="${attr(node.name)}"></td>
              <td><span class="type-pill">${escapeHtml(node.type || "raw")}</span></td>
              <td class="muted">${escapeHtml(node.sourceName || t("common.manual"))}</td>
              <td class="muted">${escapeHtml(node.server || "-")}:${escapeHtml(node.port || "-")}</td>
              <td><input class="small" type="number" min="1" max="65535" data-node="${attr(node.id)}" data-node-field="listenerPort" value="${attr(node.listenerPort || "")}" placeholder="${attr(t("common.empty"))}"></td>
              <td><input class="small" type="number" min="1" max="${state.nodes.length}" data-action="move-node" data-id="${attr(node.id)}" value="${index + 1}"></td>
              <td><button class="btn icon danger" data-action="delete-node" data-id="${attr(node.id)}" title="${attr(t("common.deleteNode"))}">${icon("trash")}</button></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderGroupsPanel() {
  const nodes = getActiveNodes();
  return renderAdvancedCard({
    id: "groups",
    icon: icon("settings"),
    title: t("groups.title"),
    subtitle: t("groups.subtitle"),
    badge: t("groups.customBadge", { count: state.filterGroups.length + state.chainGroups.length }),
    body: `
        <div class="source-item">
          <div class="row between wrap">
            <strong>${t("groups.filterTitle")}</strong>
            <span class="hint">${t("groups.filterHint")}</span>
          </div>
          <div class="grid-2">
            <label>${t("table.name")}
              <input data-new-filter="name" value="${attr(state.newFilter.name)}" placeholder="${attr(localText("例：香港自动", "Example: Hong Kong Auto"))}">
            </label>
            <label>${t("groups.type")}
              <select data-new-filter="type">
                ${["select", "url-test", "fallback", "load-balance"].map((type) => `<option value="${type}" ${state.newFilter.type === type ? "selected" : ""}>${type}</option>`).join("")}
              </select>
            </label>
          </div>
          <div class="grid-3">
            <label>${t("groups.source")}
              <select data-new-filter="source">
                <option value="all">${t("groups.allSources")}</option>
                ${state.sources.map((source) => `<option value="${attr(source.id)}" ${state.newFilter.source === source.id ? "selected" : ""}>${escapeHtml(source.name)}</option>`).join("")}
              </select>
            </label>
            <label>${t("bulk.include")}
              <input data-new-filter="include" value="${attr(state.newFilter.include)}" placeholder="${attr(localText("HK|Hong Kong|香港", "HK|Hong Kong|Premium"))}">
            </label>
            <label>${t("bulk.exclude")}
              <input data-new-filter="exclude" value="${attr(state.newFilter.exclude)}" placeholder="${attr(localText("倍率|过期", "high rate|expired"))}">
            </label>
          </div>
          <div class="row between wrap">
            <span class="hint">${localText(`当前命中 ${matchFilterDraft(nodes).length} 个节点`, `${nodeCount(matchFilterDraft(nodes).length)} matched`)}</span>
            <button class="btn primary" data-action="add-filter">${icon("plus")}${t("groups.addFilter")}</button>
          </div>
        </div>
        <div class="item-list">
          ${state.filterGroups.length ? state.filterGroups.map((group) => renderFilterGroup(group, nodes)).join("") : `<div class="empty">${t("groups.noFilter")}</div>`}
        </div>
        <div class="split-line"></div>
        <div class="source-item">
          <div class="row between wrap">
            <strong>${t("groups.chainTitle")}</strong>
            <span class="hint">${t("groups.chainHint")}</span>
          </div>
          <div class="grid-3">
            <label>${t("table.name")}
              <input data-new-chain="name" value="${attr(state.newChain.name)}" placeholder="${attr(localText("例：HK 到 US", "Example: HK to US"))}">
            </label>
            <label>${t("groups.entry")}
              <select data-new-chain="entry">
                <option value="">${t("groups.selectNode")}</option>
                ${nodes.map((node) => `<option value="${attr(node.id)}" ${state.newChain.entry === node.id ? "selected" : ""}>${escapeHtml(node.name)}</option>`).join("")}
              </select>
            </label>
            <label>${t("groups.exit")}
              <select data-new-chain="exit">
                <option value="">${t("groups.selectNode")}</option>
                ${nodes.map((node) => `<option value="${attr(node.id)}" ${state.newChain.exit === node.id ? "selected" : ""}>${escapeHtml(node.name)}</option>`).join("")}
              </select>
            </label>
          </div>
          <div class="row between wrap">
            <span class="hint">${t("groups.relayHint")}</span>
            <button class="btn primary" data-action="add-chain">${icon("plus")}${t("groups.addChain")}</button>
          </div>
        </div>
        <div class="item-list">
          ${state.chainGroups.length ? state.chainGroups.map(renderChainGroup).join("") : `<div class="empty">${t("groups.noChain")}</div>`}
        </div>
    `
  });
}

function renderFilterGroup(group, nodes) {
  const count = matchFilterGroup(group, nodes).length;
  return `
    <div class="filter-item">
      <div class="row between wrap">
        <div class="row wrap">
          <label class="switch" title="${attr(t("common.enabled"))}">
            <input type="checkbox" data-filter="${attr(group.id)}" data-filter-field="enabled" ${group.enabled !== false ? "checked" : ""}>
            <span></span>
          </label>
          <strong>${escapeHtml(group.name)}</strong>
          <span class="badge">${escapeHtml(group.type)}</span>
          <span class="badge good">${nodeCount(count)}</span>
        </div>
        <button class="btn icon danger" data-action="remove-filter" data-id="${attr(group.id)}">${icon("trash")}</button>
      </div>
      <div class="hint">${t("groups.include")}：${escapeHtml(group.include || t("common.all"))} · ${t("groups.exclude")}：${escapeHtml(group.exclude || t("common.none"))}</div>
    </div>
  `;
}

function renderChainGroup(group) {
  const entry = state.nodes.find((node) => node.id === group.entry);
  const exit = state.nodes.find((node) => node.id === group.exit);
  return `
    <div class="chain-item">
      <div class="row between wrap">
        <div class="row wrap">
          <label class="switch" title="${attr(t("common.enabled"))}">
            <input type="checkbox" data-chain="${attr(group.id)}" data-chain-field="enabled" ${group.enabled !== false ? "checked" : ""}>
            <span></span>
          </label>
          <strong>${escapeHtml(group.name)}</strong>
          <span class="badge">relay</span>
        </div>
        <button class="btn icon danger" data-action="remove-chain" data-id="${attr(group.id)}">${icon("trash")}</button>
      </div>
      <div class="hint">${t("groups.entryShort")}：${escapeHtml(entry?.name || t("groups.unselected"))} · ${t("groups.exitShort")}：${escapeHtml(exit?.name || t("groups.unselected"))}</div>
    </div>
  `;
}

function renderRulesPanel() {
  const targets = getRuleTargets();
  const enabledModules = MODULES.filter((module) => state.modules[module.id] !== false).length;
  return renderAdvancedCard({
    id: "rules",
    icon: icon("eye"),
    title: t("rules.title"),
    subtitle: t("rules.subtitle"),
    badge: `${enabledModules}/${MODULES.length}`,
    body: `
        <div class="modules-grid">
          ${MODULES.map(renderModule).join("")}
        </div>
        <div class="source-item">
          <div class="row between wrap">
            <strong>${t("rules.bulkTitle")}</strong>
            <span class="hint">${t("rules.bulkHint")}</span>
          </div>
          <div class="grid-2">
            <label>${t("rules.target")}
              <select data-field="ruleTarget">
                ${targets.map((target) => `<option value="${attr(target)}" ${state.ruleTarget === target ? "selected" : ""}>${escapeHtml(moduleDisplayName(target))}</option>`).join("")}
              </select>
            </label>
            <label>${t("rules.example")}
              <input readonly value="${attr(localText("DOMAIN-SUFFIX,example.com 或 github.com", "DOMAIN-SUFFIX,example.com or github.com"))}">
            </label>
          </div>
          <textarea class="mono" data-field="ruleInput" placeholder="${attr(localText("DOMAIN-SUFFIX,example.com,节点选择\nIP-CIDR,1.1.1.0/24,节点选择,no-resolve\ngithub.com", "DOMAIN-SUFFIX,example.com,节点选择\nIP-CIDR,1.1.1.0/24,节点选择,no-resolve\ngithub.com"))}">${escapeHtml(state.ruleInput)}</textarea>
          <div class="row between wrap">
            <span class="hint">${t("rules.customCount", { count: state.customRules.length })}</span>
            <button class="btn primary" data-action="import-rules">${icon("plus")}${t("rules.import")}</button>
          </div>
        </div>
        ${state.customRules.length ? `
          <div class="item-list">
            ${state.customRules.map((rule) => `
              <div class="deleted-item row between">
                <span class="muted">${escapeHtml(rule.line)}</span>
                <button class="btn icon danger" data-action="remove-rule" data-id="${attr(rule.id)}">${icon("trash")}</button>
              </div>
            `).join("")}
          </div>
        ` : ""}
    `
  });
}

function renderModule(module) {
  const enabled = state.modules[module.id] !== false;
  return `
    <div class="module-item">
      <div class="module-title">
        <div>
          <strong>${escapeHtml(moduleDisplayName(module))}</strong>
          <div class="hint">${escapeHtml(categoryDisplayName(module.category))} · ${ruleCount(module.rules.length)}</div>
        </div>
        <label class="switch" title="${attr(`${t("common.enabled")} ${moduleDisplayName(module)}`)}">
          <input type="checkbox" data-module="${attr(module.id)}" ${enabled ? "checked" : ""}>
          <span></span>
        </label>
      </div>
      <span class="badge">${escapeHtml(module.groupType)}</span>
    </div>
  `;
}

function renderPreviewPanel(activeNodes, providers) {
  const yaml = state.preview || t("preview.placeholder");
  return `
    <section class="panel preview-panel" id="preview">
      <div class="panel-header">
        <div class="panel-title">
          ${icon("eye")}
          <div>
            <h2>${t("preview.title")}</h2>
            <span>${state.lastGeneratedAt ? t("preview.generatedAt", { time: escapeHtml(state.lastGeneratedAt) }) : t("preview.waiting")}</span>
          </div>
        </div>
        <div class="preview-tools">
          <button class="btn" data-action="copy-yaml">${icon("copy")}${t("preview.copy")}</button>
          <button class="btn" data-action="download-yaml">${icon("download")}${t("preview.download")}</button>
        </div>
      </div>
      ${renderValidationSummary()}
      <textarea class="preview-area mono" data-field="preview">${escapeHtml(yaml)}</textarea>
    </section>
  `;
}

function renderVisual(activeNodes, providers) {
  const groups = buildProxyGroups(activeNodes, providers).groups;
  const enabledModules = MODULES.filter((module) => state.modules[module.id] !== false);
  return `
    <div class="visual">
      <div class="visual-row">
        <div class="visual-label">${t("advanced.nodes.title")}</div>
        <div class="chip-cloud">
          ${activeNodes.slice(0, 36).map((node) => `<span class="chip">${escapeHtml(node.name)}</span>`).join("") || `<span class="hint">${t("advanced.nodes.empty")}</span>`}
          ${activeNodes.length > 36 ? `<span class="badge">${t("advanced.nodes.moreDeleted", { count: activeNodes.length - 36 })}</span>` : ""}
        </div>
      </div>
      <div class="visual-row">
        <div class="visual-label">Provider</div>
        <div class="chip-cloud">
          ${providers.map((source) => `<span class="chip">${escapeHtml(providerName(source))}</span>`).join("") || `<span class="hint">${t("status.notImported")}</span>`}
        </div>
      </div>
      <div class="visual-row">
        <div class="visual-label">${t("groups.title")}</div>
        <div class="chip-cloud">
          ${groups.map((group) => `<span class="chip">${escapeHtml(moduleDisplayName(group.name))} · ${escapeHtml(group.type)}</span>`).join("")}
        </div>
      </div>
      <div class="visual-row">
        <div class="visual-label">${t("rules.title")}</div>
        <div class="chip-cloud">
          ${enabledModules.map((module) => `<span class="chip">${escapeHtml(moduleDisplayName(module))}</span>`).join("")}
        </div>
      </div>
    </div>
  `;
}

function renderSystemPanel() {
  return renderAdvancedCard({
    id: "system",
    icon: icon("settings"),
    title: t("system.title"),
    subtitle: t("system.subtitle"),
    badge: `:${state.base.mixedPort || 7890}`,
    body: `
      <div class="grid-2">
        <label>${t("system.profileName")}
          <input data-field="profileName" value="${attr(state.profileName)}" placeholder="${attr(t("system.profilePlaceholder"))}">
        </label>
      </div>
      <div class="grid-3">
        <label>mixed-port
          <input type="number" min="1" max="65535" data-field="base.mixedPort" value="${attr(state.base.mixedPort)}">
        </label>
        <label>socks-port
          <input type="number" min="1" max="65535" data-field="base.socksPort" value="${attr(state.base.socksPort)}" placeholder="${attr(t("common.empty"))}">
        </label>
        <label>redir-port
          <input type="number" min="1" max="65535" data-field="base.redirPort" value="${attr(state.base.redirPort)}" placeholder="${attr(t("common.empty"))}">
        </label>
      </div>
      <div class="grid-3">
        <label>${t("system.mode")}
          <select data-field="base.mode">
            ${["rule", "global", "direct"].map((mode) => `<option value="${mode}" ${state.base.mode === mode ? "selected" : ""}>${mode}</option>`).join("")}
          </select>
        </label>
        <label>${t("system.testUrl")}
          <input data-field="base.testUrl" value="${attr(state.base.testUrl)}">
        </label>
        <label>${t("system.testInterval")}
          <input type="number" min="30" data-field="base.testInterval" value="${attr(state.base.testInterval)}">
        </label>
      </div>
      <div class="row wrap">
        ${renderCheck("base.allowLan", state.base.allowLan, t("system.allowLan"))}
        ${renderCheck("base.ipv6", state.base.ipv6, t("system.ipv6"))}
      </div>
      <div class="source-item">
        <div class="row between wrap">
          <strong>DNS YAML</strong>
          <button class="btn" data-action="reset-dns">${icon("refresh")}${t("system.resetDns")}</button>
        </div>
        <textarea class="mono" data-field="dnsYaml" style="min-height: 260px;">${escapeHtml(state.dnsYaml)}</textarea>
      </div>
      <div class="source-item">
        <div class="row between wrap">
          <strong>${t("system.dnsPolicyTitle")}</strong>
          <span class="hint">${t("system.dnsPolicyHint")}</span>
        </div>
        <div class="grid-2">
          <label>${t("system.dnsPolicyDomain")}
            <input data-new-dns="domain" value="${attr(state.newDnsPolicy.domain)}" placeholder="${attr(t("system.dnsPolicyDomainPlaceholder"))}">
          </label>
          <label>${t("system.dnsPolicyServer")}
            <input data-new-dns="server" value="${attr(state.newDnsPolicy.server)}" placeholder="${attr(t("system.dnsPolicyServerPlaceholder"))}">
          </label>
        </div>
        <div class="row between wrap">
          <span class="hint">${state.dnsPolicies.length ? localText(`当前 ${state.dnsPolicies.length} 条映射`, `${state.dnsPolicies.length} mapping${state.dnsPolicies.length === 1 ? "" : "s"}`) : t("system.noDnsPolicy")}</span>
          <button class="btn primary" data-action="add-dns-policy">${icon("plus")}${t("system.addDnsPolicy")}</button>
        </div>
        ${state.dnsPolicies.length ? `
          <div class="item-list dns-policy-list">
            ${state.dnsPolicies.map((policy) => `
              <div class="deleted-item row between">
                <span class="muted">${escapeHtml(policy.domain)} -> ${escapeHtml(policy.server)}</span>
                <button class="btn icon danger" data-action="remove-dns-policy" data-id="${attr(policy.id)}" title="${attr(t("system.removeDnsPolicy"))}">${icon("trash")}</button>
              </div>
            `).join("")}
          </div>
        ` : ""}
      </div>
    `
  });
}

function renderAdvancedCard({ id, icon: iconMarkup, title, subtitle, badge, body }) {
  const open = state.ui.advancedOpen[id];
  return `
    <details class="advanced-card" data-advanced="${attr(id)}" ${open ? "open" : ""}>
      <summary>
        <span class="advanced-icon">${iconMarkup}</span>
        <span class="advanced-copy">
          <strong>${escapeHtml(title)}</strong>
          <span>${escapeHtml(subtitle)}</span>
        </span>
        <span class="badge">${escapeHtml(badge)}</span>
      </summary>
      <div class="advanced-body stack">
        ${body}
      </div>
    </details>
  `;
}

function renderValidationSummary() {
  const errors = state.validation?.errors || [];
  const warnings = state.validation?.warnings || [];
  if (!errors.length && !warnings.length) return "";
  return `
    <div class="validation-box ${errors.length ? "bad" : "warn"}">
      <strong>${errors.length ? t("validation.errorTitle") : t("validation.warnTitle")}</strong>
      <ul>
        ${errors.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        ${warnings.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </div>
  `;
}

function attachEvents() {
  document.body.addEventListener("click", handleClick);
  document.body.addEventListener("input", handleInput);
  document.body.addEventListener("change", handleChange);
  document.body.addEventListener("toggle", handleToggle, true);
}

function handleToggle(event) {
  const details = event.target.closest?.("[data-advanced]");
  if (!details || !state.ui?.advancedOpen) return;
  state.ui.advancedOpen[details.dataset.advanced] = details.open;
  saveState();
}

async function handleClick(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const action = button.dataset.action;
  if (action !== "move-node") event.preventDefault();

  const actionMap = {
    "add-source": () => addSource(button.dataset.type || "url"),
    "remove-source": () => removeSource(button.dataset.id),
    "import-source": () => importSource(button.dataset.id),
    "apply-template": () => applyTemplate(button.dataset.template),
    "clear-nodes": clearNodes,
    "delete-node": () => deleteNode(button.dataset.id),
    "restore-node": () => restoreNode(button.dataset.id),
    "restore-all": restoreAll,
    "bulk-rename": bulkRename,
    "fill-ports": fillPorts,
    "clear-ports": clearPorts,
    "add-filter": addFilter,
    "remove-filter": () => removeFilter(button.dataset.id),
    "add-chain": addChain,
    "remove-chain": () => removeChain(button.dataset.id),
    "add-dns-policy": addDnsPolicy,
    "remove-dns-policy": () => removeDnsPolicy(button.dataset.id),
    "import-rules": importRules,
    "remove-rule": () => removeRule(button.dataset.id),
    "reset-dns": resetDns,
    "generate": generateAndRender,
    "copy-yaml": copyYaml,
    "download-yaml": downloadYaml,
    "set-preview-tab": () => setPreviewTab(button.dataset.tab),
    "set-theme": () => setThemePreference(button.dataset.theme),
    "set-language": () => setLanguage(button.dataset.lang)
  };

  const handler = actionMap[action];
  if (handler) await handler();
}

function handleInput(event) {
  const el = event.target;
  if (el.dataset.field) {
    setPath(state, el.dataset.field, readInputValue(el));
    saveState();
    return;
  }
  if (el.dataset.source && el.dataset.sourceField) {
    updateSource(el.dataset.source, el.dataset.sourceField, readInputValue(el));
    return;
  }
  if (el.dataset.node && el.dataset.nodeField) {
    updateNode(el.dataset.node, el.dataset.nodeField, readInputValue(el));
    return;
  }
  if (el.dataset.bulk) {
    state.bulk[el.dataset.bulk] = readInputValue(el);
    saveState();
    return;
  }
  if (el.dataset.newFilter) {
    state.newFilter[el.dataset.newFilter] = readInputValue(el);
    saveState();
    return;
  }
  if (el.dataset.newChain) {
    state.newChain[el.dataset.newChain] = readInputValue(el);
    saveState();
    return;
  }
  if (el.dataset.newDns) {
    state.newDnsPolicy[el.dataset.newDns] = readInputValue(el);
    saveState();
  }
}

function handleChange(event) {
  const el = event.target;
  if (el.dataset.action === "move-node") {
    moveNode(el.dataset.id, Number(el.value));
    return;
  }
  if (el.dataset.policyGroup) {
    state.groupPolicies[el.dataset.policyGroup] = el.value;
    saveState();
    render();
    return;
  }
  if (el.dataset.field) {
    const value = readInputValue(el);
    setPath(state, el.dataset.field, value);
    saveState();
    if (shouldRerenderForField(el.dataset.field)) render();
    return;
  }
  if (el.dataset.source && el.dataset.sourceField) {
    updateSource(el.dataset.source, el.dataset.sourceField, readInputValue(el));
    render();
    return;
  }
  if (el.dataset.node && el.dataset.nodeField) {
    updateNode(el.dataset.node, el.dataset.nodeField, readInputValue(el));
    if (el.dataset.nodeField === "enabled") render();
    return;
  }
  if (el.dataset.module) {
    state.modules[el.dataset.module] = el.checked;
    saveState();
    render();
    return;
  }
  if (el.dataset.filter && el.dataset.filterField) {
    const group = state.filterGroups.find((item) => item.id === el.dataset.filter);
    if (group) group[el.dataset.filterField] = readInputValue(el);
    saveState();
    render();
    return;
  }
  if (el.dataset.chain && el.dataset.chainField) {
    const group = state.chainGroups.find((item) => item.id === el.dataset.chain);
    if (group) group[el.dataset.chainField] = readInputValue(el);
    saveState();
    render();
    return;
  }
  if (el.dataset.bulk) {
    state.bulk[el.dataset.bulk] = readInputValue(el);
    saveState();
  }
  if (el.dataset.newFilter) {
    state.newFilter[el.dataset.newFilter] = readInputValue(el);
    saveState();
    render();
  }
  if (el.dataset.newChain) {
    state.newChain[el.dataset.newChain] = readInputValue(el);
    saveState();
    return;
  }
  if (el.dataset.newDns) {
    state.newDnsPolicy[el.dataset.newDns] = readInputValue(el);
    saveState();
  }
}

function readInputValue(el) {
  if (el.type === "checkbox") return el.checked;
  if (el.type === "number") return el.value === "" ? "" : Number(el.value);
  return el.value;
}

function shouldRerenderForField(field) {
  return ["profileName", "ruleTarget", "base.allowLan", "base.ipv6"].includes(field);
}

function setPath(obj, pathText, value) {
  const parts = pathText.split(".");
  let cursor = obj;
  for (let index = 0; index < parts.length - 1; index += 1) {
    cursor = cursor[parts[index]];
  }
  cursor[parts.at(-1)] = value;
}

function updateSource(id, field, value) {
  const source = state.sources.find((item) => item.id === id);
  if (!source) return;
  source[field] = value;
  if (field === "type") {
    source.status = t("status.notImported");
    source.error = "";
    if (value !== "url") source.providerMode = false;
  }
  saveState();
}

function updateNode(id, field, value) {
  const node = state.nodes.find((item) => item.id === id);
  if (!node) return;
  node[field] = value;
  saveState();
}

function addSource(type) {
  state.sources.push(createSource(type));
  saveState();
  render();
}

function removeSource(id) {
  state.sources = state.sources.filter((source) => source.id !== id);
  const removed = state.nodes.filter((node) => node.sourceId === id);
  state.deletedNodes.push(...removed.map((node) => ({ ...node, deletedAt: new Date().toISOString() })));
  state.nodes = state.nodes.filter((node) => node.sourceId !== id);
  saveState();
  render();
  toast(t("toast.sourceRemoved"), "warn");
}

function inferSourceType(source) {
  const text = String(source.content || "").trim();
  if (!text) return source.type || "url";
  if (looksLikeYaml(text)) return "yaml";
  const decoded = decodeMaybeBase64(text);
  const body = decoded || text;
  if (looksLikeYaml(body)) return "yaml";
  const lines = body.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.some((line) => /^(ss|ssr|vmess|vless|trojan|hysteria2|hy2|tuic|anytls|socks4|socks5):\/\//i.test(line))) {
    return "nodes";
  }
  return source.type || "url";
}

async function importSource(id) {
  const source = state.sources.find((item) => item.id === id);
  if (!source) return;
  const items = splitSmartInput(source.content || "");
  source.type = inferSmartSourceType(items, source);

  source.error = "";
  source.status = source.providerMode ? t("status.providerSaved") : t("status.parsing");
  saveState();
  render();

  try {
    if (!items.length) throw new Error(t("error.pasteFirst"));

    if (source.providerMode) {
      const urls = items.filter((item) => item.kind === "url");
      if (items.length !== 1 || urls.length !== 1) {
        throw new Error(t("error.providerSingleUrl"));
      }
      if (String(source.requestHeaders || "").trim()) {
        throw new Error(localText("临时请求头只能用于解析成静态节点，请关闭 proxy-providers。", "Temporary request headers only work when parsing into static nodes. Disable proxy-providers."));
      }
      source.type = "url";
      source.nodeIds = [];
      source.status = t("status.providerMode");
      state.nodes = state.nodes.filter((node) => node.sourceId !== source.id);
      saveState();
      render();
      toast(t("toast.providerSaved"), "good");
      return;
    }

    const parsed = [];
    const errors = [];
    let userinfo = "";

    const resolvedItems = await resolveSmartInput(source, items);
    for (const item of resolvedItems) {
      if (item.error && !item.body) {
        errors.push(`${item.url || t("source.title")}：${item.error}`);
        continue;
      }
      const itemNodes = parseInputContent(item.body || "", source);
      parsed.push(...itemNodes);
      if (item.userinfo) userinfo = item.userinfo;
      if (!itemNodes.length) errors.push(item.url ? t("error.noNodesInSubscription", { url: item.url }) : t("error.unparsedChunk"));
    }

    if (!parsed.length) throw new Error(errors[0] || t("error.noParsedNodes"));

    const previous = new Map(state.nodes.filter((node) => node.sourceId === source.id).map((node) => [node.originName, node]));
    const nodes = parsed.map((node, index) => {
      const existing = previous.get(node.originName);
      return {
        ...node,
        id: existing?.id || uid("node"),
        sourceId: source.id,
        sourceName: source.name || source.type,
        sourceTag: source.tag || "",
        name: existing?.name || formatNodeName(node.originName, source, node.type, index),
        enabled: existing?.enabled ?? true,
        listenerPort: existing?.listenerPort || "",
        importedAt: new Date().toISOString()
      };
    });

    state.nodes = state.nodes.filter((node) => node.sourceId !== source.id).concat(nodes);
    source.nodeIds = nodes.map((node) => node.id);
    source.status = importedStatusText(nodes.length, errors.length);
    source.error = "";
    if (userinfo) source.userinfo = userinfo;
    saveState();
    render();
    toast(importedStatusText(nodes.length), errors.length ? "warn" : "good");
  } catch (error) {
    source.error = error.message || t("status.importFailed");
    source.status = t("status.importFailed");
    saveState();
    render();
    toast(source.error, "bad");
  }
}

function splitSmartInput(content) {
  const raw = String(content || "").trim();
  if (!raw) return [];
  if (looksLikeYaml(raw)) return [{ kind: "content", value: raw }];

  const decoded = decodeMaybeBase64(raw);
  const body = decoded && (decoded.includes("://") || looksLikeYaml(decoded)) ? decoded.trim() : raw;
  if (looksLikeYaml(body)) return [{ kind: "content", value: body }];

  const items = [];
  let nodeLines = [];
  const flushNodes = () => {
    if (!nodeLines.length) return;
    items.push({ kind: "content", value: nodeLines.join("\n") });
    nodeLines = [];
  };

  for (const line of body.split(/\r?\n/).map((item) => item.trim()).filter(Boolean)) {
    if (line.startsWith("#")) continue;
    if (isHttpUrl(line)) {
      flushNodes();
      items.push({ kind: "url", value: line });
    } else {
      nodeLines.push(line);
    }
  }
  flushNodes();
  return items;
}

function inferSmartSourceType(items, source) {
  if (!items.length) return source.type || "url";
  if (items.length === 1 && items[0].kind === "url") return "url";
  if (items.length === 1 && looksLikeYaml(items[0].value)) return "yaml";
  return "nodes";
}

async function fetchSubscriptionContent(url, source) {
  const response = await fetch("/api/fetch", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      url,
      userAgent: source.userAgent || "",
      headers: requestHeadersForSource(source)
    })
  });
  const data = await response.json();
  if (!data.ok && !data.body) throw new Error(data.error || t("error.remoteHttp", { status: data.status || "error" }));
  const rawUserinfo = data.headers?.["subscription-userinfo"] || "";
  return {
    body: data.body || "",
    userinfo: parseUserInfo(rawUserinfo) || rawUserinfo
  };
}

const BLOCKED_HEADER_NAMES = new Set([
  "host",
  "connection",
  "content-length",
  "transfer-encoding",
  "upgrade",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer"
]);

function requestHeadersForSource(source) {
  const headers = parseHeaderText(source.requestHeaders || "");
  const userAgent = String(source.userAgent || "").trim();
  if (userAgent) headers["user-agent"] = userAgent;
  return headers;
}

function parseHeaderText(text) {
  const headers = {};
  for (const rawLine of String(text || "").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const index = line.indexOf(":");
    if (index <= 0) continue;
    const name = line.slice(0, index).trim().toLowerCase();
    const value = line.slice(index + 1).trim();
    if (!/^[a-z0-9!#$%&'*+.^_`|~-]+$/i.test(name)) continue;
    if (BLOCKED_HEADER_NAMES.has(name) || name.startsWith(":")) continue;
    if (!value || value.length > 4096) continue;
    headers[name] = value;
  }
  return headers;
}

async function resolveSmartInput(source, fallbackItems) {
  const resolved = [];
  for (const item of fallbackItems) {
    if (item.kind !== "url") {
      resolved.push({ body: item.value, url: "", error: "", userinfo: "" });
      continue;
    }
    try {
      const remote = await fetchSubscriptionContent(item.value, source);
      resolved.push({ body: remote.body, url: item.value, error: "", userinfo: remote.userinfo });
    } catch (error) {
      resolved.push({ body: "", url: item.value, error: error.message || t("error.fetchFailed"), userinfo: "" });
    }
  }
  return resolved;
}

function parseUserInfo(header) {
  if (!header) return "";
  const pairs = Object.fromEntries(header.split(";").map((part) => {
    const [key, value] = part.trim().split("=");
    return [key, Number(value)];
  }));
  const used = formatBytes((pairs.upload || 0) + (pairs.download || 0));
  const total = pairs.total ? formatBytes(pairs.total) : "";
  const expire = pairs.expire ? new Date(pairs.expire * 1000).toISOString().slice(0, 10) : "";
  return [total ? `${used}/${total}` : used, expire ? `${localText("到期", "expires")} ${expire}` : ""].filter(Boolean).join(" · ");
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function parseInputContent(content, source) {
  const text = content.trim();
  if (!text) return [];

  if (looksLikeYaml(text)) {
    return parseClashYaml(text);
  }

  const decoded = decodeMaybeBase64(text);
  const body = decoded && decoded.includes("://") ? decoded : text;
  if (looksLikeYaml(body)) return parseClashYaml(body);

  return body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .flatMap((line) => parseNodeLine(line, source));
}

function looksLikeYaml(text) {
  return /(^|\n)\s*proxies\s*:/i.test(text) || /(^|\n)\s*proxy-groups\s*:/i.test(text);
}

function decodeMaybeBase64(text) {
  const compact = text.replace(/\s+/g, "");
  if (!compact || compact.includes("://")) return "";
  if (!/^[A-Za-z0-9+/_=-]+$/.test(compact)) return "";
  try {
    return b64Decode(compact);
  } catch {
    return "";
  }
}

function b64Decode(input) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function parseNodeLine(line) {
  try {
    const lower = line.toLowerCase();
    if (lower.startsWith("vmess://")) return [parseVmess(line)];
    if (lower.startsWith("ss://")) return [parseShadowsocks(line)];
    if (lower.startsWith("ssr://")) return [parseSsr(line)];
    if (lower.startsWith("vless://")) return [parseUrlNode(line, "vless")];
    if (lower.startsWith("trojan://")) return [parseUrlNode(line, "trojan")];
    if (lower.startsWith("hysteria2://") || lower.startsWith("hy2://")) return [parseUrlNode(line, "hysteria2")];
    if (lower.startsWith("tuic://")) return [parseUrlNode(line, "tuic")];
    if (lower.startsWith("anytls://")) return [parseUrlNode(line, "anytls")];
    if (lower.startsWith("socks5://") || lower.startsWith("socks4://")) return [parseUrlNode(line, "socks5")];
  } catch (error) {
    console.warn("Parse node failed", error?.message || error);
  }
  return [];
}

function parseVmess(line) {
  const json = JSON.parse(b64Decode(line.replace("vmess://", "")));
  const node = {
    originName: json.ps || json.add || "vmess",
    type: "vmess",
    server: json.add,
    port: Number(json.port),
    uuid: json.id,
    alterId: Number(json.aid || 0),
    cipher: json.scy || "auto",
    network: json.net || "tcp",
    tls: json.tls === "tls" || json.tls === true,
    servername: json.sni || json.host || "",
    raw: line
  };
  if (json.net === "ws") {
    node.wsPath = json.path || "/";
    node.wsHost = json.host || "";
  }
  if (json.net === "grpc") {
    node.grpcServiceName = json.path || "";
  }
  return node;
}

function parseShadowsocks(line) {
  const [beforeHash, hash = ""] = line.slice(5).split("#");
  const [mainPart, query = ""] = beforeHash.split("?");
  let auth = "";
  let serverPort = "";

  if (mainPart.includes("@")) {
    const pieces = mainPart.split("@");
    auth = safeDecode(pieces[0]);
    serverPort = pieces.slice(1).join("@");
    if (!auth.includes(":")) auth = b64Decode(auth);
  } else {
    const decoded = b64Decode(mainPart);
    const at = decoded.lastIndexOf("@");
    auth = decoded.slice(0, at);
    serverPort = decoded.slice(at + 1);
  }

  const [cipher, ...passwordParts] = auth.split(":");
  const { host, port } = splitHostPort(serverPort);
  const params = new URLSearchParams(query);
  return {
    originName: safeDecode(hash) || host || "ss",
    type: "ss",
    server: host,
    port,
    cipher,
    password: passwordParts.join(":"),
    plugin: params.get("plugin") || "",
    raw: line
  };
}

function parseSsr(line) {
  const decoded = b64Decode(line.replace("ssr://", ""));
  const [main, query = ""] = decoded.split("/?");
  const [server, port, protocol, method, obfs, passwordRaw] = main.split(":");
  const params = new URLSearchParams(query);
  const remarks = params.get("remarks") ? b64Decode(params.get("remarks")) : "";
  return {
    originName: remarks || server || "ssr",
    type: "ssr",
    server,
    port: Number(port),
    cipher: method,
    password: b64Decode(passwordRaw || ""),
    protocol,
    obfs,
    protocolParam: params.get("protoparam") ? b64Decode(params.get("protoparam")) : "",
    obfsParam: params.get("obfsparam") ? b64Decode(params.get("obfsparam")) : "",
    raw: line
  };
}

function parseUrlNode(line, forcedType) {
  const url = new URL(line);
  const params = Object.fromEntries(url.searchParams.entries());
  const type = forcedType || url.protocol.replace(":", "");
  const node = {
    originName: safeDecode(url.hash.replace(/^#/, "")) || url.hostname || type,
    type,
    server: url.hostname,
    port: Number(url.port) || defaultPort(type),
    raw: line,
    params
  };

  if (type === "vless") {
    node.uuid = safeDecode(url.username);
    node.network = params.type || params.network || "tcp";
    node.tls = ["tls", "reality"].includes(params.security);
    node.flow = params.flow || "";
    node.servername = params.sni || params.host || "";
    node.wsPath = params.path || "";
    node.wsHost = params.host || "";
    node.realityPublicKey = params.pbk || "";
    node.realityShortId = params.sid || "";
    node.clientFingerprint = params.fp || "";
  } else if (type === "trojan") {
    node.password = safeDecode(url.username);
    node.network = params.type || params.network || "tcp";
    node.tls = params.security !== "none";
    node.servername = params.sni || params.peer || params.host || "";
    node.wsPath = params.path || "";
    node.wsHost = params.host || "";
  } else if (type === "hysteria2") {
    node.password = safeDecode(url.username);
    node.sni = params.sni || "";
    node.obfs = params.obfs || "";
    node.obfsPassword = params["obfs-password"] || params.obfsPassword || "";
    node.skipCertVerify = params.insecure === "1" || params["skip-cert-verify"] === "true";
  } else if (type === "tuic") {
    node.uuid = safeDecode(url.username);
    node.password = safeDecode(url.password);
    node.sni = params.sni || "";
    node.congestionController = params.congestion_control || params.congestionController || "bbr";
    node.udpRelayMode = params.udp_relay_mode || params.udpRelayMode || "native";
    node.skipCertVerify = params.insecure === "1" || params["skip-cert-verify"] === "true";
  } else if (type === "anytls") {
    node.password = safeDecode(url.username);
    node.sni = params.sni || "";
    node.skipCertVerify = params.insecure === "1" || params["skip-cert-verify"] === "true";
  } else if (type === "socks5") {
    node.username = safeDecode(url.username);
    node.password = safeDecode(url.password);
  }

  return node;
}

function defaultPort(type) {
  return 0;
}

function safeDecode(value) {
  try {
    return decodeURIComponent(value || "");
  } catch {
    return value || "";
  }
}

function splitHostPort(text) {
  const value = text.trim();
  if (value.startsWith("[")) {
    const end = value.indexOf("]");
    const host = value.slice(1, end);
    const port = Number(value.slice(end + 2));
    return { host, port };
  }
  const index = value.lastIndexOf(":");
  return { host: value.slice(0, index), port: Number(value.slice(index + 1)) };
}

function parseClashYaml(text) {
  const lines = text.split(/\r?\n/);
  const proxyStart = lines.findIndex((line) => /^\s*proxies\s*:\s*$/.test(line));
  if (proxyStart < 0) return [];

  const nodes = [];
  let current = null;
  let baseIndent = null;

  for (let index = proxyStart + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim()) continue;
    const indent = line.match(/^\s*/)[0].length;
    if (baseIndent === null && /^\s*-\s+/.test(line)) baseIndent = indent;
    if (baseIndent !== null && indent < baseIndent && /^[A-Za-z0-9_-]+\s*:/.test(line.trim())) break;

    const itemMatch = line.match(/^\s*-\s+(.*)$/);
    if (itemMatch) {
      if (current?.name) nodes.push(normalizeYamlProxy(current));
      current = {};
      const rest = itemMatch[1].trim();
      if (rest.startsWith("{") && rest.endsWith("}")) {
        current = parseInlineYamlMap(rest);
      } else if (rest.includes(":")) {
        const [key, ...parts] = rest.split(":");
        current[key.trim()] = yamlValue(parts.join(":").trim());
      }
      continue;
    }

    const propMatch = line.match(/^\s+([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (current && propMatch) {
      current[propMatch[1]] = yamlValue(propMatch[2].trim());
    }
  }

  if (current?.name) nodes.push(normalizeYamlProxy(current));
  return nodes.filter((node) => node.name && node.type);
}

function parseInlineYamlMap(text) {
  const body = text.slice(1, -1);
  const result = {};
  const parts = splitRespectingQuotes(body, ",");
  for (const part of parts) {
    const index = part.indexOf(":");
    if (index < 0) continue;
    const key = part.slice(0, index).trim();
    result[key] = yamlValue(part.slice(index + 1).trim());
  }
  return result;
}

function splitRespectingQuotes(text, separator) {
  const parts = [];
  let current = "";
  let quote = "";
  for (const char of text) {
    if ((char === "\"" || char === "'") && !quote) quote = char;
    else if (char === quote) quote = "";
    if (char === separator && !quote) {
      parts.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  if (current) parts.push(current);
  return parts;
}

function yamlValue(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  return value.replace(/^["']|["']$/g, "");
}

function normalizeYamlProxy(proxy) {
  return {
    ...proxy,
    originName: proxy.name,
    name: proxy.name,
    type: proxy.type,
    server: proxy.server || "",
    port: Number(proxy.port || 0),
    fromYaml: true
  };
}

function formatNodeName(originName, source, type, index) {
  const tag = source.tag ? `[${source.tag}] ` : "";
  const template = source.nameTemplate || "{tag}{name}";
  const value = template
    .replaceAll("{tag}", tag)
    .replaceAll("{name}", originName || `${type}-${index + 1}`)
    .replaceAll("{type}", type || "")
    .replaceAll("{index}", String(index + 1));
  return value.trim() || originName || `${type}-${index + 1}`;
}

function getActiveNodes() {
  return state.nodes.filter((node) => node.enabled !== false);
}

function getProviderSources() {
  return state.sources.filter((source) => source.providerMode && providerUrl(source));
}

function providerName(source) {
  return safeYamlName(source.tag || source.name || source.id);
}

function providerUrl(source) {
  const items = splitSmartInput(source.content || "");
  return items.length === 1 && items[0].kind === "url" ? items[0].value : "";
}

function safeYamlName(value) {
  return String(value || "provider").trim().replace(/[^\p{L}\p{N}_-]+/gu, "-").replace(/^-+|-+$/g, "") || "provider";
}

function applyTemplate(templateId) {
  const template = TEMPLATES[templateId];
  if (!template) return;
  state.template = templateId;
  state.modules = Object.fromEntries(MODULES.map((module) => [module.id, template.modules.includes(module.id)]));
  saveState();
  render();
  toast(t("toast.templateApplied", { name: templateName(templateId) }), "good");
}

function clearNodes() {
  if (!state.nodes.length) return;
  state.deletedNodes.push(...state.nodes.map((node) => ({ ...node, deletedAt: new Date().toISOString() })));
  state.nodes = [];
  for (const source of state.sources) source.nodeIds = [];
  saveState();
  render();
  toast(t("toast.nodesCleared"), "warn");
}

function deleteNode(id) {
  const node = state.nodes.find((item) => item.id === id);
  if (!node) return;
  state.nodes = state.nodes.filter((item) => item.id !== id);
  state.deletedNodes.unshift({ ...node, deletedAt: new Date().toISOString() });
  saveState();
  render();
}

function restoreNode(id) {
  const node = state.deletedNodes.find((item) => item.id === id);
  if (!node) return;
  state.deletedNodes = state.deletedNodes.filter((item) => item.id !== id);
  state.nodes.push({ ...node, enabled: true });
  saveState();
  render();
}

function restoreAll() {
  state.nodes.push(...state.deletedNodes.map((node) => ({ ...node, enabled: true })));
  state.deletedNodes = [];
  saveState();
  render();
}

function moveNode(id, newPosition) {
  const index = state.nodes.findIndex((node) => node.id === id);
  if (index < 0) return;
  const target = Math.max(0, Math.min(state.nodes.length - 1, Number(newPosition) - 1));
  const [node] = state.nodes.splice(index, 1);
  state.nodes.splice(target, 0, node);
  saveState();
  render();
}

function compileRegex(pattern) {
  if (!pattern) return null;
  return new RegExp(pattern, "i");
}

function bulkCandidates() {
  const include = compileRegex(state.bulk.include);
  const exclude = compileRegex(state.bulk.exclude);
  return state.nodes.filter((node) => {
    if (include && !include.test(node.name)) return false;
    if (exclude && exclude.test(node.name)) return false;
    return true;
  });
}

function bulkRename() {
  let findRegex = null;
  if (state.bulk.find) {
    try {
      findRegex = new RegExp(state.bulk.find, "g");
    } catch {
      toast(t("toast.invalidRegex"), "bad");
      return;
    }
  }

  let changed = 0;
  for (const node of bulkCandidates()) {
    let next = node.name;
    if (findRegex) next = next.replace(findRegex, state.bulk.replace || "");
    if (state.bulk.normalizeSpaces) next = next.replace(/\s+/g, " ");
    if (state.bulk.trim) next = next.trim();
    if (next && next !== node.name) {
      node.name = next;
      changed += 1;
    }
  }
  saveState();
  render();
  toast(t("toast.renamedNodes", { count: changed }), changed ? "good" : "warn");
}

function fillPorts() {
  const start = Number(state.bulk.portStart);
  const targets = bulkCandidates();
  if (!Number.isInteger(start) || start < 1 || start + targets.length - 1 > 65535) {
    toast(t("toast.invalidPortStart"), "bad");
    return;
  }
  targets.forEach((node, index) => {
    node.listenerPort = start + index;
  });
  saveState();
  render();
  toast(t("toast.filledPorts", { count: targets.length }), "good");
}

function clearPorts() {
  const targets = bulkCandidates();
  targets.forEach((node) => {
    node.listenerPort = "";
  });
  saveState();
  render();
  toast(t("toast.clearedPorts", { count: targets.length }), "good");
}

function matchFilterDraft(nodes) {
  return matchFilterGroup(state.newFilter, nodes);
}

function matchFilterGroup(group, nodes) {
  let include = null;
  let exclude = null;
  try {
    include = compileRegex(group.include);
    exclude = compileRegex(group.exclude);
  } catch {
    return [];
  }
  return nodes.filter((node) => {
    if (group.source && group.source !== "all" && node.sourceId !== group.source) return false;
    const haystack = `${node.name} ${node.originName || ""} ${node.sourceName || ""} ${node.sourceTag || ""}`;
    if (include && !include.test(haystack)) return false;
    if (exclude && exclude.test(haystack)) return false;
    return true;
  });
}

function addFilter() {
  const nodes = getActiveNodes();
  const name = state.newFilter.name.trim() || `筛选组 ${state.filterGroups.length + 1}`;
  const matches = matchFilterDraft(nodes);
  if (!matches.length) {
    toast(t("toast.noFilterMatches"), "warn");
  }
  state.filterGroups.push({
    id: uid("filter"),
    name,
    source: state.newFilter.source,
    include: state.newFilter.include,
    exclude: state.newFilter.exclude,
    type: state.newFilter.type,
    enabled: true
  });
  state.newFilter = { name: "", source: "all", include: "", exclude: "", type: "select" };
  saveState();
  render();
}

function removeFilter(id) {
  state.filterGroups = state.filterGroups.filter((group) => group.id !== id);
  saveState();
  render();
}

function addChain() {
  const entry = state.nodes.find((node) => node.id === state.newChain.entry);
  const exit = state.nodes.find((node) => node.id === state.newChain.exit);
  if (!entry || !exit || entry.id === exit.id) {
    toast(t("toast.needDifferentChainNodes"), "bad");
    return;
  }
  state.chainGroups.push({
    id: uid("chain"),
    name: state.newChain.name.trim() || `${entry.name} -> ${exit.name}`,
    entry: entry.id,
    exit: exit.id,
    enabled: true
  });
  state.newChain = { name: "", entry: "", exit: "" };
  saveState();
  render();
}

function removeChain(id) {
  state.chainGroups = state.chainGroups.filter((group) => group.id !== id);
  saveState();
  render();
}

function addDnsPolicy() {
  const domain = String(state.newDnsPolicy.domain || "").trim();
  const server = String(state.newDnsPolicy.server || "").trim();
  if (!domain || !server) {
    toast(t("toast.invalidDnsPolicy"), "bad");
    return;
  }
  state.dnsPolicies.push({
    id: uid("dns"),
    domain,
    server
  });
  state.newDnsPolicy = { domain: "", server: "" };
  saveState();
  render();
  toast(t("toast.dnsPolicyAdded"), "good");
}

function removeDnsPolicy(id) {
  state.dnsPolicies = state.dnsPolicies.filter((policy) => policy.id !== id);
  saveState();
  render();
}

function getRuleTargets() {
  const moduleGroups = MODULES.map((module) => module.name);
  return unique(["节点选择", "DIRECT", "REJECT", ...moduleGroups, ...state.filterGroups.map((group) => group.name), ...state.chainGroups.map((group) => group.name)]);
}

function importRules() {
  const lines = state.ruleInput.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  let added = 0;
  for (const raw of lines) {
    const parsed = normalizeRuleLine(raw, state.ruleTarget);
    if (!parsed) continue;
    if (state.customRules.some((rule) => rule.line === parsed)) continue;
    state.customRules.push({ id: uid("rule"), line: parsed });
    added += 1;
  }
  state.ruleInput = "";
  saveState();
  render();
  toast(t("toast.importedRules", { count: added }), added ? "good" : "warn");
}

function normalizeRuleLine(line, fallbackTarget) {
  const parts = line.split(",").map((part) => part.trim()).filter(Boolean);
  const knownTypes = new Set(["DOMAIN", "DOMAIN-SUFFIX", "DOMAIN-KEYWORD", "IP-CIDR", "IP-CIDR6", "GEOIP", "GEOSITE", "PROCESS-NAME", "DST-PORT", "SRC-PORT", "RULE-SET"]);
  if (parts.length === 1) return `DOMAIN-SUFFIX,${parts[0]},${fallbackTarget}`;
  if (parts.length === 2 && knownTypes.has(parts[0].toUpperCase())) return `${parts[0].toUpperCase()},${parts[1]},${fallbackTarget}`;
  if (knownTypes.has(parts[0].toUpperCase())) return [parts[0].toUpperCase(), ...parts.slice(1)].join(",");
  return `DOMAIN-SUFFIX,${parts[0]},${parts[1] || fallbackTarget}`;
}

function removeRule(id) {
  state.customRules = state.customRules.filter((rule) => rule.id !== id);
  saveState();
  render();
}

function resetDns() {
  state.dnsYaml = DEFAULT_DNS;
  saveState();
  render();
}

function generateAndRender() {
  const preflight = validateBeforeGenerate();
  if (preflight.errors.length) {
    state.validation = preflight;
    saveState();
    render();
    toast(t("toast.fixErrors"), "bad");
    return;
  }

  const yaml = generateConfig();
  const generated = validateGeneratedYamlText(yaml);
  const validation = {
    errors: generated.errors,
    warnings: [...preflight.warnings, ...generated.warnings]
  };
  if (validation.errors.length) {
    state.validation = validation;
    saveState();
    render();
    toast(t("toast.generatedBlocked"), "bad");
    return;
  }

  state.preview = yaml;
  state.validation = validation;
  state.lastGeneratedAt = new Date().toLocaleString(localeCode(), { hour12: false });
  saveState();
  render();
  toast(validation.warnings.length ? t("toast.generatedWarn") : t("toast.generated"), validation.warnings.length ? "warn" : "good");
}

function validateBeforeGenerate() {
  const errors = [];
  const warnings = [];
  const activeNodes = getActiveNodes();
  const providers = getProviderSources();

  if (!activeNodes.length && !providers.length) {
    errors.push(t("validation.needNode"));
  }

  const usedPorts = new Map();
  validatePort("mixed-port", state.base.mixedPort, true, errors, usedPorts);
  validatePort("socks-port", state.base.socksPort, false, errors, usedPorts);
  validatePort("redir-port", state.base.redirPort, false, errors, usedPorts);

  if (!["rule", "global", "direct"].includes(state.base.mode || "rule")) {
    errors.push(t("validation.mode"));
  }

  if (!isHttpUrl(state.base.testUrl)) {
    errors.push(t("validation.testUrl"));
  }

  if (!Number.isInteger(Number(state.base.testInterval)) || Number(state.base.testInterval) < 30) {
    errors.push(t("validation.testInterval"));
  }

  for (const node of activeNodes) {
    validateNode(node, errors, warnings);
    validatePort(localText(`节点「${node.name}」监听端口`, `Node "${node.name}" listener port`), node.listenerPort, false, errors, usedPorts);
  }

  for (const source of providers) {
    if (!isHttpUrl(providerUrl(source))) {
      errors.push(t("validation.providerUrl", { name: source.name || source.id }));
    }
  }

  for (const group of state.filterGroups) {
    validateRegex(localText(`筛选组「${group.name}」包含正则`, `Filter group "${group.name}" include regex`), group.include, errors);
    validateRegex(localText(`筛选组「${group.name}」排除正则`, `Filter group "${group.name}" exclude regex`), group.exclude, errors);
  }

  for (const rule of state.customRules) {
    if (!isValidRuleLine(rule.line)) {
      errors.push(localText(`自定义规则格式不正确：${rule.line}`, `Custom rule has invalid syntax: ${rule.line}`));
    }
  }

  const dnsErrors = validateDnsYaml(state.dnsYaml);
  errors.push(...dnsErrors);

  const names = activeNodes.map((node) => node.name).filter(Boolean);
  if (new Set(names).size !== names.length) {
    warnings.push(t("validation.duplicateNames"));
  }

  return { errors, warnings };
}

function validatePort(label, value, required, errors, usedPorts) {
  if (value === "" || value === undefined || value === null) {
    if (required) errors.push(t("validation.portRequired", { label }));
    return;
  }
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    errors.push(t("validation.portInteger", { label }));
    return;
  }
  const owner = usedPorts.get(port);
  if (owner) {
    errors.push(t("validation.portDuplicate", { label, owner, port }));
    return;
  }
  usedPorts.set(port, label);
}

function validateRegex(label, pattern, errors) {
  if (!pattern) return;
  try {
    new RegExp(pattern, "i");
  } catch {
    errors.push(t("validation.invalidRegex", { label }));
  }
}

function isHttpUrl(value) {
  try {
    const url = new URL(String(value || "").trim());
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function validateNode(node, errors, warnings) {
  const label = node.name || node.originName || node.id;
  if (!node.name) errors.push(t("validation.nodeUnnamed"));
  if (!node.type) errors.push(t("validation.nodeMissingType", { label }));

  if (node.fromYaml) {
    if (!node.name || !node.type) errors.push(t("validation.yamlNodeMissing", { label }));
    return;
  }

  if (!node.server) errors.push(t("validation.nodeMissingServer", { label }));
  if (!Number.isInteger(Number(node.port)) || Number(node.port) < 1 || Number(node.port) > 65535) {
    errors.push(t("validation.nodeInvalidPort", { label }));
  }

  const requiredByType = {
    ss: ["cipher", "password"],
    ssr: ["cipher", "password", "protocol", "obfs"],
    vmess: ["uuid"],
    vless: ["uuid"],
    trojan: ["password"],
    hysteria2: ["password"],
    tuic: ["uuid", "password"],
    anytls: ["password"]
  };

  for (const field of requiredByType[node.type] || []) {
    if (!node[field]) errors.push(t("validation.nodeMissingField", { label, field }));
  }

  if (!requiredByType[node.type] && !["socks5"].includes(node.type)) {
    warnings.push(t("validation.nodeUnsupported", { label, type: node.type }));
  }
}

function validateDnsYaml(text) {
  const errors = [];
  const value = String(text || "").trim();
  if (!value) return [t("validation.dnsEmpty")];
  if (!/^dns\s*:/m.test(value)) errors.push(t("validation.dnsRoot"));
  if (/\t/.test(value)) errors.push(t("validation.dnsTab"));
  if (/\bundefined\b|\bNaN\b/.test(value)) errors.push(t("validation.dnsUndefined"));

  const quoteErrors = value.split(/\r?\n/).some((line) => {
    const stripped = line.replace(/\\["']/g, "");
    return (stripped.match(/"/g) || []).length % 2 || (stripped.match(/'/g) || []).length % 2;
  });
  if (quoteErrors) errors.push(t("validation.dnsQuote"));

  const topLevel = value.split(/\r?\n/).filter((line) => /^[^\s#][^:]*:\s*/.test(line)).map((line) => line.split(":")[0].trim());
  const unexpected = topLevel.filter((key) => key !== "dns");
  if (unexpected.length) {
    errors.push(t("validation.dnsTopKeys", { keys: unique(unexpected).join(getLang() === "en" ? ", " : "、") }));
  }

  value.split(/\r?\n/).forEach((line, index) => {
    if (!line.trim() || line.trim().startsWith("#")) return;
    const indent = line.match(/^\s*/)[0].length;
    if (indent % 2 !== 0) errors.push(t("validation.dnsIndent", { line: index + 1 }));
  });

  return unique(errors);
}

function isValidRuleLine(line) {
  const value = String(line || "").trim();
  if (!value) return false;
  const parts = value.split(",").map((part) => part.trim());
  const knownTypes = new Set(["DOMAIN", "DOMAIN-SUFFIX", "DOMAIN-KEYWORD", "IP-CIDR", "IP-CIDR6", "GEOIP", "GEOSITE", "PROCESS-NAME", "DST-PORT", "SRC-PORT", "RULE-SET", "MATCH"]);
  if (!knownTypes.has(parts[0])) return false;
  if (parts[0] === "MATCH") return parts.length === 2 && !!parts[1];
  return parts.length >= 3 && parts[1] && parts[2];
}

function validateGeneratedYamlText(yaml) {
  const errors = [];
  const warnings = [];
  if (/\bundefined\b|\bNaN\b/.test(yaml)) errors.push(t("validation.generatedUndefined"));
  for (const section of ["proxies:", "proxy-groups:", "rules:"]) {
    if (!yaml.includes(section)) errors.push(t("validation.generatedMissing", { section }));
  }
  if (/port:\s*0\b/.test(yaml)) errors.push(t("validation.generatedZeroPort"));

  const topKeys = yaml.split(/\r?\n/)
    .filter((line) => /^[A-Za-z][A-Za-z0-9-]*:\s*/.test(line))
    .map((line) => line.split(":")[0]);
  const duplicates = topKeys.filter((key, index) => topKeys.indexOf(key) !== index);
  if (duplicates.length) errors.push(t("validation.generatedDuplicateTop", { keys: unique(duplicates).join(getLang() === "en" ? ", " : "、") }));

  if (!yaml.includes("MATCH,")) warnings.push(t("validation.noMatch"));
  return { errors: unique(errors), warnings: unique(warnings) };
}

function buildDnsYaml() {
  const base = (state.dnsYaml || DEFAULT_DNS).trimEnd();
  const policies = normalizedDnsPolicies();
  if (!policies.length) return base;
  return insertDnsPolicies(base, policies);
}

function normalizedDnsPolicies() {
  const result = new Map();
  for (const policy of state.dnsPolicies || []) {
    const domain = String(policy.domain || "").trim();
    const server = String(policy.server || "").trim();
    if (!domain || !server) continue;
    result.set(domain, server);
  }
  return [...result.entries()].map(([domain, server]) => ({ domain, server }));
}

function insertDnsPolicies(base, policies) {
  const entries = policies.map((policy) => `    ${yamlScalar(policy.domain)}: ${yamlScalar(policy.server)}`);
  const lines = base.split(/\r?\n/);
  const policyIndex = lines.findIndex((line) => /^ {2}nameserver-policy\s*:\s*$/.test(line));
  if (policyIndex >= 0) {
    let insertIndex = lines.length;
    for (let index = policyIndex + 1; index < lines.length; index += 1) {
      if (/^ {2}\S/.test(lines[index]) && !/^ {4}/.test(lines[index])) {
        insertIndex = index;
        break;
      }
    }
    lines.splice(insertIndex, 0, ...entries);
    return lines.join("\n");
  }
  return `${base}\n  nameserver-policy:\n${entries.join("\n")}`;
}

function generateConfig() {
  const activeNodes = ensureUniqueNodeNames(getActiveNodes());
  const providers = getProviderSources();
  const providerNames = providers.map(providerName);
  const proxyProviders = Object.fromEntries(providers.map((source) => [
    providerName(source),
    {
      type: "http",
      url: providerUrl(source),
      interval: Number(state.base.providerInterval) || 86400,
      "health-check": {
        enable: true,
        interval: Number(state.base.testInterval) || 300,
        url: state.base.testUrl || "https://www.gstatic.com/generate_204"
      }
    }
  ]));

  const enabledModules = getEnabledModules();
  const ruleProviders = buildRuleProviders(enabledModules);
  const { groups } = buildProxyGroups(activeNodes, providers);
  const config = {
    "mixed-port": Number(state.base.mixedPort) || 7890,
    "allow-lan": !!state.base.allowLan,
    mode: state.base.mode || "rule",
    "log-level": "info",
    ipv6: !!state.base.ipv6,
    "find-process-mode": "strict",
    "global-client-fingerprint": "chrome"
  };

  if (state.base.socksPort) config["socks-port"] = Number(state.base.socksPort);
  if (state.base.redirPort) config["redir-port"] = Number(state.base.redirPort);

  const listeners = activeNodes
    .filter((node) => Number(node.listenerPort))
    .map((node) => ({
      name: `listener-${node.name}`,
      type: "mixed",
      port: Number(node.listenerPort),
      listen: "0.0.0.0",
      proxy: node.name
    }));

  const rules = buildRules();
  const yamlParts = [
    "# Generated by subpanel",
    toYaml(config).trim(),
    "",
    buildDnsYaml(),
    "",
    proxyProviders && Object.keys(proxyProviders).length ? `proxy-providers:\n${toYaml(proxyProviders, 2).trimEnd()}` : "",
    activeNodes.length ? `proxies:\n${toYaml(activeNodes.map(nodeToProxy), 2).trimEnd()}` : "proxies: []",
    Object.keys(ruleProviders).length ? `rule-providers:\n${toYaml(ruleProviders, 2).trimEnd()}` : "",
    `proxy-groups:\n${toYaml(groups, 2).trimEnd()}`,
    listeners.length ? `listeners:\n${toYaml(listeners, 2).trimEnd()}` : "",
    `rules:\n${rules.map((rule) => `  - ${rule}`).join("\n")}`
  ];

  return yamlParts.filter((part) => part !== "").join("\n\n") + "\n";
}

function ensureUniqueNodeNames(nodes) {
  const used = new Map();
  return nodes.map((node) => {
    const baseName = node.name || node.originName || node.server || node.id;
    const count = used.get(baseName) || 0;
    used.set(baseName, count + 1);
    return {
      ...node,
      name: count ? `${baseName} (${count + 1})` : baseName
    };
  });
}

function getPolicyGroups() {
  return getEnabledModules()
    .filter((module) => !["select", "auto"].includes(module.id))
    .map((module) => module.name);
}

function getGroupPolicy(group) {
  const value = state.groupPolicies?.[group];
  if (policyOptionsForGroup(group).some((option) => option.value === value)) return value;
  const module = moduleByName(group);
  if (module?.groupType === "reject-first") return "reject";
  if (module?.groupType === "direct-first") return "direct";
  return "proxy";
}

function policyOptionsForGroup(group) {
  const module = moduleByName(group);
  if (module?.groupType === "reject-first") {
    return [
      { value: "reject", label: policyLabel("reject") },
      { value: "proxy", label: policyLabel("proxy") },
      { value: "direct", label: policyLabel("direct") }
    ];
  }
  return [
    { value: "proxy", label: policyLabel("proxy") },
    { value: "direct", label: policyLabel("direct") }
  ];
}

function summarizePolicies(groups) {
  const direct = groups.filter((group) => getGroupPolicy(group) === "direct").length;
  const reject = groups.filter((group) => getGroupPolicy(group) === "reject").length;
  return [
    `${groups.length - direct - reject} ${policyLabel("proxy")}`,
    direct ? `${direct} ${policyLabel("direct")}` : "",
    reject ? `${reject} ${policyLabel("reject")}` : ""
  ].filter(Boolean).join(" · ");
}

function getEnabledModules() {
  return MODULES.filter((module) => state.modules[module.id] !== false);
}

function moduleByName(name) {
  return MODULES.find((module) => module.name === name);
}

function isSubscriptionInfoName(name) {
  const value = String(name || "").trim();
  return /^(剩余流量|距离下次重置剩余|套餐到期)\s*[:：]/.test(value) || /(版本太旧|请更新|更新软件|去官网更新)/.test(value);
}

function uniqueDefined(...items) {
  return unique(items.flat().filter((item) => typeof item === "string" && item.trim()));
}

function buildProxyGroups(activeNodes, providers) {
  const nodeNames = activeNodes.map((node) => node.name);
  const testNodeNames = nodeNames.filter((name) => !isSubscriptionInfoName(name));
  const providerNames = providers.map(providerName);
  const providerUse = providerNames.length ? { use: providerNames } : {};
  const testUrl = state.base.testUrl || "https://www.gstatic.com/generate_204";
  const interval = Number(state.base.testInterval) || 300;
  const enabledIds = new Set(getEnabledModules().map((module) => module.id));

  const filterGroups = state.filterGroups
    .filter((group) => group.enabled !== false)
    .map((group) => {
      const matches = matchFilterGroup(group, activeNodes).map((node) => node.name);
      return {
        name: group.name,
        type: group.type || "select",
        proxies: matches.length ? matches : ["DIRECT"],
        url: ["url-test", "fallback", "load-balance"].includes(group.type) ? testUrl : undefined,
        interval: ["url-test", "fallback", "load-balance"].includes(group.type) ? interval : undefined
      };
    });

  const chainGroups = state.chainGroups
    .filter((group) => group.enabled !== false)
    .map((group) => {
      const entry = activeNodes.find((node) => node.id === group.entry);
      const exit = activeNodes.find((node) => node.id === group.exit);
      if (!entry || !exit) return null;
      return { name: group.name, type: "relay", proxies: [entry.name, exit.name] };
    })
    .filter(Boolean);

  const customNames = [...filterGroups, ...chainGroups].map((group) => group.name);
  const selectName = MODULE_BY_ID.get("select")?.name || "节点选择";
  const autoName = MODULE_BY_ID.get("auto")?.name || "自动选择";
  const selectionOptions = uniqueDefined(autoName, "DIRECT", "REJECT", customNames, nodeNames);
  const serviceOptions = uniqueDefined(selectName, autoName, "DIRECT", "REJECT", customNames, testNodeNames);
  const directOptions = uniqueDefined("DIRECT", "REJECT", customNames, selectName, autoName, testNodeNames);
  const rejectOptions = uniqueDefined("REJECT", "DIRECT", selectName);
  const groups = [];

  const groupForModule = (module) => {
    const name = module.name;
    const policy = getGroupPolicy(name);
    if (module.id === "select") {
      return { name, type: "select", proxies: selectionOptions, ...providerUse };
    }
    if (module.groupType === "url-test") {
      return { name, type: "url-test", proxies: testNodeNames, url: testUrl, interval, tolerance: 50, lazy: false, ...providerUse };
    }
    if (policy === "reject") {
      return { name, type: "select", proxies: rejectOptions.filter((item) => item !== name), ...providerUse };
    }
    if (policy === "direct") {
      return { name, type: "select", proxies: directOptions.filter((item) => item !== name), ...providerUse };
    }
    return { name, type: "select", proxies: serviceOptions.filter((item) => item !== name), ...providerUse };
  };

  for (const id of PROXY_GROUP_ORDER) {
    if (!enabledIds.has(id)) continue;
    const module = MODULE_BY_ID.get(id);
    if (module) groups.push(groupForModule(module));
    if (id === "global") groups.push(...filterGroups, ...chainGroups);
  }

  for (const module of MODULES) {
    if (!enabledIds.has(module.id) || PROXY_GROUP_ORDER.includes(module.id)) continue;
    groups.push(groupForModule(module));
  }

  if (!groups.some((group) => filterGroups.includes(group) || chainGroups.includes(group))) {
    groups.push(...filterGroups, ...chainGroups);
  }
  return { groups };
}

function buildRules() {
  const enabledModules = getEnabledModules();
  const enabledIds = new Set(enabledModules.map((module) => module.id));
  const rules = [];
  const pushModuleRules = (module) => {
    for (const rule of module.rules) {
      rules.push(ruleLineForModule(module, rule));
    }
  };

  for (const id of RULE_ORDER) {
    const module = MODULE_BY_ID.get(id);
    if (module && enabledIds.has(module.id)) pushModuleRules(module);
  }

  for (const module of enabledModules) {
    if (RULE_ORDER.includes(module.id) || module.id === "final") continue;
    pushModuleRules(module);
  }

  rules.push(...state.customRules.map((rule) => rule.line));
  if (enabledIds.has("cn")) rules.push(`RULE-SET,cn,${MODULE_BY_ID.get("cn")?.name || "国内服务"}`);
  rules.push(`MATCH,${enabledIds.has("final") ? MODULE_BY_ID.get("final").name : MODULE_BY_ID.get("select").name}`);
  return unique(rules);
}

function ruleLineForModule(module, rule) {
  const noResolve = !!rule.noResolve;
  return `RULE-SET,${rule.id},${module.name}${noResolve ? ",no-resolve" : ""}`;
}

function buildRuleProviders(enabledModules) {
  const providers = {};
  for (const module of enabledModules) {
    for (const rule of module.rules) {
      providers[rule.id] = ruleProvider(rule);
    }
  }
  if (enabledModules.some((module) => module.id === "cn") && !providers.cn) {
    providers.cn = ruleProvider({ id: "cn", behavior: "domain", path: "geosite/cn.mrs" });
  }
  return providers;
}

function ruleProvider(rule) {
  return {
    type: "http",
    behavior: rule.behavior,
    url: `${RULE_PROVIDER_BASE_URL}/${rule.path}`,
    path: `./ruleset/${rule.id}.mrs`,
    interval: 86400,
    format: "mrs"
  };
}

function nodeToProxy(node) {
  if (node.fromYaml) {
    const proxy = { ...node };
    delete proxy.id;
    delete proxy.originName;
    delete proxy.sourceId;
    delete proxy.sourceName;
    delete proxy.sourceTag;
    delete proxy.enabled;
    delete proxy.listenerPort;
    delete proxy.importedAt;
    delete proxy.fromYaml;
    delete proxy.raw;
    return proxy;
  }

  const base = {
    name: node.name,
    type: node.type,
    server: node.server,
    port: Number(node.port)
  };

  if (node.type === "ss") {
    Object.assign(base, {
      cipher: node.cipher,
      password: node.password,
      udp: true
    });
    if (node.plugin) base.plugin = node.plugin;
  } else if (node.type === "ssr") {
    Object.assign(base, {
      cipher: node.cipher,
      password: node.password,
      protocol: node.protocol,
      obfs: node.obfs,
      udp: true
    });
    if (node.protocolParam) base["protocol-param"] = node.protocolParam;
    if (node.obfsParam) base["obfs-param"] = node.obfsParam;
  } else if (node.type === "vmess") {
    Object.assign(base, {
      uuid: node.uuid,
      alterId: Number(node.alterId || 0),
      cipher: node.cipher || "auto",
      udp: true,
      tls: !!node.tls,
      network: node.network || "tcp"
    });
    addTransport(base, node);
  } else if (node.type === "vless") {
    Object.assign(base, {
      uuid: node.uuid,
      udp: true,
      tls: !!node.tls,
      network: node.network || "tcp"
    });
    if (node.flow) base.flow = node.flow;
    if (node.clientFingerprint) base["client-fingerprint"] = node.clientFingerprint;
    if (node.realityPublicKey) {
      base["reality-opts"] = {
        "public-key": node.realityPublicKey,
        "short-id": node.realityShortId || ""
      };
    }
    addTransport(base, node);
  } else if (node.type === "trojan") {
    Object.assign(base, {
      password: node.password,
      udp: true,
      tls: node.tls !== false,
      network: node.network || "tcp"
    });
    addTransport(base, node);
  } else if (node.type === "hysteria2") {
    Object.assign(base, {
      password: node.password,
      sni: node.sni || undefined,
      "skip-cert-verify": !!node.skipCertVerify
    });
    if (node.obfs) base.obfs = node.obfs;
    if (node.obfsPassword) base["obfs-password"] = node.obfsPassword;
  } else if (node.type === "tuic") {
    Object.assign(base, {
      uuid: node.uuid,
      password: node.password,
      sni: node.sni || undefined,
      "congestion-controller": node.congestionController || "bbr",
      "udp-relay-mode": node.udpRelayMode || "native",
      "skip-cert-verify": !!node.skipCertVerify
    });
  } else if (node.type === "anytls") {
    Object.assign(base, {
      password: node.password,
      sni: node.sni || undefined,
      "skip-cert-verify": !!node.skipCertVerify
    });
  } else if (node.type === "socks5") {
    Object.assign(base, {
      username: node.username || undefined,
      password: node.password || undefined
    });
  }

  return removeEmpty(base);
}

function addTransport(base, node) {
  if (node.servername) base.servername = node.servername;
  if (node.network === "ws" && (node.wsPath || node.wsHost)) {
    base["ws-opts"] = {
      path: node.wsPath || "/",
      headers: node.wsHost ? { Host: node.wsHost } : undefined
    };
  }
  if (node.network === "grpc" && node.grpcServiceName) {
    base["grpc-opts"] = { "grpc-service-name": node.grpcServiceName };
  }
}

function removeEmpty(value) {
  if (Array.isArray(value)) return value.map(removeEmpty);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value)
      .map(([key, item]) => [key, removeEmpty(item)])
      .filter(([, item]) => item !== undefined && item !== "" && !(item && typeof item === "object" && !Array.isArray(item) && Object.keys(item).length === 0)));
  }
  return value;
}

function toYaml(value, indent = 0) {
  const space = " ".repeat(indent);
  if (Array.isArray(value)) {
    if (!value.length) return `${space}[]\n`;
    return value.map((item) => {
      if (item && typeof item === "object" && !Array.isArray(item)) {
        const entries = Object.entries(removeEmpty(item));
        if (!entries.length) return `${space}- {}\n`;
        const [firstKey, firstValue] = entries[0];
        let output = `${space}- ${firstKey}:`;
        if (isScalar(firstValue)) output += ` ${yamlScalar(firstValue)}\n`;
        else output += `\n${toYaml(firstValue, indent + 4)}`;
        for (const [key, child] of entries.slice(1)) {
          output += `${space}  ${key}:`;
          if (isScalar(child)) output += ` ${yamlScalar(child)}\n`;
          else output += `\n${toYaml(child, indent + 4)}`;
        }
        return output;
      }
      return `${space}- ${yamlScalar(item)}\n`;
    }).join("");
  }

  if (value && typeof value === "object") {
    return Object.entries(removeEmpty(value)).map(([key, item]) => {
      if (isScalar(item)) return `${space}${key}: ${yamlScalar(item)}\n`;
      return `${space}${key}:\n${toYaml(item, indent + 2)}`;
    }).join("");
  }

  return `${space}${yamlScalar(value)}\n`;
}

function isScalar(value) {
  return value === null || ["string", "number", "boolean"].includes(typeof value);
}

function yamlScalar(value) {
  if (value === null) return "null";
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  const text = String(value);
  if (text === "") return "\"\"";
  return JSON.stringify(text);
}

async function copyYaml() {
  const yaml = state.preview || generateConfig();
  await navigator.clipboard.writeText(yaml);
  toast(t("toast.copied"), "good");
}

function downloadYaml() {
  const yaml = state.preview || generateConfig();
  const date = new Date().toISOString().slice(0, 10);
  downloadFile(`${safeYamlName(state.profileName)}-${date}.yaml`, yaml, "application/x-yaml;charset=utf-8");
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function setPreviewTab(tab) {
  state.previewTab = tab || "yaml";
  saveState();
  render();
}

function unique(items) {
  const seen = new Set();
  const result = [];
  for (const item of items) {
    if (item === undefined || item === null || item === "") continue;
    if (seen.has(item)) continue;
    seen.add(item);
    result.push(item);
  }
  return result;
}

function toast(message, type = "") {
  const stack = document.querySelector("#toast-stack");
  if (!stack) return;
  const item = document.createElement("div");
  item.className = `toast ${type}`;
  item.textContent = message;
  stack.appendChild(item);
  setTimeout(() => item.remove(), 3200);
}

window.matchMedia?.("(prefers-color-scheme: dark)")?.addEventListener?.("change", () => {
  if ((state.ui?.theme || "system") === "system") applyPreferences();
});

render();
attachEvents();
