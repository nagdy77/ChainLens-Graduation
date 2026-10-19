import {
  Boxes,
  ShieldAlert,
  Route,
  CircleCheckBig,
  ArrowRight,
  Sparkles,
  Activity as ActivityIcon,
  Database,
  GitCompareArrows,
  Workflow,
  Lightbulb,
} from 'lucide-react';
import { GraphCanvas } from '../components/graph/GraphCanvas';
import { Card, CardHeader, Badge, Button, FeasibilityBadge, Meter, Mono, SectionLabel } from '../components/ui';
import {
  assets,
  findings,
  attackPaths,
  activity,
  allSources,
  assetById,
} from '../data/mockData';
import { rankedPaths, scorePath } from '../data/scoring';
import { useApp } from '../state/AppContext';
import type { Severity } from '../data/types';
import { cn } from '../lib/cn';

const severityColor: Record<Severity, string> = {
  critical: '#fb7185',
  high: '#fb7185',
  medium: '#fbbf24',
  low: '#38bdf8',
};

export function Overview() {
  const { setView, selectPath, selectNode, focusEntity } = useApp();

  const feasible = attackPaths.filter((p) => p.feasibility === 'feasible');
  const rejected = attackPaths.filter((p) => p.feasibility === 'rejected');
  const ranked = rankedPaths(feasible);
  const top3 = ranked.slice(0, 3);
  const topPath = ranked[0];

  const stats = [
    { label: 'Assets modeled', value: assets.length, icon: Boxes, tone: 'cyan' as const, sub: 'across 5 trust zones' },
    { label: 'Confirmed findings', value: findings.length, icon: ShieldAlert, tone: 'warning' as const, sub: '7 evidence sources' },
    { label: 'Candidate attack paths', value: attackPaths.length, icon: Route, tone: 'violet' as const, sub: 'inferred possibilities' },
    { label: 'Paths passing checks', value: feasible.length, icon: CircleCheckBig, tone: 'success' as const, sub: `${rejected.length} rejected deterministically` },
  ];

  const sevCounts: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  findings.forEach((f) => (sevCounts[f.severity] += 1));
  const sevOrder: Severity[] = ['critical', 'high', 'medium', 'low'];
  const maxSev = Math.max(...Object.values(sevCounts), 1);

  const sourceCounts = allSources.map((s) => ({
    source: s,
    count: findings.filter((f) => f.source === s).length,
  }));
  const maxSource = Math.max(...sourceCounts.map((s) => s.count), 1);

  const exploreTop = () => {
    if (topPath) {
      selectPath(topPath.id);
      setView('paths');
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-[1440px] px-6 py-6">
        {/* Page title */}
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-text">Overview</h1>
            <p className="mt-1 text-[13px] text-muted">
              Combined view of the modeled environment, confirmed findings, and inferred attack paths.
            </p>
          </div>
          <Badge tone="violet" dot>
            Predefined laboratory results — not measured research data
          </Badge>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => {
            const Icon = s.icon;
            const toneMap = {
              cyan: 'text-cyan border-cyan/30 bg-cyan/10',
              warning: 'text-warning border-warning/30 bg-warning/10',
              violet: 'text-violet border-violet/30 bg-violet/10',
              success: 'text-success border-success/30 bg-success/10',
            };
            return (
              <Card key={s.label} className="p-4">
                <div className="flex items-start justify-between">
                  <span className={cn('grid h-10 w-10 place-items-center rounded-lg border', toneMap[s.tone])}>
                    <Icon size={18} />
                  </span>
                </div>
                <div className="mt-3 text-[32px] font-bold leading-none tracking-tight text-text tabular-nums">
                  {s.value}
                </div>
                <div className="mt-1.5 text-[13px] font-medium text-text">{s.label}</div>
                <div className="text-[11.5px] text-muted">{s.sub}</div>
              </Card>
            );
          })}
        </div>

        {/* Main grid */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Left column */}
          <div className="space-y-4 lg:col-span-8">
            {/* Explore hero */}
            {topPath && (
              <Card className="relative overflow-hidden p-5">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan/[0.07] to-violet/[0.07]" />
                <div className="relative flex flex-wrap items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Sparkles size={15} className="text-cyan" />
                      <SectionLabel>Highest-ranked path</SectionLabel>
                    </div>
                    <h3 className="mt-2 text-[17px] font-semibold text-text">{topPath.title}</h3>
                    <p className="mt-1 text-[12.5px] text-muted">
                      <Mono className="text-cyan">{topPath.id}</Mono> · Demo priority score{' '}
                      <span className="font-semibold text-text">{scorePath(topPath).total}</span> · {topPath.steps.length} steps ·{' '}
                      {topPath.zonesCrossed.length} zones crossed
                    </p>
                  </div>
                  <Button variant="primary" onClick={exploreTop}>
                    Explore highest-ranked path
                    <ArrowRight size={15} />
                  </Button>
                </div>
              </Card>
            )}

            {/* Mini graph */}
            <Card className="overflow-hidden">
              <CardHeader
                title="Environment graph"
                subtitle="Miniature interactive model — assets, identities, privileges and dependencies"
                icon={<Workflow size={15} />}
                action={
                  <Button size="sm" variant="ghost" onClick={() => setView('graph')}>
                    Open full graph <ArrowRight size={13} />
                  </Button>
                }
              />
              <div className="h-[340px] w-full">
                <GraphCanvas
                  mode="mini"
                  showEdgeLabels={false}
                  showFindings={false}
                  onNodeClick={(id) => {
                    selectNode(id);
                    focusEntity(id);
                    setView('graph');
                  }}
                />
              </div>
            </Card>

            {/* Top 3 paths */}
            <Card>
              <CardHeader
                title="Top ranked attack paths"
                subtitle="Ordered by the illustrative demo priority score"
                icon={<Route size={15} />}
                action={
                  <Button size="sm" variant="ghost" onClick={() => setView('paths')}>
                    All paths <ArrowRight size={13} />
                  </Button>
                }
              />
              <div className="divide-y divide-border">
                {top3.map((p, i) => {
                  const score = scorePath(p);
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        selectPath(p.id);
                        setView('paths');
                      }}
                      className="flex w-full items-center gap-4 px-4 py-3.5 text-left hover:bg-surface/50"
                    >
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-surface-2 text-[13px] font-bold text-cyan">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Mono className="text-[10.5px] text-faint">{p.id}</Mono>
                          <FeasibilityBadge status={p.feasibility} />
                        </div>
                        <div className="mt-0.5 truncate text-[13px] font-medium text-text">{p.title}</div>
                        <div className="mt-0.5 truncate text-[11px] text-muted">
                          {assetById(p.startEntityId)?.name ?? p.startingAccess} → {assetById(p.targetAssetId)?.name}
                        </div>
                      </div>
                      <div className="w-28 shrink-0">
                        <div className="mb-1 text-right text-[11px] text-muted">
                          Score <span className="font-bold text-text tabular-nums">{score.total}</span>
                        </div>
                        <Meter value={score.total} max={100} tone="cyan" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Explanation */}
            <Card className="flex items-start gap-3 p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-violet/10 border border-violet/30 text-violet">
                <Lightbulb size={17} />
              </span>
              <div>
                <h4 className="text-[13px] font-semibold text-text">
                  Individual weaknesses can combine into a higher-impact attack path
                </h4>
                <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
                  Most findings here are individually low severity. CHAINLENS links confirmed findings through modeled
                  relationships, applies deterministic feasibility checks, and uses a simulated LLM layer to explain and
                  rank the surviving chains. The goal is defensive interpretation — understanding which combinations
                  matter most — not predicting undiscovered vulnerabilities.
                </p>
              </div>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-4 lg:col-span-4">
            {/* Severity distribution */}
            <Card>
              <CardHeader title="Finding severity distribution" subtitle="10 confirmed findings" icon={<ShieldAlert size={15} />} />
              <div className="space-y-3 p-4">
                {sevOrder.map((sev) => (
                  <div key={sev}>
                    <div className="mb-1 flex items-center justify-between text-[12px]">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ background: severityColor[sev] }} />
                        <span className="capitalize text-muted">{sev}</span>
                      </span>
                      <span className="font-semibold text-text tabular-nums">{sevCounts[sev]}</span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${(sevCounts[sev] / maxSev) * 100}%`, background: severityColor[sev] }}
                      />
                    </div>
                  </div>
                ))}
                <p className="pt-1 text-[11px] leading-relaxed text-faint">
                  Severity reflects each finding in isolation. Chained impact is assessed separately per path.
                </p>
              </div>
            </Card>

            {/* Source coverage */}
            <Card>
              <CardHeader title="Evidence-source coverage" subtitle="Findings per input source" icon={<Database size={15} />} />
              <div className="space-y-2.5 p-4">
                {sourceCounts.map((s) => (
                  <div key={s.source} className="flex items-center gap-3">
                    <span className="w-36 shrink-0 truncate text-[11.5px] text-muted" title={s.source}>
                      {s.source}
                    </span>
                    <div className="h-2 flex-1 rounded-full bg-surface-2 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan to-cyan/60"
                        style={{ width: `${(s.count / maxSource) * 100}%` }}
                      />
                    </div>
                    <span className="w-4 text-right text-[11.5px] font-semibold text-text tabular-nums">{s.count}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent activity */}
            <Card>
              <CardHeader title="Recent analysis activity" subtitle="Last simulated run" icon={<ActivityIcon size={15} />} />
              <ol className="relative p-4">
                <span className="absolute left-[25px] top-6 bottom-6 w-px bg-border" />
                {activity.map((a) => (
                  <li key={a.id} className="relative flex gap-3 pb-4 last:pb-0">
                    <span className="z-10 mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-cyan/40 bg-surface">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[12.5px] font-medium text-text">{a.label}</span>
                        <Mono className="text-[10px] text-faint">{a.time}</Mono>
                      </div>
                      <p className="text-[11.5px] leading-snug text-muted">{a.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Card>

            {/* Reasoning teaser */}
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <GitCompareArrows size={15} className="text-violet" />
                <SectionLabel>Deterministic + LLM</SectionLabel>
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-muted">
                Every path is checked by deterministic constraints first. The simulated LLM layer never overrides a
                failed hard constraint.
              </p>
              <Button size="sm" variant="ghost" className="mt-2 px-0" onClick={() => setView('reasoning')}>
                Compare reasoning <ArrowRight size={13} />
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
