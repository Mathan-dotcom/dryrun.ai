const https = require('https');

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const apiKey = process.env.KEEPERHUB_API_KEY || '';
  const url = new URL(req.url, `https://${req.headers.host || 'dryrun.ai'}`);
  const reqPath = url.searchParams.get('path') || url.pathname.replace('/api/live/', '');

  // Helper for KeeperHub HTTPS request
  const proxyKeeperHub = (apiPath, method, bodyData) => {
    return new Promise((resolve) => {
      const options = {
        hostname: 'app.keeperhub.com',
        path: apiPath,
        method: method,
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'dryrun-ai-vercel/3.0'
        }
      };

      const proxyReq = https.request(options, (proxyRes) => {
        let data = '';
        proxyRes.on('data', chunk => data += chunk);
        proxyRes.on('end', () => resolve({ status: proxyRes.statusCode, data }));
      });

      proxyReq.on('error', (err) => {
        resolve({ status: 500, data: JSON.stringify({ error: err.message }) });
      });

      if (bodyData) {
        proxyReq.write(typeof bodyData === 'string' ? bodyData : JSON.stringify(bodyData));
      }
      proxyReq.end();
    });
  };

  // Route: /api/live/status
  if (reqPath === 'status' || reqPath.endsWith('/status')) {
    const { status, data } = await proxyKeeperHub('/api/workflows', 'GET');
    if (status === 200) {
      try {
        const workflows = JSON.parse(data);
        res.status(200).json({
          connected: true,
          status: 'LIVE_CONNECTED',
          organizationId: workflows[0]?.organizationId || 'd103ed18-fe12-409f-97a2-b6dcb754a118',
          workflowsCount: workflows.length,
          workflows: workflows.map(w => ({ id: w.id, name: w.name, network: w.nodes?.[1]?.data?.config?.network }))
        });
        return;
      } catch (e) {
        res.status(200).json({ connected: true, status: 'LIVE_CONNECTED', raw: data });
        return;
      }
    }
    res.status(status).json({ connected: false, error: 'KeeperHub API returned ' + status });
    return;
  }

  // Route: /api/live/schemas
  if (reqPath === 'schemas' || reqPath.endsWith('/schemas')) {
    const { status, data } = await proxyKeeperHub('/api/mcp/schemas', 'GET');
    res.setHeader('Content-Type', 'application/json');
    res.status(status).send(data);
    return;
  }

  // Route: /api/live/workflows
  if (reqPath === 'workflows' || reqPath.endsWith('/workflows')) {
    const { status, data } = await proxyKeeperHub('/api/workflows', 'GET');
    res.setHeader('Content-Type', 'application/json');
    res.status(status).send(data);
    return;
  }

  // Route: /api/live/workflows/:id/execute
  if (reqPath.includes('workflows/') && reqPath.endsWith('/execute') && req.method === 'POST') {
    const parts = reqPath.split('/');
    const workflowId = parts[parts.length - 2];
    const { status, data } = await proxyKeeperHub(`/api/workflows/${workflowId}/execute`, 'POST', req.body);
    res.setHeader('Content-Type', 'application/json');
    res.status(status).send(data);
    return;
  }

  res.status(404).json({ error: 'Not found in /api/live' });
};
