import express from 'express';
import { getAllSearchableData } from '../services/repository.js';
import { semanticSearchPlaceholder } from '../services/searchService.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const q = req.query.q || '';
    const data = await getAllSearchableData();
    res.json({ query: q, ...(await semanticSearchPlaceholder(q, data)) });
  } catch (error) {
    next(error);
  }
});

export default router;

