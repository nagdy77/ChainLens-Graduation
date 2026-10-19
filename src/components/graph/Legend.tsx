import { Server, UserRound, KeyRound, Boxes, FileText } from 'lucide-react';
import { edgeKindLabel, edgeKindColor } from '../entityVisuals';
import type { EdgeKind } from '../../data/types';

const entityLegend = [
  { icon: Server, label: 'Asset', color: 'var(--color-cyan)' },
  { icon: UserRound, label: 'Identity', color: 'var(--color-violet)' },
  { icon: KeyRound, label: 'Privilege', color: 'var(--color-warning)' },
  { icon: Boxes, label: 'Dependency', color: 'var(--color-info)' },
  { icon: FileText, label: 'Finding', color: 'var(--color-critical)' },
];

const edgeLegend: EdgeKind[] = [
  'can-reach',
  'authenticates-as',
  'has-privilege',
  'depends-on',
  'finding-affects',
];

export function Legend() {
  return (
    <div className="rounded-xl border border-border bg-panel/95 backdrop-blur px-3.5 py-3 shadow-xl">
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-faint">Legend</div>
      <div className="grid grid-cols-2 gap-x-5 gap-y-1.5">
        <div className="space-y-1.5">
          {entityLegend.map((e) => {
            const Icon = e.icon;
            return (
              <div key={e.label} className="flex items-center gap-2">
                <span
                  className="grid h-4 w-4 place-items-center rounded border"
                  style={{ borderColor: `${e.color}66`, background: `${e.color}1a`, color: e.color }}
                >
                  <Icon size={10} />
                </span>
                <span className="text-[11px] text-muted">{e.label}</span>
              </div>
            );
          })}
        </div>
        <div className="space-y-1.5">
          {edgeLegend.map((k) => (
            <div key={k} className="flex items-center gap-2">
              <svg width="20" height="8" className="shrink-0">
                <line
                  x1="1"
                  y1="4"
                  x2="19"
                  y2="4"
                  stroke={edgeKindColor[k]}
                  strokeWidth="2"
                  strokeDasharray={k === 'authenticates-as' || k === 'finding-affects' ? '4 3' : undefined}
                />
              </svg>
              <span className="text-[11px] text-muted">{edgeKindLabel[k]}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2.5 border-t border-border pt-2 text-[10px] leading-relaxed text-faint">
        Dashed edges are inferred relationships. Red nodes/edges indicate findings.
      </div>
    </div>
  );
}
