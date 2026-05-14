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
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>'
};

let state = loadState();

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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
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
  merged.sources = Array.isArray(saved.sources) && saved.sources.length ? saved.sources : base.sources;
  merged.nodes = Array.isArray(saved.nodes) ? saved.nodes : [];
  merged.deletedNodes = Array.isArray(saved.deletedNodes) ? saved.deletedNodes : [];
  merged.customRules = Array.isArray(saved.customRules) ? saved.customRules : [];
  merged.filterGroups = Array.isArray(saved.filterGroups) ? saved.filterGroups : [];
  merged.chainGroups = Array.isArray(saved.chainGroups) ? saved.chainGroups : [];
  if (typeof merged.preview === "string") {
    merged.preview = merged.preview.replace("# Generated by SubBoost Local", "# Generated by subpanel");
  }
  return merged;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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

function render() {
  const activeNodes = getActiveNodes();
  const providers = getProviderSources();
  const app = document.querySelector("#app");

  app.innerHTML = `
    <div class="app-shell">
      <header class="topbar">
        <div class="brand">
          <div class="brand-mark">SP</div>
          <div>
            <h1>subpanel</h1>
            <p>${activeNodes.length ? `${activeNodes.length} 个节点` : "Clash / Mihomo 配置生成器"} · ${escapeHtml(TEMPLATES[state.template]?.name || "日常")}</p>
          </div>
        </div>
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
            <strong>分流模板</strong>
            <span class="hint">${escapeHtml(TEMPLATES[state.template]?.description || "")}</span>
          </div>
          <div class="segmented">
            ${Object.entries(TEMPLATES).map(([id, template]) => `
              <button data-action="apply-template" data-template="${id}" class="${state.template === id ? "active" : ""}" title="${attr(template.description)}">${escapeHtml(template.name)}</button>
            `).join("")}
          </div>
        </div>
        ${renderRoutingPolicyPanel()}
        <div class="generate-strip">
          <div>
            <strong>${activeNodes.length || providers.length ? "可以生成配置" : "等待导入节点"}</strong>
            <span>${activeNodes.length} 节点 · ${providers.length} provider</span>
          </div>
          <button class="btn primary hero-action" data-action="generate">${icon("spark")}生成配置</button>
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
        <span>分流去向</span>
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
      <span>${escapeHtml(group)}</span>
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
            <h2>输入</h2>
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
          <span class="badge ${statusClass}">${escapeHtml(source.error || source.status || "未导入")}</span>
          <span class="badge">${count} 节点</span>
          ${source.userinfo ? `<span class="badge">${escapeHtml(source.userinfo)}</span>` : ""}
        </div>
        <div class="row source-actions">
          <button class="btn primary" data-action="import-source" data-id="${attr(source.id)}" title="${source.providerMode ? "保存 provider 源" : "解析此来源"}">${icon("refresh")}解析</button>
          ${canRemove ? `<button class="btn icon danger" data-action="remove-source" data-id="${attr(source.id)}" title="删除导入源">${icon("trash")}</button>` : ""}
        </div>
      </div>
      <textarea class="mono smart-input" data-source="${attr(source.id)}" data-source-field="content" placeholder="${attr(sourcePlaceholder())}">${escapeHtml(source.content)}</textarea>
      <div class="row between wrap">
        <details class="inline-details">
          <summary>高级导入选项</summary>
          <div class="source-meta">
            <label>名称
              <input data-source="${attr(source.id)}" data-source-field="name" value="${attr(source.name)}" placeholder="导入源名称">
            </label>
            <label>标签
              <input data-source="${attr(source.id)}" data-source-field="tag" value="${attr(source.tag)}" placeholder="例：机场 A">
            </label>
          </div>
          <div class="source-meta">
            <label>命名模板
              <input data-source="${attr(source.id)}" data-source-field="nameTemplate" value="${attr(source.nameTemplate)}" placeholder="{tag}{name}">
            </label>
            <label>User-Agent
              <input data-source="${attr(source.id)}" data-source-field="userAgent" value="${attr(source.userAgent)}">
            </label>
          </div>
          <label class="checkline">
            <input type="checkbox" data-source="${attr(source.id)}" data-source-field="providerMode" ${source.providerMode ? "checked" : ""}>
            使用 proxy-providers
          </label>
          ${source.userinfo ? `<span class="hint">${escapeHtml(source.userinfo)}</span>` : ""}
          <span class="hint">命名占位符：{name}、{tag}、{type}、{index}</span>
        </details>
      </div>
    </div>
  `;
}

