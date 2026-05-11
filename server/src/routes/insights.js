import express from 'express';
import { getAllSearchableData, listInsights, saveGeneratedInsight } from '../services/repository.js';
import { generateInsights } from '../services/openaiService.js';

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    res.json(await listInsights());
  } catch (error) {
    next(error);
  }
});

router.post('/generate', async (req, res, next) => {
  try {
    const query = req.body.query || 'Synthesize competitive risks and opportunities for PLCP.';
    const data = await getAllSearchableData();
    const analysis = await generateInsights({ query, ...data });
    res.status(201).json(await saveGeneratedInsight({ query, ...analysis }));
  } catch (error) {
    next(error);
  }
});

export default router;
