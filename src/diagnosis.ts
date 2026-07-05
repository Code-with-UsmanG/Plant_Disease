import type { PredictionResult } from "./types";

interface Reading {
  summary: string;
  advice: string;
  riskLabel: "Low risk" | "Moderate risk" | "High risk";
}

// Lightweight domain rules layered on top of the model's raw output, so the
// reading a user sees is specific to the pathology rather than a generic
// "disease detected" message. Matched by keyword against the condition string.
const RULES: Array<{ match: RegExp; summary: (plant: string) => string; advice: string; riskLabel: Reading["riskLabel"] }> = [
  {
    match: /blight/i,
    summary: (p) => `${p} shows lesion patterns consistent with blight, a fungal or oomycete infection that spreads quickly in humid conditions.`,
    advice: "Remove and destroy affected leaves, avoid overhead watering, and apply a copper-based or targeted fungicide before the next rain.",
    riskLabel: "High risk",
  },
  {
    match: /rot/i,
    summary: (p) => `${p} shows discoloration consistent with rot, typically caused by fungal pathogens colonizing damaged or waterlogged tissue.`,
    advice: "Prune affected tissue well below the visible damage, improve drainage and airflow, and disinfect tools between cuts.",
    riskLabel: "High risk",
  },
  {
    match: /rust/i,
    summary: (p) => `${p} shows the orange-brown pustules characteristic of rust fungus, which spreads via airborne spores.`,
    advice: "Isolate the plant if possible, remove infected leaves, and apply a sulfur or fungicidal treatment labeled for rust.",
    riskLabel: "Moderate risk",
  },
  {
    match: /mildew/i,
    summary: (p) => `${p} shows the powdery white coating typical of mildew, which thrives in humid, low-airflow conditions.`,
    advice: "Increase air circulation, avoid wetting the foliage when watering, and apply a horticultural oil or sulfur-based spray.",
    riskLabel: "Moderate risk",
  },
  {
    match: /leaf spot|septoria|scab/i,
    summary: (p) => `${p} shows localized lesions consistent with a leaf-spot pathogen, which spreads through splashing water and prolonged leaf wetness.`,
    advice: "Remove affected leaves, mulch to reduce soil splash-back, and water at the base rather than overhead.",
    riskLabel: "Moderate risk",
  },
  {
    match: /mosaic|yellow leaf curl|virus/i,
    summary: (p) => `${p} shows a mottled or curling pattern consistent with a viral infection, which cannot be cured once established.`,
    advice: "Remove and dispose of the plant to prevent spread, control insect vectors like aphids or whiteflies, and disinfect tools thoroughly.",
    riskLabel: "High risk",
  },
  {
    match: /bacterial spot/i,
    summary: (p) => `${p} shows dark, water-soaked lesions consistent with a bacterial infection, which spreads rapidly in wet, warm weather.`,
    advice: "Avoid overhead irrigation, remove infected material, and apply a copper-based bactericide as a preventive measure.",
    riskLabel: "High risk",
  },
  {
    match: /spider mite/i,
    summary: (p) => `${p} shows the fine stippling and webbing associated with spider mite feeding damage.`,
    advice: "Rinse foliage with a strong water spray, introduce predatory mites if outdoors, or apply insecticidal soap to affected areas.",
    riskLabel: "Moderate risk",
  },
  {
    match: /greening|haunglongbing/i,
    summary: (p) => `${p} shows symptoms consistent with citrus greening, a bacterial disease spread by psyllid insects with no known cure.`,
    advice: "Consult a local agricultural extension immediately — infected trees are typically removed to protect nearby citrus.",
    riskLabel: "High risk",
  },
  {
    match: /target spot/i,
    summary: (p) => `${p} shows concentric ring lesions consistent with target spot, a fungal disease favored by warm, wet weather.`,
    advice: "Remove infected leaves, rotate crops next season, and apply a fungicide labeled for target spot if the pattern spreads.",
    riskLabel: "Moderate risk",
  },
];

const FALLBACK_DISEASED = {
  advice: "Isolate the plant from healthy neighbors, remove visibly affected tissue, and monitor closely over the next few days.",
  riskLabel: "Moderate risk" as const,
};

export function buildReading(result: PredictionResult): Reading {
  if (result.is_healthy) {
    return {
      summary: `${result.plant} shows even coloration and no visible lesions, consistent with a healthy leaf.`,
      advice: "Maintain your current watering and light routine, and rescan periodically to catch early changes.",
      riskLabel: "Low risk",
    };
  }

  const rule = RULES.find((r) => r.match.test(result.condition));
  if (rule) {
    return { summary: rule.summary(result.plant), advice: rule.advice, riskLabel: rule.riskLabel };
  }

  return {
    summary: `${result.plant} shows visual patterns consistent with ${result.condition.toLowerCase()}.`,
    advice: FALLBACK_DISEASED.advice,
    riskLabel: FALLBACK_DISEASED.riskLabel,
  };
}
