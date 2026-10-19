import { memo } from 'react';
import {
  useInternalNode,
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
  type EdgeProps,
  type Edge,
} from '@xyflow/react';
import { getEdgeParams } from './floating';
import { edgeKindColor } from '../entityVisuals';
import type { EdgeKind } from '../../data/types';

export interface FloatingEdgeData extends Record<string, unknown> {
  kind: EdgeKind;
  label: string;
  inferred: boolean;
  highlighted: boolean;
  dimmed: boolean;
  broken: boolean;
  showLabel: boolean;
}

export type FloatingFlowEdge = Edge<FloatingEdgeData, 'floating'>;

function FloatingEdgeInner({ id, source, target, data, markerEnd }: EdgeProps<FloatingFlowEdge>) {
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);
  if (!sourceNode || !targetNode || !data) return null;

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(sourceNode, targetNode);
  const [path, labelX, labelY] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    targetX: tx,
    targetY: ty,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    curvature: 0.22,
  });

  const base = edgeKindColor[data.kind];
  const color = data.broken ? '#64748b' : data.highlighted ? 'var(--color-cyan)' : base;
  const opacity = data.dimmed ? 0.12 : data.broken ? 0.5 : data.highlighted ? 1 : 0.65;

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        style={{
          stroke: color,
          strokeWidth: data.highlighted ? 2.4 : 1.5,
          strokeDasharray: data.broken ? '2 4' : data.inferred ? '5 4' : undefined,
          opacity,
        }}
      />
      {data.showLabel && !data.dimmed && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan absolute rounded px-1.5 py-0.5 text-[9.5px] font-medium leading-none"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              background: 'rgba(16,24,39,0.92)',
              border: `1px solid ${data.highlighted ? 'var(--color-cyan)' : 'var(--color-border)'}`,
              color: data.broken ? '#64748b' : data.highlighted ? 'var(--color-cyan)' : '#94a3b8',
              textDecoration: data.broken ? 'line-through' : undefined,
              pointerEvents: 'none',
            }}
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export const FloatingEdge = memo(FloatingEdgeInner);
