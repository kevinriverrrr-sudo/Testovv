import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import competitorsRouter from './routes/competitors.js';
import analysisRouter from './routes/analysis.js';
import pricesRouter from './routes/prices.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.use('/api/competitors', competitorsRouter);
app.use('/api/analysis', analysisRouter);
app.use('/api/prices', pricesRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`FunPay Pro Backend server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
