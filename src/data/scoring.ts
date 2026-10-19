// CHAINLENS — transparent "Demo priority score".
//
// This is an ILLUSTRATIVE ranking aid for the prototype, NOT a validated or
// calibrated security metric. The weights below are shown to the user in the
// UI so the score is fully transparent and reproducible.

import type { AttackPath, Confidence, Likelihood } from './types';

export const SCORE_WEIGHTS = {
  impact: 0.4,
  likelihood: 0.25,
  effortEase: 0.2,
  evidence: 0.15,
} as const;

export const likelihoodValue: Record<Likelihood, number> = {
  low: 0.3,
  moderate: 0.6,
  elevated: 0.9,
};

export const evidenceValue: Record<Confidence, number> = {
  low: 0.3,
  moderate: 0.65,
  high: 1.0,
};

export interface ScoreBreakdown {
  total: number; // 0..100
  impactPart: number;
  likelihoodPart: number;
  effortPart: number;
  evidencePart: number;
  impactNorm: number;
  likelihoodNorm: number;
  effortEaseNorm: number;
  evidenceNorm: number;
}

/**
 * Compute the illustrative demo priority score for a path.
 * Rejected paths are intentionally excluded from ranking (score 0).
 */
export function scorePath(path: AttackPath): ScoreBreakdown {
  if (path.feasibility === 'rejected') {
    return {
      total: 0,
      impactPart: 0,
      likelihoodPart: 0,
      effortPart: 0,
      evidencePart: 0,
      impactNorm: 0,
      likelihoodNorm: 0,
      effortEaseNorm: 0,
      evidenceNorm: 0,
    };
  }

  const impactNorm = path.impact / 5;
  const likelihoodNorm = likelihoodValue[path.likelihood];
  // Lower effort (easier) → higher ease contribution.
  const effortEaseNorm = (6 - path.effort) / 5;
  const evidenceNorm = evidenceValue[path.evidenceConfidence];

  const impactPart = SCORE_WEIGHTS.impact * impactNorm;
  const likelihoodPart = SCORE_WEIGHTS.likelihood * likelihoodNorm;
  const effortPart = SCORE_WEIGHTS.effortEase * effortEaseNorm;
  const evidencePart = SCORE_WEIGHTS.evidence * evidenceNorm;

  const total = Math.round((impactPart + likelihoodPart + effortPart + evidencePart) * 100);

  return {
    total,
    impactPart,
    likelihoodPart,
    effortPart,
    evidencePart,
    impactNorm,
    likelihoodNorm,
    effortEaseNorm,
    evidenceNorm,
  };
}

/** Paths sorted by descending demo priority score (rejected paths last). */
export function rankedPaths(paths: AttackPath[]): AttackPath[] {
  return [...paths].sort((a, b) => scorePath(b).total - scorePath(a).total);
}