function sourcePlaceholder() {
  return "粘贴订阅链接或节点链接，一行一个；也可粘贴完整 Clash / Mihomo YAML";
}

function sourcePanelStatus() {
  const count = getActiveNodes().length;
  if (count) return `${count} 个节点`;
  return "粘贴后解析";
}

function renderNodesPanel() {
  const activeNodes = getActiveNodes();
  const deleted = state.deletedNodes;
  return renderAdvancedCard({
    id: "nodes",
    icon: icon("spark"),
    title: "节点管理",
    subtitle: "改名、停用、监听端口和批量处理",
    badge: `${activeNodes.length}/${state.nodes.length}`,
    body: `
      <div class="row between wrap advanced-toolbar">
        <span class="hint">日常只需要导入和生成；需要精修节点名或端口时再打开这里。</span>
        <button class="btn" data-action="clear-nodes">${icon("trash")}清空节点</button>
      </div>
      <details class="subdetails">
        <summary>批量重命名与端口</summary>
        ${renderBulkTools()}
      </details>
      ${state.nodes.length ? renderNodeTable() : `<div class="empty">先在左侧导入订阅、YAML 或节点链接。</div>`}
      ${deleted.length ? `
        <div class="item-list">
          <div class="row between">
            <strong>已删除节点</strong>
            <button class="btn" data-action="restore-all">全部恢复</button>
          </div>
          ${deleted.slice(0, 12).map((node) => `
            <div class="deleted-item row between">
              <span class="muted">${escapeHtml(node.name)}</span>
              <button class="btn" data-action="restore-node" data-id="${attr(node.id)}">恢复</button>
            </div>
          `).join("")}
          ${deleted.length > 12 ? `<span class="hint">还有 ${deleted.length - 12} 个已删除节点。</span>` : ""}
        </div>
      ` : ""}
    `
  });
}

