const https = require('https');
const fs = require('fs');
const path = require('path');

// Read API Key from .env
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
let apiKey = '';
envContent.split('\n').forEach(line => {
  if (line.startsWith('KEEPERHUB_API_KEY=')) {
    apiKey = line.replace('KEEPERHUB_API_KEY=', '').trim();
  }
});

const workflow = {
  name: "Daydreams Agent Safe Payout (Base Sepolia)",
  description: "dryrun.ai — Preview-first payment execution layer for Daydreams Open Agentic Commerce",
  nodes: [
    {
      id: "trigger-1",
      type: "trigger",
      data: {
        label: "Daydreams Task Completion",
        config: { triggerType: "Manual" }
      }
    },
    {
      id: "step-1",
      type: "action",
      data: {
        label: "Execute USDC Transfer",
        config: {
          actionType: "web3/write-contract",
          network: "84532", // Base Sepolia
          contractAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // Base Sepolia USDC
          abi: JSON.stringify([
            {
              type: "function",
              name: "transfer",
              stateMutability: "nonpayable",
              inputs: [
                { name: "to", type: "address" },
                { name: "amount", type: "uint256" }
              ],
              outputs: [{ name: "", type: "bool" }]
            }
          ]),
          abiFunction: "transfer",
          functionArgs: JSON.stringify(["0x71a4f028b3c94918e9bc019283471bfa82910e9b", "1000000"]) // 1 USDC
        }
      }
    }
  ],
  edges: [
    { id: "e-trigger-step1", source: "trigger-1", target: "step-1" }
  ]
};

const payload = JSON.stringify(workflow);

const req = https.request({
  hostname: 'app.keeperhub.com',
  path: '/api/workflows/create',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
    'User-Agent': 'dryrun-ai/3.0'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('RESPONSE:', data);
  });
});

req.on('error', (err) => {
  console.error('ERROR:', err);
});

req.write(payload);
req.end();
