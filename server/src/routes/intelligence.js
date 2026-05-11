import express from 'express';
import { createIntelligence, getIntelligence, listIntelligence, saveSummary } from '../services/repository.js';
import { generateExecutiveSummary } from '../services/openaiService.js';
import { mockScrapeUrl } from '../services/ingestionService.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    res.json(await listIntelligence(req.query));
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    let payload = req.body;
    if (payload.source_url && !payload.raw_content) {
      payload = { ...payload, ...(await mockScrapeUrl(payload.source_url)) };
    }
    res.status(201).json(await createIntelligence(payload));
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const item = await getIntelligence(req.params.id);
    if (!item) return res.status(404).json({ error: 'Intelligence item not found' });
    res.json(item);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/summarize', async (req, res, next) => {
  try {
    const item = await getIntelligence(req.params.id);
    if (!item) return res.status(404).json({ error: 'Intelligence item not found' });
    const summary = await generateExecutiveSummary(item.raw_content);
    res.status(201).json(await saveSummary(req.params.id, summary));
  } catch (error) {
    next(error);
  }
});

export default router;

