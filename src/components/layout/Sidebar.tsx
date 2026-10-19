import {
  LayoutDashboard,
  Workflow,
  ListChecks,
  Route,
  GitCompareArrows,
  FileText,
  ChevronLeft,
  FlaskConical,
} from 'lucide-react';
import { cn } from '../../lib/cn';
import { useApp, type ViewId } from '../../state/AppContext';
import { attackPaths } from '../../data/mockData';

const NAV: { id: ViewId; label: string; icon: typeof LayoutDashboard; hint: string }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, hint: 'Summary & highlights' },
  { id: 'graph', label: 'Environment Graph', icon: Workflow, hint: 'Interactive model' },
  { id: 'findings', label: 'Findings & Evidence', icon: ListChecks, hint: 'Confirmed observations' },
  { id: 'paths', label: 'Attack Paths', icon: Route, hint: 'Inferred chains' },
  { id: 'reasoning', label: 'Reasoning Comparison', icon: GitCompareArrows, hint: 'Deterministic vs LLM' },
  { id: 'reports', label: 'Reports', icon: FileText, hint: 'Preview & export' },
];

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const { view, setView, selectPath } = useApp();
  const feasibleCount = attackPaths.filter((p) => p.feasibility === 'feasible').length;

  const counts: Partial<Record<ViewId, string>> = {
    findings: '10',
    paths: `${attackPaths.length}`,
    reasoning: `${feasibleCount}✓`,
  };

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-border bg-panel transition-[width] duration-200 shrink-0',
        collapsed ? 'w-[72px]' : 'w-[248px]',
      )}
    >
      {/* Brand */}
      <div className={cn('flex items-center gap-2.5 px-4 h-16 border-b border-border', collapsed && 'justify-center px-0')}>
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-gradient-to-br from-cyan/20 to-violet/20 border border-cyan/30">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
            <circle cx="10" cy="10" r="6" stroke="var(--color-cyan)" strokeWidth="1.8" />
            <line x1="14.2" y1="14.2" x2="19" y2="19" stroke="var(--color-cyan)" strokeWidth="2" strokeLinecap="round" />
            <circle cx="10" cy="10" r="2" fill="var(--color-violet)" />
          </svg>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-[15px] font-bold tracking-tight text-text leading-none">
              CHAIN<span className="text-cyan">LENS</span>
            </div>
            <div className="mt-1 text-[10px] text-muted leading-none truncate">
              Vulnerability Chain Reasoner
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Primary">
        <ul className="space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setView(item.id);
                    // Landing on the list/overview should not drop into a stale path detail.
                    if (item.id === 'overview' || item.id === 'paths') selectPath(null);
                  }}
                  aria-current={active ? 'page' : undefined}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                    collapsed && 'justify-center px-0',
                    active
                      ? 'bg-surface text-text'
                      : 'text-muted hover:bg-surface/60 hover:text-text',
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-cyan" />
                  )}
                  <Icon size={18} className={cn('shrink-0', active ? 'text-cyan' : 'text-muted group-hover:text-text')} />
                  {!collapsed && (
                    <span className="flex-1 text-left font-medium leading-tight">{item.label}</span>
                  )}
                  {!collapsed && counts[item.id] && (
                    <span className="rounded-md bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold text-muted tabular-nums">
                      {counts[item.id]}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer: demo note + collapse */}
      <div className="border-t border-border p-3">
        {!collapsed && (
          <div className="mb-2 flex items-start gap-2 rounded-lg border border-border bg-surface/50 px-3 py-2.5">
            <FlaskConical size={15} className="mt-0.5 shrink-0 text-violet" />
            <p className="text-[10.5px] leading-relaxed text-muted">
              Laboratory demonstration. Findings are confirmed; attack paths are inferred possibilities.
            </p>
          </div>
        )}
        <button
          onClick={onToggle}
          className={cn(
            'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted hover:bg-surface hover:text-text transition-colors',
            collapsed && 'justify-center px-0',
          )}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft size={16} className={cn('transition-transform', collapsed && 'rotate-180')} />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
