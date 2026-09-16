/**
 * dryrun.ai — Local Backend Server & KeeperHub Live API Proxy
 * Securely communicates with https://app.keeperhub.com using KEEPERHUB_API_KEY from .env
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Load .env
const envPath = path.join(__dirname, '.env');
let apiKey = process.env.KEEPERHUB_API_KEY || '';
let port = parseInt(process.env.PORT || '3000', 10);

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...rest] = trimmed.split('=');
      const val = rest.join('=').trim();
      if (key === 'KEEPERHUB_API_KEY') apiKey = val;
      if (key === 'PORT') port = parseInt(val, 10);
    }
  });
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function proxyKeeperHub(apiPath, method, reqBody, callback) {
  const options = {
    hostname: 'app.keeperhub.com',
    path: apiPath,
    method: method,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'dryrun-ai-mission-control/3.0'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      callback(res.statusCode, data);
    });
  });

  req.on('error', (err) => {
    callback(500, JSON.stringify({ error: err.message }));
  });

  if (reqBody) {
    req.write(typeof reqBody === 'string' ? reqBody : JSON.stringify(reqBody));
  }
  req.end();
}

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // --- API ROUTES ---
  if (url.pathname === '/api/live/status') {
    proxyKeeperHub('/api/workflows', 'GET', null, (status, data) => {
      if (status === 200) {
        try {
          const workflows = JSON.parse(data);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            connected: true,
            status: 'LIVE_CONNECTED',
            organizationId: workflows[0]?.organizationId || 'd103ed18-fe12-409f-97a2-b6dcb754a118',
            workflowsCount: workflows.length,
            workflows: workflows.map(w => ({ id: w.id, name: w.name, network: w.nodes?.[1]?.data?.config?.network }))
          }));
        } catch (e) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ connected: true, status: 'LIVE_CONNECTED', raw: data }));
        }
      } else {
        res.writeHead(status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ connected: false, error: 'KeeperHub API returned non-200' }));
      }
    });
    return;
  }

  if (url.pathname === '/api/live/schemas') {
    proxyKeeperHub('/api/mcp/schemas', 'GET', null, (status, data) => {
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(data);
    });
    return;
  }

  if (url.pathname === '/api/live/workflows') {
    proxyKeeperHub('/api/workflows', 'GET', null, (status, data) => {
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(data);
    });
    return;
  }

  if (url.pathname === '/api/live/workflows/create' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      proxyKeeperHub('/api/workflows/create', 'POST', body, (status, data) => {
        res.writeHead(status, { 'Content-Type': 'application/json' });
        res.end(data);
      });
    });
    return;
  }

  if (url.pathname.startsWith('/api/live/workflows/') && url.pathname.endsWith('/execute') && req.method === 'POST') {
    const parts = url.pathname.split('/');
    const workflowId = parts[parts.length - 2];
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      proxyKeeperHub(`/api/workflows/${workflowId}/execute`, 'POST', body, (status, data) => {
        res.writeHead(status, { 'Content-Type': 'application/json' });
        res.end(data);
      });
    });
    return;
  }

  // --- STATIC FILE SERVING ---
  let filePath = path.join(__dirname, url.pathname === '/' ? 'index.html' : url.pathname);
  const ext = path.extname(filePath).toLowerCase();

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(port, () => {
  console.log(`[dryrun.ai] Mission Control Server running at http://localhost:${port}`);
  console.log(`[dryrun.ai] KeeperHub live bridge configured with Organization Key (length: ${apiKey.length})`);
});