function renderBulkTools() {
  return `
    <div class="source-item">
      <div class="grid-2">
        <label>筛选包含正则
          <input data-bulk="include" value="${attr(state.bulk.include)}" placeholder="例：HK|Japan|专线">
        </label>
        <label>筛选排除正则
          <input data-bulk="exclude" value="${attr(state.bulk.exclude)}" placeholder="例：过期|测试">
        </label>
      </div>
      <div class="grid-2">
        <label>查找正则
          <input data-bulk="find" value="${attr(state.bulk.find)}" placeholder="例：\\s+\\|\\s+">
        </label>
        <label>替换为
          <input data-bulk="replace" value="${attr(state.bulk.replace)}" placeholder="例： - ">
        </label>
      </div>
      <div class="row wrap">
        ${renderCheck("bulk.trim", state.bulk.trim, "去除首尾空格")}
        ${renderCheck("bulk.normalizeSpaces", state.bulk.normalizeSpaces, "空白归一化")}
        <button class="btn primary" data-action="bulk-rename">${icon("spark")}批量重命名</button>
        <label style="width: 150px;">起始端口
          <input type="number" data-bulk="portStart" value="${attr(state.bulk.portStart)}">
        </label>
        <button class="btn" data-action="fill-ports">填充端口</button>
        <button class="btn" data-action="clear-ports">删除端口</button>
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
            <th>启用</th>
            <th>名称</th>
            <th>类型</th>
            <th>来源</th>
            <th>地址</th>
            <th>监听端口</th>
            <th>顺序</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          ${state.nodes.map((node, index) => `
            <tr>
              <td><input type="checkbox" data-node="${attr(node.id)}" data-node-field="enabled" ${node.enabled !== false ? "checked" : ""}></td>
              <td><input class="small node-name-input" data-node="${attr(node.id)}" data-node-field="name" value="${attr(node.name)}"></td>
              <td><span class="type-pill">${escapeHtml(node.type || "raw")}</span></td>
              <td class="muted">${escapeHtml(node.sourceName || "手动")}</td>
              <td class="muted">${escapeHtml(node.server || "-")}:${escapeHtml(node.port || "-")}</td>
              <td><input class="small" type="number" min="1" max="65535" data-node="${attr(node.id)}" data-node-field="listenerPort" value="${attr(node.listenerPort || "")}" placeholder="可空"></td>
              <td><input class="small" type="number" min="1" max="${state.nodes.length}" data-action="move-node" data-id="${attr(node.id)}" value="${index + 1}"></td>
              <td><button class="btn icon danger" data-action="delete-node" data-id="${attr(node.id)}" title="删除节点">${icon("trash")}</button></td>
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
    title: "代理组",
    subtitle: "筛选组、自动测速组与链式 relay",
    badge: `${state.filterGroups.length + state.chainGroups.length} 自定义`,
    body: `
        <div class="source-item">
          <div class="row between wrap">
            <strong>筛选代理组</strong>
            <span class="hint">按来源、地区关键词或正则创建独立分组。</span>
          </div>
          <div class="grid-2">
            <label>名称
              <input data-new-filter="name" value="${attr(state.newFilter.name)}" placeholder="例：香港自动">
            </label>
            <label>类型
              <select data-new-filter="type">
                ${["select", "url-test", "fallback", "load-balance"].map((type) => `<option value="${type}" ${state.newFilter.type === type ? "selected" : ""}>${type}</option>`).join("")}
              </select>
            </label>
          </div>
          <div class="grid-3">
            <label>来源
              <select data-new-filter="source">
                <option value="all">全部来源</option>
                ${state.sources.map((source) => `<option value="${attr(source.id)}" ${state.newFilter.source === source.id ? "selected" : ""}>${escapeHtml(source.name)}</option>`).join("")}
              </select>
            </label>
            <label>包含正则
              <input data-new-filter="include" value="${attr(state.newFilter.include)}" placeholder="HK|Hong Kong|香港">
            </label>
            <label>排除正则
              <input data-new-filter="exclude" value="${attr(state.newFilter.exclude)}" placeholder="倍率|过期">
            </label>
          </div>
          <div class="row between wrap">
            <span class="hint">当前命中 ${matchFilterDraft(nodes).length} 个节点</span>
            <button class="btn primary" data-action="add-filter">${icon("plus")}添加筛选组</button>
          </div>
        </div>
        <div class="item-list">
          ${state.filterGroups.length ? state.filterGroups.map((group) => renderFilterGroup(group, nodes)).join("") : `<div class="empty">暂无筛选组。</div>`}
        </div>
        <div class="split-line"></div>
        <div class="source-item">
          <div class="row between wrap">
            <strong>链式代理组</strong>
            <span class="hint">生成 Mihomo relay 组：入口节点到落地节点。</span>
          </div>
          <div class="grid-3">
            <label>名称
              <input data-new-chain="name" value="${attr(state.newChain.name)}" placeholder="例：HK 到 US">
            </label>
            <label>入口节点
              <select data-new-chain="entry">
                <option value="">选择节点</option>
                ${nodes.map((node) => `<option value="${attr(node.id)}" ${state.newChain.entry === node.id ? "selected" : ""}>${escapeHtml(node.name)}</option>`).join("")}
              </select>
            </label>
            <label>落地节点
              <select data-new-chain="exit">
                <option value="">选择节点</option>
                ${nodes.map((node) => `<option value="${attr(node.id)}" ${state.newChain.exit === node.id ? "selected" : ""}>${escapeHtml(node.name)}</option>`).join("")}
              </select>
            </label>
          </div>
          <div class="row between wrap">
            <span class="hint">relay 组通常需要客户端内核支持。</span>
            <button class="btn primary" data-action="add-chain">${icon("plus")}添加链式组</button>
          </div>
        </div>
        <div class="item-list">
          ${state.chainGroups.length ? state.chainGroups.map(renderChainGroup).join("") : `<div class="empty">暂无链式代理组。</div>`}
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
          <label class="switch" title="启用">
            <input type="checkbox" data-filter="${attr(group.id)}" data-filter-field="enabled" ${group.enabled !== false ? "checked" : ""}>
            <span></span>
          </label>
          <strong>${escapeHtml(group.name)}</strong>
          <span class="badge">${escapeHtml(group.type)}</span>
          <span class="badge good">${count} 节点</span>
        </div>
        <button class="btn icon danger" data-action="remove-filter" data-id="${attr(group.id)}">${icon("trash")}</button>
      </div>
      <div class="hint">包含：${escapeHtml(group.include || "全部")} · 排除：${escapeHtml(group.exclude || "无")}</div>
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
          <label class="switch" title="启用">
            <input type="checkbox" data-chain="${attr(group.id)}" data-chain-field="enabled" ${group.enabled !== false ? "checked" : ""}>
            <span></span>
          </label>
          <strong>${escapeHtml(group.name)}</strong>
          <span class="badge">relay</span>
        </div>
        <button class="btn icon danger" data-action="remove-chain" data-id="${attr(group.id)}">${icon("trash")}</button>
      </div>
      <div class="hint">入口：${escapeHtml(entry?.name || "未选择")} · 落地：${escapeHtml(exit?.name || "未选择")}</div>
    </div>
  `;
}

