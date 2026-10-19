import { useEffect, useMemo, useState } from 'react';
import { Search, UploadCloud, ArrowUpDown, ListChecks, X } from 'lucide-react';
import { findings, assetById, allSources } from '../data/mockData';
import type { Finding, Severity, ConfirmationStatus } from '../data/types';
import { SeverityBadge, StatusBadge, ConfidenceBadge, Button, Mono, EmptyState } from '../components/ui';
import { EvidenceDrawer } from '../components/findings/EvidenceDrawer';
import { ImportModal } from '../components/findings/ImportModal';
import { useApp } from '../state/AppContext';
import { cn } from '../lib/cn';

const severityRank: Record<Severity, number> = { critical: 4, high: 3, medium: 2, low: 1 };
type SortKey = 'id' | 'severity' | 'lastObserved';

export function Findings() {
  const { focusEntityId, consumeFocusEntity } = useApp();
  const [query, setQuery] = useState('');
  const [sevFilter, setSevFilter] = useState<Set<Severity>>(new Set());
  const [sourceFilter, setSourceFilter] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<Set<ConfirmationStatus>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>('severity');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selected, setSelected] = useState<Finding | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  // open drawer for a finding focused via global search
  useEffect(() => {
    if (focusEntityId) {
      const f = findings.find((x) => x.id === focusEntityId);
      if (f) setSelected(f);
      consumeFocusEntity();
    }
  }, [focusEntityId, consumeFocusEntity]);

  const toggle = <T,>(set: Set<T>, val: T, setter: (s: Set<T>) => void) => {
    const next = new Set(set);
    next.has(val) ? next.delete(val) : next.add(val);
    setter(next);
  };

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const rows = findings.filter((f) => {
      if (term) {
        const hay = `${f.id} ${f.title} ${assetById(f.assetId)?.name ?? ''} ${f.source}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      if (sevFilter.size && !sevFilter.has(f.severity)) return false;
      if (sourceFilter.size && !sourceFilter.has(f.source)) return false;
      if (statusFilter.size && !statusFilter.has(f.status)) return false;
      return true;
    });
    rows.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'id') cmp = a.id.localeCompare(b.id);
      else if (sortKey === 'severity') cmp = severityRank[a.severity] - severityRank[b.severity];
      else if (sortKey === 'lastObserved') cmp = a.lastObserved.localeCompare(b.lastObserved);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return rows;
  }, [query, sevFilter, sourceFilter, statusFilter, sortKey, sortDir]);

  const setSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir(key === 'id' ? 'asc' : 'desc');
    }
  };

  const activeFilters = sevFilter.size + sourceFilter.size + statusFilter.size;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border bg-panel px-6 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-text">Findings & Evidence</h1>
            <p className="mt-1 text-[13px] text-muted">
              {findings.length} confirmed observations. Severity and evidence confidence are tracked separately.
            </p>
          </div>
          <Button variant="primary" onClick={() => setImportOpen(true)}>
            <UploadCloud size={15} /> Import findings
          </Button>
        </div>

        {/* Controls */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px] flex-1 max-w-sm">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search findings…"
              className="h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-[13px] text-text placeholder:text-faint focus:border-cyan/50 focus:outline-none"
            />
          </div>

          <FilterGroup label="Severity">
            {(['medium', 'low'] as Severity[]).map((s) => (
              <Chip key={s} active={sevFilter.has(s)} onClick={() => toggle(sevFilter, s, setSevFilter)} className="capitalize">
                {s}
              </Chip>
            ))}
          </FilterGroup>

          <FilterGroup label="Status">
            {(['confirmed', 'inferred', 'assumed'] as ConfirmationStatus[]).map((s) => (
              <Chip key={s} active={statusFilter.has(s)} onClick={() => toggle(statusFilter, s, setStatusFilter)} className="capitalize">
                {s}
              </Chip>
            ))}
          </FilterGroup>

          {activeFilters > 0 && (
            <button
              onClick={() => {
                setSevFilter(new Set());
                setSourceFilter(new Set());
                setStatusFilter(new Set());
              }}
              className="inline-flex items-center gap-1 text-[12px] text-muted hover:text-text"
            >
              <X size={13} /> Clear ({activeFilters})
            </button>
          )}
        </div>

        {/* Source filter row */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[11px] uppercase tracking-wide text-faint">Source</span>
          {allSources.map((s) => {
            const count = findings.filter((f) => f.source === s).length;
            return (
              <Chip key={s} active={sourceFilter.has(s)} onClick={() => toggle(sourceFilter, s, setSourceFilter)}>
                {s} <span className="text-faint">·{count}</span>
              </Chip>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="min-h-0 flex-1 overflow-auto px-6 py-4">
        <div className="mb-2 text-[12px] text-muted">
          Showing <span className="font-semibold text-text">{filtered.length}</span> of {findings.length} findings
        </div>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<ListChecks size={34} />}
            title="No findings match your filters"
            description="Try removing a filter or clearing your search to see the full confirmed dataset."
            action={
              <Button
                variant="default"
                onClick={() => {
                  setQuery('');
                  setSevFilter(new Set());
                  setSourceFilter(new Set());
                  setStatusFilter(new Set());
                }}
              >
                Clear all filters
              </Button>
            }
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-surface/60 text-[11px] uppercase tracking-wide text-faint">
                  <Th onClick={() => setSort('id')} sortable active={sortKey === 'id'} dir={sortDir}>ID</Th>
                  <th className="px-3 py-2.5 font-medium">Finding</th>
                  <th className="px-3 py-2.5 font-medium">Affected asset</th>
                  <th className="px-3 py-2.5 font-medium">Source</th>
                  <Th onClick={() => setSort('severity')} sortable active={sortKey === 'severity'} dir={sortDir}>Severity</Th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                  <th className="px-3 py-2.5 font-medium">Confidence</th>
                  <Th onClick={() => setSort('lastObserved')} sortable active={sortKey === 'lastObserved'} dir={sortDir}>Last observed</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((f) => (
                  <tr
                    key={f.id}
                    tabIndex={0}
                    onClick={() => setSelected(f)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelected(f);
                      }
                    }}
                    className="cursor-pointer bg-panel text-[13px] transition-colors hover:bg-surface/60 focus:bg-surface/60"
                  >
                    <td className="px-3 py-3"><Mono className="text-[11.5px] text-cyan">{f.id}</Mono></td>
                    <td className="px-3 py-3">
                      <div className="max-w-[260px] truncate font-medium text-text" title={f.title}>{f.title}</div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <Mono className="text-[10.5px] text-faint">{f.assetId}</Mono>
                        <span className="truncate text-muted">{assetById(f.assetId)?.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3"><span className="text-[12px] text-muted">{f.source}</span></td>
                    <td className="px-3 py-3"><SeverityBadge severity={f.severity} /></td>
                    <td className="px-3 py-3"><StatusBadge status={f.status} /></td>
                    <td className="px-3 py-3"><ConfidenceBadge confidence={f.confidence} /></td>
                    <td className="px-3 py-3"><Mono className="text-[11.5px] text-muted">{f.lastObserved}</Mono></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && <EvidenceDrawer finding={selected} onClose={() => setSelected(null)} />}
      {importOpen && <ImportModal onClose={() => setImportOpen(false)} />}
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[11px] uppercase tracking-wide text-faint">{label}</span>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-md border px-2 py-1 text-[11.5px] font-medium transition-colors',
        active ? 'border-cyan/50 bg-cyan/10 text-cyan' : 'border-border bg-surface text-muted hover:text-text',
        className,
      )}
    >
      {children}
    </button>
  );
}

function Th({
  children,
  onClick,
  sortable,
  active,
  dir,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  sortable?: boolean;
  active?: boolean;
  dir?: 'asc' | 'desc';
}) {
  return (
    <th className="px-3 py-2.5 font-medium">
      {sortable ? (
        <button onClick={onClick} className={cn('inline-flex items-center gap-1 hover:text-text', active && 'text-text')}>
          {children}
          <ArrowUpDown size={11} className={cn(active ? 'text-cyan' : 'text-faint')} />
          {active && <span className="sr-only">{dir === 'asc' ? 'ascending' : 'descending'}</span>}
        </button>
      ) : (
        children
      )}
    </th>
  );
}
