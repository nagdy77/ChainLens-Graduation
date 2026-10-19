import { SCORE_WEIGHTS } from '../../data/scoring';
import type { ScoreBreakdown } from '../../data/scoring';

export function ScoreTooltipContent({ breakdown }: { breakdown: ScoreBreakdown }) {
  const rows = [
    { label: 'Impact', weight: SCORE_WEIGHTS.impact, norm: breakdown.impactNorm, part: breakdown.impactPart },
    { label: 'Likelihood', weight: SCORE_WEIGHTS.likelihood, norm: breakdown.likelihoodNorm, part: breakdown.likelihoodPart },
    { label: 'Effort (ease)', weight: SCORE_WEIGHTS.effortEase, norm: breakdown.effortEaseNorm, part: breakdown.effortPart },
    { label: 'Evidence', weight: SCORE_WEIGHTS.evidence, norm: breakdown.evidenceNorm, part: breakdown.evidencePart },
  ];
  return (
    <div className="text-left">
      <div className="mb-1.5 font-semibold text-text">Demo priority score — how it's computed</div>
      <p className="mb-2 text-faint">
        Illustrative ranking aid, not a validated security metric. Weighted sum, scaled 0–100.
      </p>
      <table className="w-full text-[10.5px]">
        <thead>
          <tr className="text-faint">
            <th className="text-left font-normal">Factor</th>
            <th className="text-right font-normal">Weight</th>
            <th className="text-right font-normal">Value</th>
            <th className="text-right font-normal">= Contribution</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="text-muted">
              <td className="py-0.5">{r.label}</td>
              <td className="text-right tabular-nums">{Math.round(r.weight * 100)}%</td>
              <td className="text-right tabular-nums">{r.norm.toFixed(2)}</td>
              <td className="text-right tabular-nums text-text">{Math.round(r.part * 100)}</td>
            </tr>
          ))}
          <tr className="border-t border-border font-semibold text-text">
            <td className="pt-1" colSpan={3}>Total</td>
            <td className="pt-1 text-right tabular-nums">{breakdown.total}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
