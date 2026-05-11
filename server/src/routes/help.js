import express from 'express';
import { answerHelpQuestion } from '../services/openaiService.js';

const router = express.Router();

router.post('/ask', async (req, res, next) => {
  try {
    const question = req.body.question || '';
    res.json(await answerHelpQuestion(question));
  } catch (error) {
    next(error);
  }
});

export default router;
