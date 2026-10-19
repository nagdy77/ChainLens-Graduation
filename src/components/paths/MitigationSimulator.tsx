import { ShieldCheck, RotateCcw, Zap } from 'lucide-react';
import { mitigations, attackPaths } from '../../data/mockData';
import { useApp } from '../../state/AppContext';
import { Badge, Button, SectionLabel, Mono } from '../ui';
import { cn } from '../../lib/cn';

const categoryTone: Record<string, 'cyan' | 'violet' | 'warning' | 'info' | 'success'> = {
  'Remove permission': 'warning',
  'Restrict network': 'cyan',
  'Separate identity': 'violet',
  'Restrict config access': 'info',
  'Harden dependency': 'success',
};

export function MitigationSimulator({ compact = false }: { compact?: boolean }) {
  const { appliedMitigations, toggleMitigation, clearMitigations, blockedPathIds } = useApp();

  const feasible = attackPaths.filter((p) => p.feasibility === 'feasible');
  const affectedCount = feasible.filter((p) => blockedPathIds.has(p.id)).length;

  return (
    <div className={cn('rounded-xl border border-border bg-panel', compact && 'text-[12px]')}>
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <ShieldCheck size={15} className="text-success" />
          <div>
            <h3 className="text-[13px] font-semibold text-text">Simulate mitigation</h3>
            <p className="text-[11px] text-muted">Break a relationship and see which paths it blocks</p>
          </div>
        </div>
        {appliedMitigations.length > 0 && (
          <Button size="sm" variant="ghost" onClick={clearMitigations}>
            <RotateCcw size={13} /> Reset
          </Button>
        )}
      </div>

      {/* Impact summary */}
      <div className="flex items-center gap-3 border-b border-border bg-surface/40 px-4 py-2.5">
        <Zap size={14} className={affectedCount ? 'text-cyan' : 'text-faint'} />
        <span className="text-[12px] text-muted">
          {appliedMitigations.length === 0 ? (
            'No mitigations applied.'
          ) : (
            <>
              <span className="font-semibold text-text">{affectedCount}</span> of {feasible.length} feasible paths
              blocked in this simulation.
            </>
          )}
        </span>
      </div>

      {/* Mitigation list */}
      <ul className="divide-y divide-border">
        {mitigations.map((m) => {
          const on = appliedMitigations.includes(m.id);
          return (
            <li key={m.id}>
              <label className="flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-surface/40">
                <button
                  role="switch"
                  aria-checked={on}
                  onClick={() => toggleMitigation(m.id)}
                  className={cn(
                    'mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full border px-0.5 transition-colors',
                    on ? 'justify-end border-success/50 bg-success/30' : 'justify-start border-border bg-surface',
                  )}
                >
                  <span className={cn('h-3.5 w-3.5 rounded-full transition-colors', on ? 'bg-success' : 'bg-faint')} />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Mono className="text-[10px] text-faint">{m.id}</Mono>
                    <Badge tone={categoryTone[m.category]}>{m.category}</Badge>
                  </div>
                  <div className="mt-1 text-[12.5px] font-medium text-text">{m.label}</div>
                  <p className="mt-0.5 text-[11.5px] leading-snug text-muted">{m.description}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1">
                    <span className="text-[10px] text-faint">Blocks:</span>
                    {m.blocksPathIds.map((pid) => (
                      <span key={pid} className="rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[9.5px] text-muted">
                        {pid}
                      </span>
                    ))}
                  </div>
                </div>
              </label>
            </li>
          );
        })}
      </ul>

      <div className="border-t border-border px-4 py-2.5">
        <SectionLabel className="text-faint">
          Simulated locally · graph relationships are visually broken while applied
        </SectionLabel>
      </div>
    </div>
  );
}
