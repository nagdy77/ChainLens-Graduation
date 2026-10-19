import { useMemo, useState } from 'react';
import { Route, SlidersHorizontal, X } from 'lucide-react';
import { attackPaths } from '../data/mockData';
import { rankedPaths, scorePath } from '../data/scoring';
import { useApp } from '../state/AppContext';
import { PathCard } from '../components/paths/PathCard';
import { PathDetail } from '../components/paths/PathDetail';
import { MitigationSimulator } from '../components/paths/MitigationSimulator';
import { Segmented, Badge, EmptyState, Button, SectionLabel } from '../components/ui';
import type { Likelihood, Confidence } from '../data/types';
import { cn } from '../lib/cn';

type FeasView = 'all' | 'feasible' | 'rejected';
type SortKey = 'score' | 'impact' | 'effort';

export function AttackPaths() {
  const { selectedPathId, selectPath, blockedPathIds } = useApp();
  const [feas, setFeas] = useState<FeasView>('all');
  const [likeFilter, setLikeFilter] = useState<Set<Likelihood>>(new Set());
  const [evFilter, setEvFilter] = useState<Set<Confidence>>(new Set());
  const [minImpact, setMinImpact] = useState(1);
  const [onlyCrossings, setOnlyCrossings] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('score');

  const selectedPath = selectedPathId ? attackPaths.find((p) => p.id === selectedPathId) : null;

  const filtered = useMemo(() => {
    let rows = attackPaths.filter((p) => {
      if (feas === 'feasible' && p.feasibility === 'rejected') return false;
      if (feas === 'rejected' && p.feasibility !== 'rejected') return false;
      if (likeFilter.size && !likeFilter.has(p.likelihood)) return false;
      if (evFilter.size && !evFilter.has(p.evidenceConfidence)) return false;
      if (p.impact < minImpact) return false;
      if (onlyCrossings && p.zonesCrossed.length < 2) return false;
      return true;
    });
    if (sortKey === 'score') rows = rankedPaths(rows);
    else if (sortKey === 'impact') rows = [...rows].sort((a, b) => b.impact - a.impact);
    else rows = [...rows].sort((a, b) => a.effort - b.effort);
    return rows;
  }, [feas, likeFilter, evFilter, minImpact, onlyCrossings, sortKey]);

  const toggle = <T,>(set: Set<T>, v: T, setter: (s: Set<T>) => void) => {
    const next = new Set(set);
    next.has(v) ? next.delete(v) : next.add(v);
    setter(next);
  };

  const activeFilters =
    (feas !== 'all' ? 1 : 0) + likeFilter.size + evFilter.size + (minImpact > 1 ? 1 : 0) + (onlyCrossings ? 1 : 0);

  // Detail view
  if (selectedPath) {
    return <PathDetail path={selectedPath} onBack={() => selectPath(null)} />;
  }

  // compute ranks only among feasible for display
  const feasibleRanked = rankedPaths(attackPaths.filter((p) => p.feasibility === 'feasible'));
  const rankOf = (id: string) => {
    const i = feasibleRanked.findIndex((p) => p.id === id);
    return i >= 0 ? i + 1 : undefined;
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-[1440px] px-6 py-6">
        {/* Header */}
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-text">Attack Paths</h1>
            <p className="mt-1 text-[13px] text-muted">
              Inferred multi-stage chains built from confirmed findings. Ranked by an illustrative demo priority score.
            </p>
          </div>
          <Badge tone="violet" dot>
            Inferred possibilities — not confirmed exploitation
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* List column */}
          <div className="lg:col-span-8">
            {/* Filter bar */}
            <div className="mb-4 rounded-xl border border-border bg-panel p-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <SlidersHorizontal size={14} className="text-muted" />
                  <span className="text-[11px] uppercase tracking-wide text-faint">Filter</span>
                </div>
                <Segmented
                  size="sm"
                  value={feas}
                  onChange={setFeas}
                  options={[
                    { value: 'all', label: `All (${attackPaths.length})` },
                    { value: 'feasible', label: 'Feasible' },
                    { value: 'rejected', label: 'Rejected' },
                  ]}
                />

                <div className="ml-auto flex items-center gap-1.5">
                  <span className="text-[11px] text-faint">Sort</span>
                  <Segmented
                    size="sm"
                    value={sortKey}
                    onChange={setSortKey}
                    options={[
                      { value: 'score', label: 'Score' },
                      { value: 'impact', label: 'Impact' },
                      { value: 'effort', label: 'Effort' },
                    ]}
                  />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2.5">
                <FilterRow label="Likelihood">
                  {(['elevated', 'moderate', 'low'] as Likelihood[]).map((l) => (
                    <Chip key={l} active={likeFilter.has(l)} onClick={() => toggle(likeFilter, l, setLikeFilter)}>
                      {l}
                    </Chip>
                  ))}
                </FilterRow>
                <FilterRow label="Evidence">
                  {(['high', 'moderate', 'low'] as Confidence[]).map((c) => (
                    <Chip key={c} active={evFilter.has(c)} onClick={() => toggle(evFilter, c, setEvFilter)}>
                      {c}
                    </Chip>
                  ))}
                </FilterRow>
                <FilterRow label="Min impact">
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={minImpact}
                      onChange={(e) => setMinImpact(Number(e.target.value))}
                      className="h-1.5 w-24 cursor-pointer accent-cyan"
                    />
                    <span className="w-8 text-[12px] font-semibold text-text tabular-nums">{minImpact}+</span>
                  </div>
                </FilterRow>
                <Chip active={onlyCrossings} onClick={() => setOnlyCrossings((v) => !v)}>
                  Crosses ≥2 zones
                </Chip>
                {activeFilters > 0 && (
                  <button
                    onClick={() => {
                      setFeas('all');
                      setLikeFilter(new Set());
                      setEvFilter(new Set());
                      setMinImpact(1);
                      setOnlyCrossings(false);
                    }}
                    className="inline-flex items-center gap-1 text-[12px] text-muted hover:text-text"
                  >
                    <X size={13} /> Clear ({activeFilters})
                  </button>
                )}
              </div>
            </div>

            {/* Results */}
            <div className="mb-2 text-[12px] text-muted">
              Showing <span className="font-semibold text-text">{filtered.length}</span> of {attackPaths.length} paths
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                icon={<Route size={34} />}
                title="No paths match these filters"
                description="Relax the filters to see more candidate chains, including rejected ones."
                action={
                  <Button
                    variant="default"
                    onClick={() => {
                      setFeas('all');
                      setLikeFilter(new Set());
                      setEvFilter(new Set());
                      setMinImpact(1);
                      setOnlyCrossings(false);
                    }}
                  >
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <div className="space-y-3">
                {filtered.map((p) => (
                  <PathCard
                    key={p.id}
                    path={p}
                    rank={sortKey === 'score' ? rankOf(p.id) : undefined}
                    blocked={blockedPathIds.has(p.id) && p.feasibility === 'feasible'}
                    onOpen={() => selectPath(p.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar: mitigation simulator */}
          <div className="lg:col-span-4">
            <div className="sticky top-4 space-y-4">
              <MitigationSimulator />
              <div className="rounded-xl border border-border bg-panel p-4">
                <SectionLabel className="mb-2">How scoring works</SectionLabel>
                <p className="text-[12px] leading-relaxed text-muted">
                  The demo priority score blends estimated impact (40%), likelihood (25%), effort as ease (20%), and
                  evidence confidence (15%). Hover any score to see the exact breakdown. Rejected paths are excluded
                  from ranking.
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {rankedPaths(attackPaths.filter((p) => p.feasibility === 'feasible')).map((p, i) => (
                    <button
                      key={p.id}
                      onClick={() => selectPath(p.id)}
                      className={cn(
                        'rounded-md border px-2 py-1 text-[11px] hover:border-cyan/40',
                        'border-border bg-surface text-muted',
                      )}
                      title={`${p.title} · score ${scorePath(p).total}`}
                    >
                      #{i + 1} {p.id}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[11px] uppercase tracking-wide text-faint">{label}</span>
      <div className="flex items-center gap-1.5">{children}</div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-md border px-2 py-1 text-[11.5px] font-medium capitalize transition-colors',
        active ? 'border-cyan/50 bg-cyan/10 text-cyan' : 'border-border bg-surface text-muted hover:text-text',
      )}
    >
      {children}
    </button>
  );
}
