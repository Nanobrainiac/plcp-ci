import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import competitorsRouter from './routes/competitors.js';
import intelligenceRouter from './routes/intelligence.js';
import searchRouter from './routes/search.js';
import dashboardRouter from './routes/dashboard.js';
import insightsRouter from './routes/insights.js';
import positioningRouter from './routes/positioning.js';
import helpRouter from './routes/help.js';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    storage: process.env.SUPABASE_URL ? 'supabase' : 'memory',
    ai: process.env.OPENAI_API_KEY ? 'openai' : 'mock'
  });
});

app.use('/api/competitors', competitorsRouter);
app.use('/api/intelligence', intelligenceRouter);
app.use('/api/search', searchRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/insights', insightsRouter);
app.use('/api/positioning', positioningRouter);
app.use('/api/help', helpRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Unexpected server error' });
});

app.listen(port, () => {
  console.log(`PLCP CI API listening on http://localhost:${port}`);
});
