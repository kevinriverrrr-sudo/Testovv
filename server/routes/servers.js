const express = require('express');
const router = express.Router();

// Mock server data
const servers = [
  {
    id: 'us-ny-01',
    name: 'New York #1',
    country: 'United States',
    countryCode: 'US',
    city: 'New York',
    ip: '104.28.15.123',
    port: 51820,
    ping: 15,
    load: 25,
    protocol: 'wireguard',
    features: ['streaming', 'p2p']
  },
  {
    id: 'de-fra-01',
    name: 'Frankfurt #1',
    country: 'Germany',
    countryCode: 'DE',
    city: 'Frankfurt',
    ip: '185.34.12.45',
    port: 51820,
    ping: 28,
    load: 15,
    protocol: 'wireguard',
    features: ['streaming', 'low-latency']
  },
  {
    id: 'jp-tok-01',
    name: 'Tokyo #1',
    country: 'Japan',
    countryCode: 'JP',
    city: 'Tokyo',
    ip: '103.45.78.90',
    port: 51820,
    ping: 120,
    load: 40,
    protocol: 'wireguard',
    features: ['streaming', 'gaming']
  },
  {
    id: 'uk-lon-01',
    name: 'London #1',
    country: 'United Kingdom',
    countryCode: 'GB',
    city: 'London',
    ip: '178.62.15.78',
    port: 51820,
    ping: 35,
    load: 30,
    protocol: 'wireguard',
    features: ['streaming']
  },
  {
    id: 'sg-sin-01',
    name: 'Singapore #1',
    country: 'Singapore',
    countryCode: 'SG',
    city: 'Singapore',
    ip: '139.59.123.45',
    port: 51820,
    ping: 180,
    load: 50,
    protocol: 'wireguard',
    features: ['gaming', 'low-latency']
  }
];

// Get all servers
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: servers
  });
});

// Get server by ID
router.get('/:id', (req, res) => {
  const server = servers.find(s => s.id === req.params.id);
  
  if (!server) {
    return res.status(404).json({
      success: false,
      error: 'Server not found'
    });
  }

  res.json({
    success: true,
    data: server
  });
});

// Get clean IP for server (anti-captcha feature)
router.get('/:id/clean-ip', (req, res) => {
  const server = servers.find(s => s.id === req.params.id);
  
  if (!server) {
    return res.status(404).json({
      success: false,
      error: 'Server not found'
    });
  }

  // Generate a "clean" IP from the same subnet
  const ipParts = server.ip.split('.');
  ipParts[3] = String(Math.floor(Math.random() * 254) + 1);
  const cleanIP = ipParts.join('.');

  res.json({
    success: true,
    data: { ip: cleanIP }
  });
});

module.exports = router;
