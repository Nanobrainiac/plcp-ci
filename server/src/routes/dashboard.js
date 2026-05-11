import express from 'express';
import { getDashboardStats } from '../services/repository.js';

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    res.json(await getDashboardStats());
  } catch (error) {
    next(error);
  }
});

export default router;

