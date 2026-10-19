import { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { iconForEntity, entityTypeColor } from '../entityVisuals';
import type { EntityType } from '../../data/types';
import { cn } from '../../lib/cn';

export interface EntityNodeData extends Record<string, unknown> {
  entityType: EntityType;
  label: string;
  mono: string;
  findingCount: number;
  highlighted: boolean;
  dimmed: boolean;
  selected: boolean;
  stepIndex?: number | null;
}

export type EntityFlowNode = Node<EntityNodeData, 'entity'>;

function EntityNodeInner({ data }: NodeProps<EntityFlowNode>) {
  const Icon = iconForEntity(data.entityType, data.mono);
  const accent = entityTypeColor[data.entityType];

  return (
    <div
      className={cn(
        'group relative flex items-center gap-2.5 rounded-[11px] border bg-surface px-3 py-2.5 transition-all duration-200',
        data.dimmed && 'opacity-25',
        data.highlighted && 'shadow-[0_0_0_2px_var(--color-cyan),0_8px_24px_-6px_rgba(34,211,238,0.5)]',
        data.selected && !data.highlighted && 'shadow-[0_0_0_2px_var(--color-cyan)]',
      )}
      style={{
        width: 178,
        borderColor: data.highlighted || data.selected ? 'var(--color-cyan)' : 'var(--color-border)',
      }}
    >
      {/* hidden handles so programmatic edges attach; floating edges compute geometry */}
      <Handle type="target" position={Position.Left} isConnectable={false} />
      <Handle type="source" position={Position.Right} isConnectable={false} />

      {/* left accent rail by entity type */}
      <span
        className="absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-r-full"
        style={{ background: accent }}
      />

      <span
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border"
        style={{ borderColor: `${accent}55`, background: `${accent}18`, color: accent }}
      >
        <Icon size={16} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12.5px] font-semibold leading-tight text-text">
          {data.label}
        </span>
        <span className="block truncate font-mono text-[10px] leading-tight text-faint">
          {data.mono}
        </span>
      </span>

      {data.findingCount > 0 && (
        <span
          className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full border border-critical/40 bg-critical/15 px-1 text-[10px] font-bold text-critical"
          title={`${data.findingCount} related finding${data.findingCount > 1 ? 's' : ''}`}
        >
          {data.findingCount}
        </span>
      )}

      {typeof data.stepIndex === 'number' && (
        <span className="absolute -left-2.5 -top-2.5 grid h-5 w-5 place-items-center rounded-full bg-cyan text-[10px] font-bold text-[#042029] shadow">
          {data.stepIndex}
        </span>
      )}
    </div>
  );
}

export const EntityNode = memo(EntityNodeInner);
