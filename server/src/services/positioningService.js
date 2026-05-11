export function buildComparisonDashboard(plcpProfile, competitors, analysis = null) {
  const features = buildFeatures(plcpProfile, competitors);

  return {
    featureMatrix: features.map((feature) => ({
      feature,
      plcp: scoreFeature(feature, plcpProfile, true),
      competitors: competitors.map((competitor) => ({
        id: competitor.id,
        company_name: competitor.company_name,
        status: scoreFeature(feature, competitor, false)
      }))
    })),
    strengthComparisons: competitors.map((competitor) => ({
      competitor_id: competitor.id,
      company_name: competitor.company_name,
      plcp: plcpProfile.operational_strengths || [],
      competitor: splitText(competitor.strengths)
    })),
    weaknessComparisons: competitors.map((competitor) => ({
      competitor_id: competitor.id,
      company_name: competitor.company_name,
      plcp: plcpProfile.weaknesses || [],
      competitor: splitText(competitor.weaknesses)
    })),
    recommendations: analysis?.strategic_recommendations || []
  };
}

function buildFeatures(plcpProfile, competitors) {
  const values = [
    ...(plcpProfile.core_services || []),
    ...(plcpProfile.differentiators || []),
    ...competitors.flatMap((competitor) => splitText(competitor.services_offered)),
    'Premium expert positioning',
    'Mediation-ready support',
    'Automated analytics'
  ];
  return [...new Set(values.map((value) => normalizeLabel(value)).filter(Boolean))].slice(0, 12);
}

function scoreFeature(feature, entity, isPlcp) {
  const text = JSON.stringify(entity).toLowerCase();
  const tokens = feature.toLowerCase().split(/\W+/).filter((token) => token.length > 3);
  const matches = tokens.filter((token) => text.includes(token)).length;

  if (isPlcp && matches > 0) return 'advantage';
  if (matches >= 2) return 'parity';
  if (feature.toLowerCase().includes('automated') && isPlcp) return 'opportunity';
  if (matches === 1) return 'parity';
  return isPlcp ? 'opportunity' : 'weakness';
}

function splitText(value = '') {
  return String(value).split(/[.;,]/).map((item) => item.trim()).filter(Boolean).slice(0, 5);
}

function normalizeLabel(value) {
  return String(value).trim().replace(/\s+/g, ' ');
}

