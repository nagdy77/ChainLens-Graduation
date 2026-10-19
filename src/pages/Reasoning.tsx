import { useState } from 'react';
import {
  GitCompareArrows,
  ShieldCheck,
  Sparkles,
  Check,
  X,
  Minus,
  Ban,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { attackPaths, pathById } from '../data/mockData';
import type { AttackPath, CheckResult } from '../data/types';
import { Card, CardHeader, Badge, Mono, SectionLabel, Button } from '../components/ui';
import { useApp } from '../state/AppContext';
import { cn } from '../lib/cn';

const agreementMeta = {
  agreement: { label: 'Agreement', tone: 'success' as const, icon: CheckCircle2, text: 'Deterministic checks pass and the simulated LLM agrees the chain is feasible.' },
  'needs-review': { label: 'Needs review', tone: 'warning' as const, icon: AlertTriangle, text: 'Deterministic checks pass, but the LLM flags assumptions that need human review.' },
  rejected: { label: 'Rejected by deterministic check', tone: 'critical' as const, icon: Ban, text: 'A hard constraint failed. The LLM does not override it — the path is rejected.' },
};

const checkIcon: Record<CheckResult, React.ReactNode> = {
  pass: <Check size={12} className="text-success" />,
  fail: <X size={12} className="text-critical" />,
  'n/a': <Minus size={12} className="text-faint" />,
};

export function Reasoning() {
  // default to the explicit rejection example
  const [currentId, setCurrentId] = useState<string>('AP-06');
  const current = pathById(currentId)!;
  const rejectionExample = pathById('AP-06')!;

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-[1440px] px-6 py-6">
        {/* Header */}
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-text">Reasoning Comparison</h1>
            <p className="mt-1 max-w-3xl text-[13px] text-muted">
              Deterministic graph analysis runs first and gates every candidate. The simulated LLM layer explains and
              ranks surviving paths — it never silently overrides a failed hard constraint.
            </p>
          </div>
          <Badge tone="violet" dot>
            Likelihood is an illustrative expert-style assessment
          </Badge>
        </div>

        {/* Explicit rejection example callout */}
        <Card className="mb-5 border-critical/30">
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-critical/40 bg-critical/10 text-critical">
              <Ban size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-[14px] font-semibold text-text">Worked example — rejected on a hard constraint</h3>
                <Mono className="text-[11px] text-critical">{rejectionExample.id}</Mono>
              </div>
              <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
                <span className="font-medium text-text">{rejectionExample.title}.</span> {rejectionExample.rejectionReason}
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <Badge tone="critical" dot>Network reachability: fail</Badge>
                <span className="text-[11px] text-muted">
                  The simulated LLM is not consulted for ranking — a missing network relationship cannot be reasoned away.
                </span>
                <Button size="sm" variant="ghost" onClick={() => setCurrentId('AP-06')}>
                  Inspect below <ArrowRight size={13} />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Path selector */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <SectionLabel>Compare a path</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {attackPaths.map((p) => (
              <button
                key={p.id}
                onClick={() => setCurrentId(p.id)}
                className={cn(
                  'rounded-md border px-2 py-1 font-mono text-[11px] transition-colors',
                  currentId === p.id
                    ? 'border-cyan/50 bg-cyan/10 text-cyan'
                    : p.feasibility === 'rejected'
                      ? 'border-critical/30 bg-surface text-critical/80 hover:text-critical'
                      : 'border-border bg-surface text-muted hover:text-text',
                )}
                title={p.title}
              >
                {p.id}
              </button>
            ))}
          </div>
        </div>

        {/* Side-by-side comparison */}
        <ComparisonView path={current} />

        {/* Evaluation table */}
        <Card className="mt-6">
          <CardHeader
            title="Evaluation table"
            subtitle="Deterministic result vs simulated LLM assessment for every candidate"
            icon={<GitCompareArrows size={15} />}
          />
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-[12.5px]">
              <thead>
                <tr className="border-b border-border bg-surface/60 text-[11px] uppercase tracking-wide text-faint">
                  <th className="px-4 py-2.5 font-medium">Path ID</th>
                  <th className="px-4 py-2.5 font-medium">Deterministic result</th>
                  <th className="px-4 py-2.5 font-medium">Simulated LLM assessment</th>
                  <th className="px-4 py-2.5 font-medium">Agreement</th>
                  <th className="px-4 py-2.5 font-medium">Explanation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {attackPaths.map((p) => {
                  const failed = p.checks.filter((c) => c.result === 'fail');
                  const meta = agreementMeta[p.llm.agreement];
                  return (
                    <tr
                      key={p.id}
                      className="cursor-pointer bg-panel align-top transition-colors hover:bg-surface/50"
                      onClick={() => setCurrentId(p.id)}
                    >
                      <td className="px-4 py-3">
                        <Mono className="text-cyan">{p.id}</Mono>
                      </td>
                      <td className="px-4 py-3">
                        {failed.length === 0 ? (
                          <Badge tone="success" dot>All checks pass</Badge>
                        ) : (
                          <Badge tone="critical" dot>{failed.map((c) => c.label).join(', ')} failed</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-muted">
                          {p.feasibility === 'rejected' ? 'Not ranked (rejected)' : `Feasible · ${p.likelihood} likelihood`}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={meta.tone}>{meta.label}</Badge>
                      </td>
                      <td className="max-w-[360px] px-4 py-3">
                        <span className="text-[12px] leading-snug text-muted">
                          {p.feasibility === 'rejected' ? p.rejectionReason : p.llm.rankingRationale}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t border-border px-4 py-2.5 text-[11px] text-faint">
            Click any row to load that path into the side-by-side comparison above.
          </div>
        </Card>
      </div>
    </div>
  );
}

function ComparisonView({ path }: { path: AttackPath }) {
  const { selectPath, setView } = useApp();
  const meta = agreementMeta[path.llm.agreement];
  const MetaIcon = meta.icon;
  const failed = path.checks.filter((c) => c.result === 'fail');

  return (
    <div>
      {/* verdict banner */}
      <div
        className={cn(
          'mb-3 flex items-center gap-3 rounded-xl border px-4 py-3',
          meta.tone === 'success' && 'border-success/40 bg-success/10',
          meta.tone === 'warning' && 'border-warning/40 bg-warning/10',
          meta.tone === 'critical' && 'border-critical/40 bg-critical/10',
        )}
      >
        <MetaIcon
          size={18}
          className={cn(
            meta.tone === 'success' && 'text-success',
            meta.tone === 'warning' && 'text-warning',
            meta.tone === 'critical' && 'text-critical',
          )}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-text">{meta.label}</span>
            <Mono className="text-[11px] text-faint">{path.id}</Mono>
            <span className="truncate text-[12px] text-muted">· {path.title}</span>
          </div>
          <p className="mt-0.5 text-[12px] text-muted">{meta.text}</p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            selectPath(path.id);
            setView('paths');
          }}
        >
          Open path <ArrowRight size={13} />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Deterministic */}
        <Card>
          <CardHeader
            title="Deterministic graph analysis"
            subtitle="Hard constraints — pass/fail gates ranking"
            icon={<ShieldCheck size={15} className="text-cyan" />}
          />
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
          <div
            className={cn(
              'flex items-center gap-2 border-t border-border px-4 py-2.5 text-[12px]',
              failed.length ? 'text-critical' : 'text-success',
            )}
          >
            {failed.length ? <Ban size={14} /> : <Check size={14} />}
            {failed.length
              ? `${failed.length} hard constraint${failed.length > 1 ? 's' : ''} failed → candidate rejected.`
              : 'All hard constraints satisfied → eligible for ranking.'}
          </div>
        </Card>

        {/* LLM */}
        <Card className="border-violet/30">
          <CardHeader
            title="Simulated LLM-assisted analysis"
            subtitle="Context, estimates and rationale"
            icon={<Sparkles size={15} className="text-violet" />}
          />
          <div className="space-y-3 p-4">
            {path.feasibility === 'rejected' ? (
              <div className="rounded-lg border border-critical/30 bg-critical/5 px-3 py-2.5">
                <p className="text-[12.5px] leading-relaxed text-muted">{path.llm.feasibilityExplanation}</p>
                <p className="mt-2 text-[11.5px] font-medium text-critical">
                  The LLM layer defers to the deterministic rejection and does not produce a ranking.
                </p>
              </div>
            ) : (
              <p className="text-[12.5px] leading-relaxed text-text">{path.llm.feasibilityExplanation}</p>
            )}

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Aspect label="Feasibility explanation" value={path.llm.feasibilityExplanation} full />
              <Aspect label="Estimated effort" value={path.llm.estimatedEffort} />
              <Aspect label="Estimated impact" value={path.llm.estimatedImpact} />
              <Aspect label="Qualitative likelihood" value={path.feasibility === 'rejected' ? 'Not assessed' : `${path.likelihood} — ${path.llm.likelihoodRationale}`} full />
              <Aspect label="Ranking rationale" value={path.llm.rankingRationale} full />
            </div>

            {path.llm.contextualAssumptions.length > 0 && (
              <div>
                <SectionLabel className="mb-1.5">Contextual assumptions</SectionLabel>
                <ul className="space-y-1">
                  {path.llm.contextualAssumptions.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12px] text-muted">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-violet" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Aspect({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={cn('rounded-lg border border-border bg-surface/40 px-3 py-2', full && 'sm:col-span-2')}>
      <div className="text-[10px] uppercase tracking-wide text-faint">{label}</div>
      <div className="mt-0.5 text-[12px] leading-snug text-muted">{value}</div>
    </div>
  );
}
