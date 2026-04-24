// Local CORS proxy for browser calls to D-ID and OpenAI-compatible providers.
// Run: node scripts/did-proxy.js
const http = require('http');
const https = require('https');

const PORT = 3099;
const DID_BASE = new URL('https://api.d-id.com');
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

const server = http.createServer((req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const target = resolveTarget(req);
  if (target.error) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: target.error }));
    return;
  }

  console.log(`→ ${req.method} ${req.url} (${target.url.href})`);

  const client = target.url.protocol === 'http:' ? http : https;
  const headers = buildForwardHeaders(req.headers, target.url);

  const proxyReq = client.request(
    {
      protocol: target.url.protocol,
      hostname: target.url.hostname,
      port: target.url.port || undefined,
      path: `${target.url.pathname}${target.url.search}`,
      method: req.method,
      headers,
    },
    proxyRes => {
      console.log(`← ${proxyRes.statusCode} ${req.url}`);
      setCorsHeaders(res);
      res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
      proxyRes.pipe(res);
    }
  );

  proxyReq.on('error', error => {
    console.error(`✗ ${error.message}`);
    setCorsHeaders(res);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  });

  req.pipe(proxyReq);
});

server.on('error', error => {
  if (error.code === 'EADDRINUSE') {
    console.error(`✗ Port ${PORT} is already in use.`);
  } else {
    console.error(`✗ Proxy error: ${error.message}`);
  }
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`✓ Proxy running on http://localhost:${PORT}`);
  console.log('  Default route: D-ID requests -> https://api.d-id.com');
  console.log('  Dynamic route: set X-Target-Host to an OpenAI-compatible base URL like https://api.openai.com/v1');
});

function resolveTarget(req) {
  const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const rawTarget = req.headers['x-target-host'];

  if (!rawTarget) {
    return { url: new URL(`${requestUrl.pathname}${requestUrl.search}`, DID_BASE) };
  }

  const parsedBase = parseTargetBase(Array.isArray(rawTarget) ? rawTarget[0] : rawTarget);
  if (!parsedBase) {
    return { error: 'X-Target-Host must be a valid https URL, or http://localhost for local testing.' };
  }

  const path = joinPaths(parsedBase.pathname, requestUrl.pathname);
  const url = new URL(`${path}${requestUrl.search}`, parsedBase);
  return { url };
}

function parseTargetBase(value) {
  try {
    const url = new URL(value);
    const isHttps = url.protocol === 'https:';
    const isLocalHttp = url.protocol === 'http:' && LOCAL_HOSTS.has(url.hostname);

    if (!isHttps && !isLocalHttp) return null;

    url.hash = '';
    url.search = '';
    return url;
  } catch {
    return null;
  }
}

function joinPaths(basePath, requestPath) {
  const left = basePath && basePath !== '/' ? basePath.replace(/\/$/, '') : '';
  const right = requestPath.startsWith('/') ? requestPath : `/${requestPath}`;
  return `${left}${right}` || '/';
}

function buildForwardHeaders(sourceHeaders, targetUrl) {
  const headers = { ...sourceHeaders };

  delete headers.host;
  delete headers.origin;
  delete headers.referer;
  delete headers.connection;
  delete headers['x-target-host'];

  headers.host = targetUrl.host;
  return headers;
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Authorization, Content-Type, Accept, anthropic-version, x-api-key, X-Target-Host'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
}
