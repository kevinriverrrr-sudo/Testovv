const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const serversRouter = require('./routes/servers');
const authRouter = require('./routes/auth');
const wireguardRouter = require('./routes/wireguard');
const statsRouter = require('./routes/stats');
const userRouter = require('./routes/user');

app.use('/servers', serversRouter);
app.use('/auth', authRouter);
app.use('/wireguard', wireguardRouter);
app.use('/stats', statsRouter);
app.use('/user', userRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`VPN API server running on port ${PORT}`);
});
