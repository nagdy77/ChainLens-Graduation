import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  X,
  Minus,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  MoveRight,
  KeyRound,
  UserRound,
  ChevronDown,
  Ban,
  Lightbulb,
  CircleHelp,
} from 'lucide-react';
import type { AttackPath, CheckResult, StepNature } from '../../data/types';
import { GraphCanvas } from '../graph/GraphCanvas';
import {
  Badge,
  FeasibilityBadge,
  LikelihoodBadge,
  Mono,
  SectionLabel,
  Card,
  CardHeader,
  Meter,
  Tooltip,
} from '../ui';
import { ScoreTooltipContent } from './ScoreTooltip';
import { scorePath } from '../../data/scoring';
import { findingById, zoneById, mitigationById, assetById } from '../../data/mockData';
import { useApp } from '../../state/AppContext';
import { cn } from '../../lib/cn';

const natureStyle: Record<StepNature, { label: string; tone: string; ring: string; dot: string }> = {
  confirmed: { label: 'Confirmed observation', tone: 'text-success', ring: 'border-success/40', dot: 'bg-success' },
  inferred: { label: 'Inferred transition', tone: 'text-cyan', ring: 'border-cyan/40', dot: 'bg-cyan' },
  assumed: { label: 'Required assumption', tone: 'text-warning', ring: 'border-warning/40', dot: 'bg-warning' },
};

const checkIcon: Record<CheckResult, React.ReactNode> = {
  pass: <Check size={13} className="text-success" />,
  fail: <X size={13} className="text-critical" />,
  'n/a': <Minus size={13} className="text-faint" />,
};

