import express from 'express';
import { createCompetitor, deleteCompetitor, getCompetitor, listCompetitors, listIntelligence, saveSwot, updateCompetitor } from '../services/repository.js';
import { generateSWOT } from '../services/openaiService.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    res.json(await listCompetitors(req.query));
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    res.status(201).json(await createCompetitor(req.body));
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const competitor = await getCompetitor(req.params.id);
    if (!competitor) return res.status(404).json({ error: 'Competitor not found' });
    res.json(competitor);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const competitor = await updateCompetitor(req.params.id, req.body);
    if (!competitor) return res.status(404).json({ error: 'Competitor not found' });
    res.json(competitor);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await deleteCompetitor(req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

router.post('/:id/swot', async (req, res, next) => {
  try {
    const competitor = await getCompetitor(req.params.id);
    if (!competitor) return res.status(404).json({ error: 'Competitor not found' });
    const intelligence = await listIntelligence({ competitor_id: req.params.id });
    const swot = await generateSWOT(competitor, intelligence);
    res.status(201).json(await saveSwot(req.params.id, swot));
  } catch (error) {
    next(error);
  }
});

export default router;

