const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// Generate WireGuard keypair (mock implementation)
function generateKeyPair() {
  const privateKey = crypto.randomBytes(32).toString('base64');
  const publicKey = crypto.randomBytes(32).toString('base64');
  return { privateKey, publicKey };
}

// Generate WireGuard config
router.post('/config', (req, res) => {
  const { serverId } = req.body;

  if (!serverId) {
    return res.status(400).json({
      success: false,
      error: 'Server ID required'
    });
  }

  // Generate client keys
  const clientKeys = generateKeyPair();
  const serverKeys = generateKeyPair();

  // Mock server IPs (in production, these would come from actual servers)
  const serverIPs = {
    'us-ny-01': '104.28.15.123',
    'de-fra-01': '185.34.12.45',
    'jp-tok-01': '103.45.78.90',
    'uk-lon-01': '178.62.15.78',
    'sg-sin-01': '139.59.123.45'
  };

  const serverIP = serverIPs[serverId] || '104.28.15.123';

  const config = {
    privateKey: clientKeys.privateKey,
    publicKey: clientKeys.publicKey,
    address: `10.8.0.${Math.floor(Math.random() * 250) + 2}/24`,
    dns: ['1.1.1.1', '8.8.8.8'],
    serverPublicKey: serverKeys.publicKey,
    serverEndpoint: `${serverIP}:51820`,
    allowedIPs: ['0.0.0.0/0', '::/0']
  };

  res.json({
    success: true,
    data: config
  });
});

module.exports = router;
