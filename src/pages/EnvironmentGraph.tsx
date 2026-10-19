import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Filter,
  Maximize2,
  Eye,
  EyeOff,
  Layers,
  ShieldAlert,
  X,
  ChevronDown,
  Route,
  ArrowRight,
  MoveRight,
} from 'lucide-react';
import { GraphCanvas } from '../components/graph/GraphCanvas';
import { Legend } from '../components/graph/Legend';
import { NodeInspector } from '../components/graph/NodeInspector';
import { Button, Badge, Mono, SectionLabel } from '../components/ui';
import { useApp } from '../state/AppContext';
import { attackPaths, zones, zoneById, pathById } from '../data/mockData';
import { entityTypeLabel } from '../components/entityVisuals';
import type { EntityType, ZoneId } from '../data/types';
import { cn } from '../lib/cn';

const ALL_TYPES: EntityType[] = ['asset', 'identity', 'privilege', 'dependency', 'finding'];

export function EnvironmentGraph() {
  const {
    selectedNodeId,
    selectNode,
    selectedPathId,
    selectPath,
    brokenEdgeIds,
    focusEntityId,
    consumeFocusEntity,
  } = useApp();

  const [showInferred, setShowInferred] = useState(true);
  const [showZones, setShowZones] = useState(true);
  const [showFindings, setShowFindings] = useState(true);
  const [filterTypes, setFilterTypes] = useState<Set<EntityType>>(new Set(ALL_TYPES));
  const [filterZones, setFilterZones] = useState<Set<ZoneId>>(new Set(zones.map((z) => z.id)));
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [crossingsOpen, setCrossingsOpen] = useState(false);
  const [pathMenuOpen, setPathMenuOpen] = useState(false);
  const [fitKey, setFitKey] = useState(0);
  const [centerNode, setCenterNode] = useState<string | null>(null);

  const filtersRef = useRef<HTMLDivElement>(null);
  const pathMenuRef = useRef<HTMLDivElement>(null);

  const selectedPath = selectedPathId ? pathById(selectedPathId) : null;

  // Consume a focus request from global search
  useEffect(() => {
    if (focusEntityId) {
      setCenterNode(focusEntityId);
      selectNode(focusEntityId);
      consumeFocusEntity();
    }
  }, [focusEntityId, selectNode, consumeFocusEntity]);

  // close popovers on outside click
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(e.target as Node)) setFiltersOpen(false);
      if (pathMenuRef.current && !pathMenuRef.current.contains(e.target as Node)) setPathMenuOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const highlightNodeIds = useMemo(
    () => (selectedPath ? new Set(selectedPath.nodeIds) : undefined),
    [selectedPath],
  );
  const highlightEdgeIds = useMemo(
    () => (selectedPath ? new Set(selectedPath.edgeIds) : undefined),
    [selectedPath],
  );
  const stepIndexByNode = useMemo(() => {
    if (!selectedPath) return undefined;
    const map: Record<string, number> = {};
    selectedPath.steps.forEach((s) => {
      if (s.toEntityId && map[s.toEntityId] === undefined) map[s.toEntityId] = s.order;
      if (s.order === 1 && s.fromEntityId && map[s.fromEntityId] === undefined) map[s.fromEntityId] = 0 as number;
    });
    return map;
  }, [selectedPath]);

  const crossings = useMemo(() => {
    if (!selectedPath) return [];
    return selectedPath.steps.filter((s) => s.boundaryCrossing).map((s) => ({ step: s.order, ...s.boundaryCrossing! }));
  }, [selectedPath]);

  const toggleType = (t: EntityType) =>
    setFilterTypes((prev) => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  const toggleZone = (z: ZoneId) =>
    setFilterZones((prev) => {
      const next = new Set(prev);
      next.has(z) ? next.delete(z) : next.add(z);
      return next;
    });

  const filtersActive = filterTypes.size < ALL_TYPES.length || filterZones.size < zones.length;

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="z-20 flex flex-wrap items-center gap-2 border-b border-border bg-panel px-4 py-2.5">
        <div className="mr-1">
          <h1 className="text-[15px] font-bold tracking-tight text-text leading-none">Environment Graph</h1>
          <p className="mt-0.5 text-[11px] text-muted">Interactive model of assets, identities, privileges and dependencies</p>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {/* Path highlight selector */}
          <div ref={pathMenuRef} className="relative">
            <Button size="sm" variant={selectedPath ? 'violet' : 'default'} onClick={() => setPathMenuOpen((o) => !o)}>
              <Route size={14} />
              {selectedPath ? `Highlighting ${selectedPath.id}` : 'Highlight a path'}
              <ChevronDown size={13} />
            </Button>
            {pathMenuOpen && (
              <div className="absolute right-0 top-full z-40 mt-1.5 w-[320px] overflow-hidden rounded-xl border border-border bg-surface-2 shadow-2xl">
                <div className="border-b border-border px-3 py-2">
                  <SectionLabel>Select a path to highlight</SectionLabel>
                </div>
                <ul className="max-h-[320px] overflow-y-auto py-1">
                  {selectedPath && (
                    <li>
                      <button
                        onClick={() => {
                          selectPath(null);
                          setPathMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] text-muted hover:bg-surface"
                      >
                        <X size={13} /> Clear highlight
                      </button>
                    </li>
                  )}
                  {attackPaths.map((p) => (
                    <li key={p.id}>
                      <button
                        onClick={() => {
                          selectPath(p.id);
                          setPathMenuOpen(false);
                          setFitKey((k) => k + 1);
                        }}
                        className={cn(
                          'flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-surface',
                          selectedPathId === p.id && 'bg-surface',
                        )}
                      >
                        <Mono className="mt-0.5 text-[10px] text-faint">{p.id}</Mono>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12px] text-text">{p.title}</span>
                          <span className={cn('text-[10px]', p.feasibility === 'rejected' ? 'text-critical' : 'text-success')}>
                            {p.feasibility}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-1 rounded-lg border border-border bg-panel p-0.5">
            <ToggleBtn active={showInferred} onClick={() => setShowInferred((v) => !v)} icon={showInferred ? Eye : EyeOff} label="Inferred" title="Toggle inferred relationships" />
            <ToggleBtn active={showZones} onClick={() => setShowZones((v) => !v)} icon={Layers} label="Zones" title="Toggle trust-zone boundaries" />
            <ToggleBtn active={showFindings} onClick={() => setShowFindings((v) => !v)} icon={ShieldAlert} label="Findings" title="Toggle finding nodes" />
          </div>

          {/* Filters */}
          <div ref={filtersRef} className="relative">
            <Button size="sm" variant={filtersActive ? 'violet' : 'default'} onClick={() => setFiltersOpen((o) => !o)}>
              <Filter size={14} /> Filters
              {filtersActive && <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-violet" />}
            </Button>
            {filtersOpen && (
              <div className="absolute right-0 top-full z-40 mt-1.5 w-[260px] rounded-xl border border-border bg-surface-2 p-3 shadow-2xl">
                <SectionLabel className="mb-2">Entity types</SectionLabel>
                <div className="mb-3 space-y-1">
                  {ALL_TYPES.map((t) => (
                    <Check key={t} checked={filterTypes.has(t)} onChange={() => toggleType(t)} label={entityTypeLabel[t]} />
                  ))}
                </div>
                <SectionLabel className="mb-2">Trust zones</SectionLabel>
                <div className="space-y-1">
                  {zones.map((z) => (
                    <Check key={z.id} checked={filterZones.has(z.id)} onChange={() => toggleZone(z.id)} label={z.name} />
                  ))}
                </div>
                <button
                  onClick={() => {
                    setFilterTypes(new Set(ALL_TYPES));
                    setFilterZones(new Set(zones.map((z) => z.id)));
                  }}
                  className="mt-3 w-full rounded-lg border border-border bg-surface py-1.5 text-[11px] text-muted hover:text-text"
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>

          <Button size="sm" variant="default" onClick={() => setFitKey((k) => k + 1)} title="Fit graph to view">
            <Maximize2 size={14} /> Fit
          </Button>
        </div>
      </div>

      {/* Canvas + inspector */}
      <div className="relative flex min-h-0 flex-1">
        <div className="relative min-w-0 flex-1">
          <GraphCanvas
            mode="full"
            showInferred={showInferred}
            showZones={showZones}
            showEdgeLabels
            showFindings={showFindings}
            filterTypes={filterTypes}
            filterZones={filterZones}
            highlightNodeIds={highlightNodeIds}
            highlightEdgeIds={highlightEdgeIds}
            stepIndexByNode={stepIndexByNode}
            dimUnhighlighted={!!selectedPath}
            brokenEdgeIds={brokenEdgeIds}
            selectedNodeId={selectedNodeId}
            onNodeClick={(id) => selectNode(id)}
            onPaneClick={() => selectNode(null)}
            centerNodeId={centerNode}
            fitKey={fitKey}
          />

          {/* Highlight banner */}
          {selectedPath && (
            <div className="absolute left-4 top-4 z-10 max-w-[460px]">
              <div className="rounded-xl border border-cyan/40 bg-panel/95 backdrop-blur px-3.5 py-2.5 shadow-xl">
                <div className="flex items-center gap-2">
                  <Route size={14} className="text-cyan" />
                  <Mono className="text-[11px] text-cyan">{selectedPath.id}</Mono>
                  <span className="truncate text-[12.5px] font-medium text-text">{selectedPath.title}</span>
                  <button onClick={() => selectPath(null)} className="ml-1 text-faint hover:text-text" aria-label="Clear highlight">
                    <X size={14} />
                  </button>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <Badge tone="neutral">{selectedPath.steps.length} steps</Badge>
                  <Badge tone="neutral">{selectedPath.zonesCrossed.length} zones</Badge>
                  {crossings.length > 0 && (
                    <button
                      onClick={() => setCrossingsOpen((o) => !o)}
                      className="inline-flex items-center gap-1 rounded-md border border-violet/30 bg-violet/10 px-2 py-0.5 text-[11px] text-violet hover:bg-violet/20"
                    >
                      {crossings.length} boundary crossing{crossings.length > 1 ? 's' : ''}
                      <ChevronDown size={12} className={cn('transition-transform', crossingsOpen && 'rotate-180')} />
                    </button>
                  )}
                </div>

                {crossingsOpen && crossings.length > 0 && (
                  <div className="mt-2.5 space-y-2 border-t border-border pt-2.5">
                    {crossings.map((c, i) => (
                      <div key={i} className="rounded-lg border border-border bg-surface px-2.5 py-2">
                        <div className="flex items-center gap-1.5 text-[11.5px] font-medium text-text">
                          <span>{zoneById(c.fromZone)?.name}</span>
                          <MoveRight size={13} className="text-cyan" />
                          <span>{zoneById(c.toZone)?.name}</span>
                          <span className="ml-auto text-[10px] text-faint">step {c.step}</span>
                        </div>
                        <div className="mt-1 grid gap-0.5 text-[11px] text-muted">
                          <div>
                            <span className="text-faint">Allowed relationship: </span>
                            {c.allowedRelationship}
                          </div>
                          <div>
                            <span className="text-faint">Requires: </span>
                            {c.requiredIdentityOrPrivilege}
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button size="sm" variant="ghost" className="px-0" onClick={() => { /* already on graph */ }}>
                      <ArrowRight size={12} /> See full path breakdown in Attack Paths
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="absolute bottom-4 left-4 z-10 w-[280px]">
            <Legend />
          </div>
        </div>

        {/* Inspector */}
        {selectedNodeId && <NodeInspector nodeId={selectedNodeId} onClose={() => selectNode(null)} />}
      </div>
    </div>
  );
}

function ToggleBtn({
  active,
  onClick,
  icon: Icon,
  label,
  title,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Eye;
  label: string;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11.5px] font-medium transition-colors',
        active ? 'bg-surface-2 text-text' : 'text-faint hover:text-muted',
      )}
    >
      <Icon size={13} />
      {label}
    </button>
  );
}

function Check({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 hover:bg-surface">
      <span
        className={cn(
          'grid h-4 w-4 place-items-center rounded border transition-colors',
          checked ? 'border-cyan bg-cyan text-[#042029]' : 'border-border bg-surface',
        )}
      >
        {checked && (
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6.5L5 9L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <span className="text-[12px] text-muted">{label}</span>
    </label>
  );
}
