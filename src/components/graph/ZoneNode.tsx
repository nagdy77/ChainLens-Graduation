import { memo } from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import type { ZoneId } from '../../data/types';
import { zoneTint } from './layout';

export interface ZoneNodeData extends Record<string, unknown> {
  zoneId: ZoneId;
  name: string;
  short: string;
  width: number;
  height: number;
  hidden: boolean;
}

export type ZoneFlowNode = Node<ZoneNodeData, 'zone'>;

function ZoneNodeInner({ data }: NodeProps<ZoneFlowNode>) {
  const tint = zoneTint[data.zoneId];
  if (data.hidden) return null;
  return (
    <div
      className="pointer-events-none rounded-2xl"
      style={{
        width: data.width,
        height: data.height,
        background: tint.fill,
        border: `1px dashed ${tint.border}`,
      }}
    >
      <div
        className="absolute left-3 top-2.5 flex items-center gap-1.5 rounded-md px-2 py-1"
        style={{ background: 'rgba(8,13,24,0.6)', border: `1px solid ${tint.border}` }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: tint.text }} />
        <span className="text-[11px] font-semibold tracking-wide" style={{ color: tint.text }}>
          {data.name}
        </span>
        <span className="font-mono text-[9px] opacity-70" style={{ color: tint.text }}>
          {data.short}
        </span>
      </div>
    </div>
  );
}

export const ZoneNode = memo(ZoneNodeInner);