export function PathDetail({ path, onBack }: { path: AttackPath; onBack: () => void }) {
  const { brokenEdgeIds, blockedPathIds, setView } = useApp();
  const [scoreOpen, setScoreOpen] = useState(false);
  const score = scorePath(path);
  const rejected = path.feasibility === 'rejected';
  const blocked = blockedPathIds.has(path.id);

  const highlightNodeIds = useMemo(() => new Set(path.nodeIds), [path]);
  const highlightEdgeIds = useMemo(() => new Set(path.edgeIds), [path]);
  const stepIndexByNode = useMemo(() => {
    const map: Record<string, number> = {};
    path.steps.forEach((s) => {
      if (s.toEntityId && map[s.toEntityId] === undefined) map[s.toEntityId] = s.order;
    });
    const first = path.steps[0];
    if (first?.fromEntityId && map[first.fromEntityId] === undefined) map[first.fromEntityId] = 0;
    return map;
  }, [path]);

  const llmTone =
    path.llm.agreement === 'agreement' ? 'success' : path.llm.agreement === 'needs-review' ? 'warning' : 'critical';

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-[1440px] px-6 py-5">
        {/* Header */}
        <button onClick={onBack} className="mb-3 inline-flex items-center gap-1.5 text-[12.5px] text-muted hover:text-text">
          <ArrowLeft size={15} /> All attack paths
        </button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Mono className="text-[12px] text-cyan">{path.id}</Mono>
              <FeasibilityBadge status={path.feasibility} />
              {blocked && <Badge tone="success" dot>Blocked in current simulation</Badge>}
            </div>
            <h1 className="mt-1.5 text-xl font-bold tracking-tight text-text">{path.title}</h1>
            <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-muted">{path.scenario}</p>
          </div>

          {/* Score block */}
          {!rejected && (
            <div className="shrink-0">
              <div className="flex items-center gap-2 rounded-xl border border-border bg-panel px-4 py-3">
                <div>
                  <div className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-faint">
                    Demo priority score
                    <Tooltip content={<ScoreTooltipContent breakdown={score} />} side="bottom" />
                  </div>
                  <div className="text-[30px] font-bold leading-none text-text tabular-nums">{score.total}</div>
                </div>
                <button
                  onClick={() => setScoreOpen((o) => !o)}
                  className="ml-1 grid h-7 w-7 place-items-center rounded-lg border border-border text-muted hover:text-text"
                  aria-label="Toggle score weighting"
                >
                  <ChevronDown size={15} className={cn('transition-transform', scoreOpen && 'rotate-180')} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Score weighting expandable */}
        {scoreOpen && !rejected && (
          <Card className="mt-3 p-4">
            <SectionLabel className="mb-2">Score weighting (transparent, illustrative)</SectionLabel>
            <div className="grid gap-4 sm:grid-cols-4">
              {[
                { label: 'Impact', w: 40, n: score.impactNorm, c: score.impactPart },
                { label: 'Likelihood', w: 25, n: score.likelihoodNorm, c: score.likelihoodPart },
                { label: 'Effort (ease)', w: 20, n: score.effortEaseNorm, c: score.effortPart },
                { label: 'Evidence', w: 15, n: score.evidenceNorm, c: score.evidencePart },
              ].map((r) => (
                <div key={r.label} className="rounded-lg border border-border bg-surface/50 p-3">
                  <div className="text-[11px] text-muted">{r.label}</div>
                  <div className="text-[11px] text-faint">weight {r.w}% · value {r.n.toFixed(2)}</div>
                  <div className="mt-1 text-[18px] font-bold text-text tabular-nums">+{Math.round(r.c * 100)}</div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-faint">
              Total = Σ(weight × value) × 100. This is an illustrative ranking aid, not a calibrated probability or a
              validated security metric.
            </p>
          </Card>
        )}

        {/* Rejection callout */}
        {rejected && path.rejectionReason && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-critical/40 bg-critical/10 p-4">
            <Ban size={18} className="mt-0.5 shrink-0 text-critical" />
            <div>
              <h3 className="text-[13px] font-semibold text-critical">Rejected by deterministic check</h3>
              <p className="mt-1 text-[12.5px] leading-relaxed text-critical/90">{path.rejectionReason}</p>
            </div>
          </div>
        )}

        {/* Main grid */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Left */}
          <div className="space-y-4 lg:col-span-7">
            {/* Graph */}
            <Card className="overflow-hidden">
              <CardHeader title="Highlighted path" subtitle="Nodes and edges in this chain; the rest is dimmed" />
              <div className="h-[340px] w-full">
                <GraphCanvas
                  mode="path"
                  showEdgeLabels
                  showZones
                  showFindings={false}
                  highlightNodeIds={highlightNodeIds}
                  highlightEdgeIds={highlightEdgeIds}
                  stepIndexByNode={stepIndexByNode}
                  dimUnhighlighted
                  brokenEdgeIds={brokenEdgeIds}
                  fitKey={path.id}
                />
              </div>
            </Card>

            {/* Steps */}
            <Card>
              <CardHeader
                title="Step sequence"
                subtitle="Each step separates confirmed observation, inferred transition, and required assumption"
              />
              <div className="p-4">
                {/* nature legend */}
                <div className="mb-3 flex flex-wrap gap-3">
                  {(Object.keys(natureStyle) as StepNature[]).map((n) => (
                    <div key={n} className="flex items-center gap-1.5">
                      <span className={cn('h-2 w-2 rounded-full', natureStyle[n].dot)} />
                      <span className="text-[11px] text-muted">{natureStyle[n].label}</span>
                    </div>
                  ))}
                </div>

                <ol className="relative space-y-3 pl-1">
                  {path.steps.map((s) => {
                    const ns = natureStyle[s.nature];
                    return (
                      <li key={s.order} className={cn('rounded-xl border bg-surface/40 p-3.5', ns.ring)}>
                        <div className="flex items-start gap-3">
                          <span className={cn('grid h-7 w-7 shrink-0 place-items-center rounded-full border bg-surface text-[13px] font-bold', ns.ring, ns.tone)}>
                            {s.order}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[13.5px] font-semibold text-text">{s.title}</span>
                              <span className={cn('flex items-center gap-1 text-[10.5px] font-medium', ns.tone)}>
                                <span className={cn('h-1.5 w-1.5 rounded-full', ns.dot)} />
                                {ns.label}
                              </span>
                            </div>
                            <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{s.description}</p>

                            {/* transitions */}
                            {(s.identityTransition || s.privilegeTransition) && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {s.identityTransition && (
                                  <span className="inline-flex items-center gap-1.5 rounded-md border border-violet/30 bg-violet/10 px-2 py-1 text-[11px] text-violet">
                                    <UserRound size={11} /> {s.identityTransition}
                                  </span>
                                )}
                                {s.privilegeTransition && (
                                  <span className="inline-flex items-center gap-1.5 rounded-md border border-warning/30 bg-warning/10 px-2 py-1 text-[11px] text-warning">
                                    <KeyRound size={11} /> {s.privilegeTransition}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* findings */}
                            {s.findingIds.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {s.findingIds.map((fid) => {
                                  const f = findingById(fid);
                                  return (
                                    <button
                                      key={fid}
                                      onClick={() => setView('findings')}
                                      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-0.5 text-[10.5px] text-muted hover:border-critical/40"
                                      title={f?.title}
                                    >
                                      <Mono className="text-[9.5px] text-faint">{fid}</Mono>
                                      <span className="max-w-[160px] truncate">{f?.title}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}

                            {/* boundary crossing */}
                            {s.boundaryCrossing && (
                              <div className="mt-2 rounded-lg border border-border bg-bg px-2.5 py-2">
                                <div className="flex items-center gap-1.5 text-[11px] font-medium text-text">
                                  <span>{zoneById(s.boundaryCrossing.fromZone)?.name}</span>
                                  <MoveRight size={12} className="text-cyan" />
                                  <span>{zoneById(s.boundaryCrossing.toZone)?.name}</span>
                                  <Badge tone="violet" className="ml-1">boundary crossing</Badge>
                                </div>
                                <div className="mt-1 space-y-0.5 text-[11px] text-muted">
                                  <div><span className="text-faint">Allowed relationship: </span>{s.boundaryCrossing.allowedRelationship}</div>
                                  <div><span className="text-faint">Requires: </span>{s.boundaryCrossing.requiredIdentityOrPrivilege}</div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </Card>
          </div>

          {/* Right */}
          <div className="space-y-4 lg:col-span-5">
            {/* Assessment */}
            <Card>
              <CardHeader title="Assessment" subtitle="Illustrative, expert-style estimates" />
              <div className="grid grid-cols-2 gap-4 p-4">
                <div>
                  <div className="mb-1 text-[11px] text-muted">Estimated impact</div>
                  <Meter value={path.impact} tone="critical" label={`${path.impact}/5`} />
                </div>
                <div>
                  <div className="mb-1 text-[11px] text-muted">Estimated effort</div>
                  <Meter value={path.effort} tone="warning" label={`${path.effort}/5`} />
                </div>
                <div>
                  <div className="mb-1 text-[11px] text-muted">Likelihood</div>
                  <LikelihoodBadge likelihood={path.likelihood} />
                </div>
                <div>
                  <div className="mb-1 text-[11px] text-muted">Evidence confidence</div>
                  <Badge tone={path.evidenceConfidence === 'high' ? 'success' : path.evidenceConfidence === 'moderate' ? 'warning' : 'critical'}>
                    {path.evidenceConfidence}
                  </Badge>
                </div>
              </div>
              <div className="border-t border-border px-4 py-2.5 text-[11px] text-faint">
                Likelihood is an illustrative expert-style assessment, not a calibrated probability.
              </div>
            </Card>

            {/* Deterministic checks */}
            <Card>
              <CardHeader title="Deterministic validation" subtitle="Hard constraints evaluated before ranking" icon={<ShieldCheck size={15} />} />
              <ul className="divide-y divide-border">
                {path.checks.map((c) => (
                  <li key={c.id} className="flex items-start gap-2.5 px-4 py-2.5">
                    <span
                      className={cn(
                        'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border',
                        c.result === 'pass' ? 'border-success/40 bg-success/10' : c.result === 'fail' ? 'border-critical/40 bg-critical/10' : 'border-border bg-surface',
                      )}
                    >
                      {checkIcon[c.result]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[12.5px] font-medium text-text">{c.label}</span>
                        <span
                          className={cn(
                            'text-[10px] font-semibold uppercase',
                            c.result === 'pass' ? 'text-success' : c.result === 'fail' ? 'text-critical' : 'text-faint',
                          )}
                        >
                          {c.result}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] leading-snug text-muted">{c.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Simulated LLM */}
            <Card className="border-violet/30">
              <CardHeader
                title={
                  <span className="flex items-center gap-1.5">
                    Simulated LLM explanation
                    <Badge tone={llmTone}>{path.llm.agreement.replace('-', ' ')}</Badge>
                  </span>
                }
                subtitle="Context and rationale — never overrides a failed hard constraint"
                icon={<Sparkles size={15} className="text-violet" />}
              />
              <div className="space-y-3 p-4">
                <p className="text-[12.5px] leading-relaxed text-text">{path.llm.feasibilityExplanation}</p>
                <div className="grid grid-cols-1 gap-2">
                  <LlmRow label="Estimated effort" value={path.llm.estimatedEffort} />
                  <LlmRow label="Estimated impact" value={path.llm.estimatedImpact} />
                  <LlmRow label="Likelihood rationale" value={path.llm.likelihoodRationale} />
                  <LlmRow label="Ranking rationale" value={path.llm.rankingRationale} />
                </div>
                {path.llm.contextualAssumptions.length > 0 && (
                  <div>
                    <SectionLabel className="mb-1.5">Contextual assumptions</SectionLabel>
                    <ul className="space-y-1">
                      {path.llm.contextualAssumptions.map((a, i) => (
                        <li key={i} className="flex items-start gap-2 text-[12px] text-muted">
                          <CircleHelp size={12} className="mt-0.5 shrink-0 text-violet" />
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>

            {/* Preconditions */}
            <Card>
              <CardHeader title="Required preconditions" />
              <ul className="space-y-1.5 p-4">
                {path.preconditions.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12.5px] text-muted">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-faint" />
                    {p}
                  </li>
                ))}
              </ul>
            </Card>

            {/* Uncertainty */}
            <Card className="border-warning/30">
              <CardHeader title="Uncertainty & missing evidence" icon={<AlertTriangle size={15} className="text-warning" />} />
              <ul className="space-y-1.5 p-4">
                {path.missingEvidence.map((m, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12.5px] text-warning/90">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-warning" />
                    {m}
                  </li>
                ))}
              </ul>
            </Card>

            {/* Mitigations */}
            <Card>
              <CardHeader title="Suggested defensive mitigations" icon={<Lightbulb size={15} className="text-cyan" />} />
              <div className="space-y-2 p-4">
                {path.llm.defensiveMitigations.map((m, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-lg border border-border bg-surface/50 px-3 py-2 text-[12.5px] text-muted">
                    <ShieldCheck size={13} className="mt-0.5 shrink-0 text-success" />
                    {m}
                  </div>
                ))}
                {path.mitigations.length > 0 && (
                  <div className="mt-2 border-t border-border pt-2">
                    <SectionLabel className="mb-1.5">Mapped simulation levers</SectionLabel>
                    <div className="flex flex-wrap gap-1.5">
                      {path.mitigations.map((mid) => {
                        const m = mitigationById(mid);
                        return (
                          <button
                            key={mid}
                            onClick={() => setView('paths')}
                            className="rounded-md border border-border bg-surface px-2 py-1 text-[11px] text-cyan hover:border-cyan/40"
                            title={m?.label}
                          >
                            {mid}
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-[11px] text-faint">
                      Toggle these in “Simulate mitigation” on the Attack Paths list to see this path blocked.
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* target reference */}
            <div className="text-[11px] text-faint">
              Target asset: <Mono className="text-muted">{path.targetAssetId}</Mono> · {assetById(path.targetAssetId)?.name}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LlmRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface/40 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-faint">{label}</div>
      <div className="mt-0.5 text-[12px] leading-snug text-muted">{value}</div>
    </div>
  );
}
