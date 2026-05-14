const maxBytes = 16 * 1024 * 1024;

function json(status, data) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

async function fetchSubscriptionData(target, userAgent) {
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
      headers: {
        accept: "*/*",
        "user-agent": userAgent
      }
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

    const body = decodeChunks(chunks, total);
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

function decodeChunks(chunks, total) {
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder("utf-8").decode(bytes);
}

async function fetchSubscription(requestUrl) {
  const target = requestUrl.searchParams.get("url") || "";
  const userAgent = requestUrl.searchParams.get("ua") || "subpanel/0.1 mihomo";
  const data = await fetchSubscriptionData(target, userAgent);
  return json(data.status && !data.body ? data.status : 200, data);
}

async function readJsonBody(request) {
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maxBytes) {
    throw new Error("请求内容超过 16 MB");
  }
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
    const normalized = compact.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(normalized);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder("utf-8").decode(bytes);
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

async function resolveInput(request) {
  try {
    const payload = await readJsonBody(request);
    const userAgent = payload.userAgent || "subpanel/0.1 mihomo";
    const items = splitSmartInput(payload.content || "");
    const resolved = [];

    for (const item of items) {
      if (item.kind !== "url") {
        resolved.push({ kind: "content", source: "inline", body: item.value });
        continue;
      }

      const data = await fetchSubscriptionData(item.value, userAgent);
      resolved.push({
        kind: "content",
        source: "url",
        url: item.value,
        ok: data.ok,
        status: data.status,
        headers: data.headers || {},
        body: data.body || "",
        error: data.error || ""
      });
    }

    return json(200, { ok: true, items: resolved });
  } catch (error) {
    return json(400, { ok: false, error: error?.message || "解析输入失败" });
  }
}

export default {
  async fetch(request, env) {
    const requestUrl = new URL(request.url);

    if (requestUrl.pathname === "/api/fetch") {
      return fetchSubscription(requestUrl);
    }

    if (requestUrl.pathname === "/api/resolve" && request.method === "POST") {
      return resolveInput(request);
    }

    if (requestUrl.pathname.startsWith("/api/")) {
      return json(404, { ok: false, error: "Not found" });
    }

    return env.ASSETS.fetch(request);
  }
};
