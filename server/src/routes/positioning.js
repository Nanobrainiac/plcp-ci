import express from 'express';
import { generatePositioningAnalysis } from '../services/openaiService.js';
import { buildComparisonDashboard } from '../services/positioningService.js';
import {
  getLatestPositioningAnalysis,
  getPlcpProfile,
  listCompetitors,
  listIntelligence,
  savePositioningAnalysis,
  updatePlcpProfile
} from '../services/repository.js';

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const [profile, competitors, intelligence, latest] = await Promise.all([
      getPlcpProfile(),
      listCompetitors(),
      listIntelligence(),
      getLatestPositioningAnalysis()
    ]);
    res.json({
      profile,
      competitors,
      intelligenceCount: intelligence.length,
      latestAnalysis: latest,
      comparison: buildComparisonDashboard(profile, competitors, latest?.analysis)
    });
  } catch (error) {
    next(error);
  }
});

router.put('/profile', async (req, res, next) => {
  try {
    res.json(await updatePlcpProfile(req.body));
  } catch (error) {
    next(error);
  }
});

router.post('/analyze', async (_req, res, next) => {
  try {
    const [profile, competitors, intelligence] = await Promise.all([
      getPlcpProfile(),
      listCompetitors(),
      listIntelligence()
    ]);
    const analysis = await generatePositioningAnalysis(profile, competitors, intelligence);
    const saved = await savePositioningAnalysis(analysis);
    res.status(201).json({
      ...saved,
      comparison: buildComparisonDashboard(profile, competitors, analysis)
    });
  } catch (error) {
    next(error);
  }
});

export default router;