function renderRulesPanel() {
  const targets = getRuleTargets();
  const enabledModules = MODULES.filter((module) => state.modules[module.id] !== false).length;
  return renderAdvancedCard({
    id: "rules",
    icon: icon("eye"),
    title: "分流规则",
    subtitle: "内置模块默认够用，自定义规则按需添加",
    badge: `${enabledModules}/${MODULES.length}`,
    body: `
        <div class="modules-grid">
          ${MODULES.map(renderModule).join("")}
        </div>
        <div class="source-item">
          <div class="row between wrap">
            <strong>批量导入规则</strong>
            <span class="hint">缺少目标时使用右侧选择的目标。</span>
          </div>
          <div class="grid-2">
            <label>目标分组
              <select data-field="ruleTarget">
                ${targets.map((target) => `<option value="${attr(target)}" ${state.ruleTarget === target ? "selected" : ""}>${escapeHtml(target)}</option>`).join("")}
              </select>
            </label>
            <label>快速示例
              <input readonly value="DOMAIN-SUFFIX,example.com 或 github.com">
            </label>
          </div>
          <textarea class="mono" data-field="ruleInput" placeholder="DOMAIN-SUFFIX,example.com,节点选择&#10;IP-CIDR,1.1.1.0/24,节点选择,no-resolve&#10;github.com">${escapeHtml(state.ruleInput)}</textarea>
          <div class="row between wrap">
            <span class="hint">当前已有 ${state.customRules.length} 条自定义规则。</span>
            <button class="btn primary" data-action="import-rules">${icon("plus")}导入规则</button>
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
          <strong>${escapeHtml(module.name)}</strong>
          <div class="hint">${escapeHtml(module.category)} · ${module.rules.length} 条</div>
        </div>
        <label class="switch" title="启用 ${attr(module.name)}">
          <input type="checkbox" data-module="${attr(module.id)}" ${enabled ? "checked" : ""}>
          <span></span>
        </label>
      </div>
      <span class="badge">${escapeHtml(module.groupType)}</span>
    </div>
  `;
}

function renderPreviewPanel(activeNodes, providers) {
  const yaml = state.preview || "# 请先添加订阅或节点并点击生成配置\n";
  return `
    <section class="panel preview-panel" id="preview">
      <div class="panel-header">
        <div class="panel-title">
          ${icon("eye")}
          <div>
            <h2>配置预览</h2>
            <span>${state.lastGeneratedAt ? `生成于 ${escapeHtml(state.lastGeneratedAt)}` : "等待生成"}</span>
          </div>
        </div>
        <div class="preview-tools">
          <button class="btn" data-action="copy-yaml">${icon("copy")}复制</button>
          <button class="btn" data-action="download-yaml">${icon("download")}下载</button>
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
        <div class="visual-label">节点</div>
        <div class="chip-cloud">
          ${activeNodes.slice(0, 36).map((node) => `<span class="chip">${escapeHtml(node.name)}</span>`).join("") || `<span class="hint">暂无节点</span>`}
          ${activeNodes.length > 36 ? `<span class="badge">还有 ${activeNodes.length - 36} 个</span>` : ""}
        </div>
      </div>
      <div class="visual-row">
        <div class="visual-label">Provider</div>
        <div class="chip-cloud">
          ${providers.map((source) => `<span class="chip">${escapeHtml(providerName(source))}</span>`).join("") || `<span class="hint">暂无 provider 源</span>`}
        </div>
      </div>
      <div class="visual-row">
        <div class="visual-label">代理组</div>
        <div class="chip-cloud">
          ${groups.map((group) => `<span class="chip">${escapeHtml(group.name)} · ${escapeHtml(group.type)}</span>`).join("")}
        </div>
      </div>
      <div class="visual-row">
        <div class="visual-label">规则模块</div>
        <div class="chip-cloud">
          ${enabledModules.map((module) => `<span class="chip">${escapeHtml(module.name)}</span>`).join("")}
        </div>
      </div>
    </div>
  `;
}

function renderSystemPanel() {
  return renderAdvancedCard({
    id: "system",
    icon: icon("settings"),
    title: "系统设置",
    subtitle: "端口、测速、局域网、IPv6 和 DNS YAML",
    badge: `:${state.base.mixedPort || 7890}`,
    body: `
      <div class="grid-2">
        <label>配置名称
          <input data-field="profileName" value="${attr(state.profileName)}" placeholder="我的配置">
        </label>
      </div>
      <div class="grid-3">
        <label>mixed-port
          <input type="number" min="1" max="65535" data-field="base.mixedPort" value="${attr(state.base.mixedPort)}">
        </label>
        <label>socks-port
          <input type="number" min="1" max="65535" data-field="base.socksPort" value="${attr(state.base.socksPort)}" placeholder="可空">
        </label>
        <label>redir-port
          <input type="number" min="1" max="65535" data-field="base.redirPort" value="${attr(state.base.redirPort)}" placeholder="可空">
        </label>
      </div>
      <div class="grid-3">
        <label>运行模式
          <select data-field="base.mode">
            ${["rule", "global", "direct"].map((mode) => `<option value="${mode}" ${state.base.mode === mode ? "selected" : ""}>${mode}</option>`).join("")}
          </select>
        </label>
        <label>测速 URL
          <input data-field="base.testUrl" value="${attr(state.base.testUrl)}">
        </label>
        <label>测速间隔秒
          <input type="number" min="30" data-field="base.testInterval" value="${attr(state.base.testInterval)}">
        </label>
      </div>
      <div class="row wrap">
        ${renderCheck("base.allowLan", state.base.allowLan, "允许局域网连接")}
        ${renderCheck("base.ipv6", state.base.ipv6, "启用 IPv6")}
      </div>
      <div class="source-item">
        <div class="row between wrap">
          <strong>DNS YAML</strong>
          <button class="btn" data-action="reset-dns">${icon("refresh")}恢复默认</button>
        </div>
        <textarea class="mono" data-field="dnsYaml" style="min-height: 260px;">${escapeHtml(state.dnsYaml)}</textarea>
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
      <strong>${errors.length ? "生成前需要修正" : "可用性提醒"}</strong>
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
    "import-rules": importRules,
    "remove-rule": () => removeRule(button.dataset.id),
    "reset-dns": resetDns,
    "generate": generateAndRender,
    "copy-yaml": copyYaml,
    "download-yaml": downloadYaml,
    "set-preview-tab": () => setPreviewTab(button.dataset.tab)
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
    source.status = "未导入";
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
  toast("导入源已删除，相关节点已移到删除列表", "warn");
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
  source.status = source.providerMode ? "provider 模式已保存" : "解析中...";
  saveState();
  render();

  try {
    if (!items.length) throw new Error("请先粘贴订阅链接或节点链接");

    if (source.providerMode) {
      const urls = items.filter((item) => item.kind === "url");
      if (items.length !== 1 || urls.length !== 1) {
        throw new Error("proxy-providers 只适合单个订阅链接；混合输入请关闭该选项");
      }
      source.type = "url";
      source.nodeIds = [];
      source.status = "provider 模式";
      state.nodes = state.nodes.filter((node) => node.sourceId !== source.id);
      saveState();
      render();
      toast("已保存为 proxy-provider 源", "good");
      return;
    }

    const parsed = [];
    const errors = [];
    let userinfo = "";

    const resolvedItems = await resolveSmartInput(source, items);
    for (const item of resolvedItems) {
      if (item.error && !item.body) {
        errors.push(`${item.url || "输入内容"}：${item.error}`);
        continue;
      }
      const itemNodes = parseInputContent(item.body || "", source);
      parsed.push(...itemNodes);
      if (item.userinfo) userinfo = item.userinfo;
      if (!itemNodes.length) errors.push(item.url ? `订阅未解析到节点：${item.url}` : "粘贴内容里有片段未解析到节点");
    }

    if (!parsed.length) throw new Error(errors[0] || "未解析到有效节点");

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
    source.status = errors.length ? `已导入 ${nodes.length} 节点，${errors.length} 个提醒` : `已导入 ${nodes.length} 节点`;
    source.error = "";
    if (userinfo) source.userinfo = userinfo;
    saveState();
    render();
    toast(`已导入 ${nodes.length} 个节点`, errors.length ? "warn" : "good");
  } catch (error) {
    source.error = error.message || "导入失败";
    source.status = "导入失败";
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
  const response = await fetch(`/api/fetch?url=${encodeURIComponent(url)}&ua=${encodeURIComponent(source.userAgent || "")}`);
  const data = await response.json();
  if (!data.ok && !data.body) throw new Error(data.error || `远程返回 HTTP ${data.status || "错误"}`);
  const rawUserinfo = data.headers?.["subscription-userinfo"] || "";
  return {
    body: data.body || "",
    userinfo: parseUserInfo(rawUserinfo) || rawUserinfo
  };
}

async function resolveSmartInput(source, fallbackItems) {
  try {
    const response = await fetch("/api/resolve", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        content: source.content || "",
        userAgent: source.userAgent || ""
      })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!data.ok || !Array.isArray(data.items)) throw new Error(data.error || "后端解析失败");
    return data.items.map((item) => {
      const rawUserinfo = item.headers?.["subscription-userinfo"] || "";
      return {
        body: item.body || "",
        url: item.url || "",
        error: item.error || "",
        userinfo: parseUserInfo(rawUserinfo) || rawUserinfo
      };
    });
  } catch {
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
        resolved.push({ body: "", url: item.value, error: error.message || "获取失败", userinfo: "" });
      }
    }
    return resolved;
  }
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
  return [total ? `${used}/${total}` : used, expire ? `到期 ${expire}` : ""].filter(Boolean).join(" · ");
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
    console.warn("Parse node failed", error, line);
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
  toast(`已应用 ${template.name}`, "good");
}

function clearNodes() {
  if (!state.nodes.length) return;
  state.deletedNodes.push(...state.nodes.map((node) => ({ ...node, deletedAt: new Date().toISOString() })));
  state.nodes = [];
  for (const source of state.sources) source.nodeIds = [];
  saveState();
  render();
  toast("节点已清空，可在删除列表恢复", "warn");
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
      toast("查找正则无效", "bad");
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
  toast(`已重命名 ${changed} 个节点`, changed ? "good" : "warn");
}

function fillPorts() {
  const start = Number(state.bulk.portStart);
  const targets = bulkCandidates();
  if (!Number.isInteger(start) || start < 1 || start + targets.length - 1 > 65535) {
    toast("起始端口无效或超出范围", "bad");
    return;
  }
  targets.forEach((node, index) => {
    node.listenerPort = start + index;
  });
  saveState();
  render();
  toast(`已填充 ${targets.length} 个监听端口`, "good");
}

function clearPorts() {
  const targets = bulkCandidates();
  targets.forEach((node) => {
    node.listenerPort = "";
  });
  saveState();
  render();
  toast(`已删除 ${targets.length} 个监听端口`, "good");
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
    toast("当前筛选条件没有命中节点", "warn");
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
    toast("请选择不同的入口和落地节点", "bad");
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
  toast(`已导入 ${added} 条规则`, added ? "good" : "warn");
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
    toast("配置未生成，请先修正校验错误", "bad");
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
    toast("生成结果存在语法风险，已阻止更新", "bad");
    return;
  }

  state.preview = yaml;
  state.validation = validation;
  state.lastGeneratedAt = new Date().toLocaleString("zh-CN", { hour12: false });
  saveState();
  render();
  toast(validation.warnings.length ? "配置已生成，但有提醒需要留意" : "配置已生成", validation.warnings.length ? "warn" : "good");
}

function validateBeforeGenerate() {
  const errors = [];
  const warnings = [];
  const activeNodes = getActiveNodes();
  const providers = getProviderSources();

  if (!activeNodes.length && !providers.length) {
    errors.push("至少需要一个启用节点，或一个 proxy-providers 订阅源。");
  }

  const usedPorts = new Map();
  validatePort("mixed-port", state.base.mixedPort, true, errors, usedPorts);
  validatePort("socks-port", state.base.socksPort, false, errors, usedPorts);
  validatePort("redir-port", state.base.redirPort, false, errors, usedPorts);

  if (!["rule", "global", "direct"].includes(state.base.mode || "rule")) {
    errors.push("运行模式只能是 rule、global 或 direct。");
  }

  if (!isHttpUrl(state.base.testUrl)) {
    errors.push("测速 URL 必须是 http 或 https 地址。");
  }

  if (!Number.isInteger(Number(state.base.testInterval)) || Number(state.base.testInterval) < 30) {
    errors.push("测速间隔至少需要 30 秒。");
  }

  for (const node of activeNodes) {
    validateNode(node, errors, warnings);
    validatePort(`节点「${node.name}」监听端口`, node.listenerPort, false, errors, usedPorts);
  }

  for (const source of providers) {
    if (!isHttpUrl(providerUrl(source))) {
      errors.push(`Provider 源「${source.name || source.id}」必须使用 http/https 订阅链接。`);
    }
  }

  for (const group of state.filterGroups) {
    validateRegex(`筛选组「${group.name}」包含正则`, group.include, errors);
    validateRegex(`筛选组「${group.name}」排除正则`, group.exclude, errors);
  }

  for (const rule of state.customRules) {
    if (!isValidRuleLine(rule.line)) {
      errors.push(`自定义规则格式不正确：${rule.line}`);
    }
  }

  const dnsErrors = validateDnsYaml(state.dnsYaml);
  errors.push(...dnsErrors);

  const names = activeNodes.map((node) => node.name).filter(Boolean);
  if (new Set(names).size !== names.length) {
    warnings.push("存在重复节点名，生成时会自动追加序号避免 YAML 代理名冲突。");
  }

  return { errors, warnings };
}

function validatePort(label, value, required, errors, usedPorts) {
  if (value === "" || value === undefined || value === null) {
    if (required) errors.push(`${label} 必须填写。`);
    return;
  }
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    errors.push(`${label} 必须是 1-65535 的整数。`);
    return;
  }
  const owner = usedPorts.get(port);
  if (owner) {
    errors.push(`${label} 与 ${owner} 使用了同一个端口 ${port}。`);
    return;
  }
  usedPorts.set(port, label);
}

function validateRegex(label, pattern, errors) {
  if (!pattern) return;
  try {
    new RegExp(pattern, "i");
  } catch {
    errors.push(`${label} 不是有效正则。`);
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
  if (!node.name) errors.push("存在未命名节点。");
  if (!node.type) errors.push(`节点「${label}」缺少 type。`);

  if (node.fromYaml) {
    if (!node.name || !node.type) errors.push(`YAML 节点「${label}」缺少 name 或 type。`);
    return;
  }

  if (!node.server) errors.push(`节点「${label}」缺少 server。`);
  if (!Number.isInteger(Number(node.port)) || Number(node.port) < 1 || Number(node.port) > 65535) {
    errors.push(`节点「${label}」端口无效。`);
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
    if (!node[field]) errors.push(`节点「${label}」缺少 ${field}。`);
  }

  if (!requiredByType[node.type] && !["socks5"].includes(node.type)) {
    warnings.push(`节点「${label}」类型 ${node.type} 可能需要手动确认客户端是否支持。`);
  }
}

function validateDnsYaml(text) {
  const errors = [];
  const value = String(text || "").trim();
  if (!value) return ["DNS YAML 不能为空。"];
  if (!/^dns\s*:/m.test(value)) errors.push("DNS YAML 必须包含顶层 dns:。");
  if (/\t/.test(value)) errors.push("DNS YAML 不能包含 Tab，请使用空格缩进。");
  if (/\bundefined\b|\bNaN\b/.test(value)) errors.push("DNS YAML 中包含 undefined 或 NaN。");

  const quoteErrors = value.split(/\r?\n/).some((line) => {
    const stripped = line.replace(/\\["']/g, "");
    return (stripped.match(/"/g) || []).length % 2 || (stripped.match(/'/g) || []).length % 2;
  });
  if (quoteErrors) errors.push("DNS YAML 中存在未闭合的引号。");

  const topLevel = value.split(/\r?\n/).filter((line) => /^[^\s#][^:]*:\s*/.test(line)).map((line) => line.split(":")[0].trim());
  const unexpected = topLevel.filter((key) => key !== "dns");
  if (unexpected.length) {
    errors.push(`DNS 编辑区只能放 dns 配置，不应包含顶层字段：${unique(unexpected).join("、")}。`);
  }

  value.split(/\r?\n/).forEach((line, index) => {
    if (!line.trim() || line.trim().startsWith("#")) return;
    const indent = line.match(/^\s*/)[0].length;
    if (indent % 2 !== 0) errors.push(`DNS YAML 第 ${index + 1} 行缩进不是 2 的倍数。`);
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
  if (/\bundefined\b|\bNaN\b/.test(yaml)) errors.push("生成结果中包含 undefined 或 NaN。");
  for (const section of ["proxies:", "proxy-groups:", "rules:"]) {
    if (!yaml.includes(section)) errors.push(`生成结果缺少 ${section}`);
  }
  if (/port:\s*0\b/.test(yaml)) errors.push("生成结果中存在 0 端口。");

  const topKeys = yaml.split(/\r?\n/)
    .filter((line) => /^[A-Za-z][A-Za-z0-9-]*:\s*/.test(line))
    .map((line) => line.split(":")[0]);
  const duplicates = topKeys.filter((key, index) => topKeys.indexOf(key) !== index);
  if (duplicates.length) errors.push(`生成结果存在重复顶层字段：${unique(duplicates).join("、")}。`);

  if (!yaml.includes("MATCH,")) warnings.push("生成结果没有 MATCH 兜底规则。");
  return { errors: unique(errors), warnings: unique(warnings) };
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
    (state.dnsYaml || DEFAULT_DNS).trim(),
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
      { value: "reject", label: POLICY_LABELS.reject },
      { value: "proxy", label: POLICY_LABELS.proxy },
      { value: "direct", label: POLICY_LABELS.direct }
    ];
  }
  return [
    { value: "proxy", label: POLICY_LABELS.proxy },
    { value: "direct", label: POLICY_LABELS.direct }
  ];
}

function summarizePolicies(groups) {
  const direct = groups.filter((group) => getGroupPolicy(group) === "direct").length;
  const reject = groups.filter((group) => getGroupPolicy(group) === "reject").length;
  return [
    `${groups.length - direct - reject} 代理`,
    direct ? `${direct} 直连` : "",
    reject ? `${reject} 拦截` : ""
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
  toast("YAML 已复制", "good");
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

render();
attachEvents();
