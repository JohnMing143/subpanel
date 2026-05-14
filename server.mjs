import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "public");
const port = Number(process.env.PORT || 4173);
const maxBytes = 16 * 1024 * 1024;
const blockedHeaderNames = new Set([
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

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "application/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".ico", "image/x-icon"]
]);

function send(res, status, body, headers = {}) {
  res.writeHead(status, headers);
  res.end(body);
}

function json(res, status, data) {
  send(res, status, JSON.stringify(data), {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
}

function safeStaticPath(urlPath) {
  const decoded = decodeURIComponent(urlPath);
  const normalized = path.normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(publicDir, normalized === "/" ? "index.html" : normalized);
  if (!filePath.startsWith(publicDir)) return null;
  return filePath;
}

async function fetchSubscriptionData(target, userAgent, customHeaders = {}) {
  let parsed;
  try {
    parsed = new URL(target);
  } catch {
    return { ok: false, status: 400, error: "订阅 URL 无效" };
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return { ok: false, status: 400, error: "仅支持 http/https 订阅链接" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    const upstream = await fetch(parsed, {
      signal: controller.signal,
      redirect: "follow",
      headers: buildUpstreamHeaders(userAgent, customHeaders)
    });

    const reader = upstream.body?.getReader();
    if (!reader) {
      return { ok: false, status: 502, error: "远程订阅没有响应内容" };
    }

    const chunks = [];
    let total = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        return { ok: false, status: 413, error: "订阅内容超过 16 MB，已停止读取" };
      }
      chunks.push(value);
    }

    const body = new TextDecoder("utf-8").decode(Buffer.concat(chunks));
    return {
      ok: upstream.ok,
      status: upstream.status,
      finalUrl: upstream.url,
      headers: {
        "content-type": upstream.headers.get("content-type") || "",
        "subscription-userinfo": upstream.headers.get("subscription-userinfo") || ""
      },
      body
    };
  } catch (error) {
    const message = error?.name === "AbortError" ? "订阅请求超时" : error?.message || "订阅请求失败";
    return { ok: false, status: 502, error: message };
  } finally {
    clearTimeout(timeout);
  }
}

function buildUpstreamHeaders(userAgent, customHeaders) {
  const headers = { accept: "*/*", ...sanitizeRequestHeaders(customHeaders) };
  const ua = String(userAgent || "").trim();
  if (ua) headers["user-agent"] = ua;
  if (!headers["user-agent"]) headers["user-agent"] = "subpanel/0.1 mihomo";
  return headers;
}

function sanitizeRequestHeaders(customHeaders) {
  const headers = {};
  if (!customHeaders || typeof customHeaders !== "object" || Array.isArray(customHeaders)) return headers;
  for (const [rawName, rawValue] of Object.entries(customHeaders)) {
    const name = String(rawName || "").trim().toLowerCase();
    const value = String(rawValue ?? "").trim();
    if (!/^[a-z0-9!#$%&'*+.^_`|~-]+$/i.test(name)) continue;
    if (blockedHeaderNames.has(name) || name.startsWith(":")) continue;
    if (!value || value.length > 4096) continue;
    headers[name] = value;
  }
  return headers;
}

async function fetchSubscription(req, reqUrl, res) {
  const payload = await readJsonBody(req);
  const target = payload.url || "";
  const userAgent = payload.userAgent || "subpanel/0.1 mihomo";
  const data = await fetchSubscriptionData(target, userAgent, payload.headers || {});
  json(res, data.status && !data.body ? data.status : 200, data);
}

async function readJsonBody(req) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.byteLength;
    if (total > maxBytes) throw new Error("请求内容超过 16 MB");
    chunks.push(chunk);
  }
  const text = Buffer.concat(chunks).toString("utf8");
  return text ? JSON.parse(text) : {};
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

function looksLikeYaml(text) {
  return /(^|\n)\s*proxies\s*:/i.test(text) || /(^|\n)\s*proxy-groups\s*:/i.test(text);
}

function decodeMaybeBase64(text) {
  const compact = text.replace(/\s+/g, "");
  if (!compact || compact.includes("://")) return "";
  if (!/^[A-Za-z0-9+/_=-]+$/.test(compact)) return "";
  try {
    return Buffer.from(compact.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
  } catch {
    return "";
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

async function resolveInput(req, res) {
  try {
    const payload = await readJsonBody(req);
    const userAgent = payload.userAgent || "subpanel/0.1 mihomo";
    const urls = Array.isArray(payload.urls) ? payload.urls.filter(isHttpUrl) : [];
    const resolved = [];

    for (const url of urls) {
      const data = await fetchSubscriptionData(url, userAgent, payload.headers || {});
      resolved.push({
        kind: "content",
        source: "url",
        url,
        ok: data.ok,
        status: data.status,
        headers: data.headers || {},
        body: data.body || "",
        error: data.error || ""
      });
    }

    json(res, 200, { ok: true, items: resolved });
  } catch (error) {
    json(res, 400, { ok: false, error: error?.message || "解析输入失败" });
  }
}

const server = http.createServer(async (req, res) => {
  const reqUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (reqUrl.pathname === "/api/fetch") {
    if (req.method !== "POST") {
      json(res, 405, { ok: false, error: "Method not allowed" });
      return;
    }
    await fetchSubscription(req, reqUrl, res);
    return;
  }

  if (reqUrl.pathname === "/api/resolve" && req.method === "POST") {
    await resolveInput(req, res);
    return;
  }

  const filePath = safeStaticPath(reqUrl.pathname);
  if (!filePath) {
    send(res, 403, "Forbidden", { "content-type": "text/plain; charset=utf-8" });
    return;
  }

  try {
    const data = await readFile(filePath);
    send(res, 200, data, {
      "content-type": mimeTypes.get(path.extname(filePath)) || "application/octet-stream",
      "cache-control": "no-store"
    });
  } catch {
    const fallback = path.join(publicDir, "index.html");
    const data = await readFile(fallback);
    send(res, 200, data, {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store"
    });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`subpanel running at http://127.0.0.1:${port}`);
});
