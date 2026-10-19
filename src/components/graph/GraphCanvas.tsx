import { useEffect, useMemo } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  useReactFlow,
  useNodesInitialized,
  type Node,
  type Edge,
  type NodeTypes,
  type EdgeTypes,
} from '@xyflow/react';
import { EntityNode } from './EntityNode';
import { ZoneNode } from './ZoneNode';
import { FloatingEdge } from './FloatingEdge';
import {
  allGraphEntities,
  zoneRects,
  NODE_POS,
  NODE_W,
  NODE_H,
  type GraphEntityRef,
} from './layout';
import { edges as edgeData, findings, entityName, assetById } from '../../data/mockData';
import { edgeKindColor } from '../entityVisuals';
import type { EntityType, ZoneId } from '../../data/types';

const nodeTypes: NodeTypes = { entity: EntityNode as never, zone: ZoneNode as never };
const edgeTypes: EdgeTypes = { floating: FloatingEdge as never };

export interface GraphCanvasProps {
  mode?: 'full' | 'mini' | 'path';
  showInferred?: boolean;
  showZones?: boolean;
  showEdgeLabels?: boolean;
  showFindings?: boolean;
  filterTypes?: Set<EntityType>;
  filterZones?: Set<ZoneId>;
  highlightNodeIds?: Set<string>;
  highlightEdgeIds?: Set<string>;
  stepIndexByNode?: Record<string, number>;
  dimUnhighlighted?: boolean;
  brokenEdgeIds?: Set<string>;
  selectedNodeId?: string | null;
  onNodeClick?: (id: string) => void;
  onPaneClick?: () => void;
  centerNodeId?: string | null;
  fitKey?: string | number;
}

function findingCountFor(assetId: string): number {
  return findings.filter((f) => f.assetId === assetId).length;
}

function GraphInner({
  mode = 'full',
  showInferred = true,
  showZones = true,
  showEdgeLabels = true,
  showFindings = false,
  filterTypes,
  filterZones,
  highlightNodeIds,
  highlightEdgeIds,
  stepIndexByNode,
  dimUnhighlighted = false,
  brokenEdgeIds,
  selectedNodeId,
  onNodeClick,
  onPaneClick,
  centerNodeId,
  fitKey,
}: GraphCanvasProps) {
  const rf = useReactFlow();
  const nodesInitialized = useNodesInitialized();

  const typeVisible = (t: EntityType) => (filterTypes ? filterTypes.has(t) : true);
  const zoneVisible = (z: ZoneId) => (filterZones ? filterZones.has(z) : true);

  const { nodes, edges } = useMemo(() => {
    // 1. visible core entities
    const core = allGraphEntities().filter((e) => typeVisible(e.type) && zoneVisible(e.zone));

    // 2. finding refs (below their asset), if enabled
    const findingRefs: (GraphEntityRef & { title: string })[] = [];
    if (showFindings && typeVisible('finding')) {
      const byAsset: Record<string, typeof findings> = {};
      for (const f of findings) (byAsset[f.assetId] ??= []).push(f);
      for (const [assetId, list] of Object.entries(byAsset)) {
        const asset = assetById(assetId);
        const p = NODE_POS[assetId];
        if (!asset || !p || !zoneVisible(asset.zone)) continue;
        list.forEach((f, i) => {
          findingRefs.push({
            id: f.id,
            type: 'finding',
            zone: asset.zone,
            x: p.x + 18,
            y: p.y + NODE_H + 12 + i * 32,
            title: f.title,
          });
        });
      }
    }

    const visibleIds = new Set<string>([...core.map((c) => c.id), ...findingRefs.map((f) => f.id)]);

    // 3. zone container nodes
    const zNodes: Node[] = [];
    if (showZones) {
      for (const r of zoneRects([...core, ...findingRefs])) {
        zNodes.push({
          id: `zone-rect-${r.id}`,
          type: 'zone',
          position: { x: r.x, y: r.y },
          data: { zoneId: r.id, name: r.name, short: r.short, width: r.w, height: r.h, hidden: false },
          draggable: false,
          selectable: false,
          deletable: false,
          focusable: false,
          zIndex: 0,
        });
      }
    }

    // 4. entity nodes
    const eNodes: Node[] = core.map((e) => {
      const hl = highlightNodeIds?.has(e.id) ?? false;
      return {
        id: e.id,
        type: 'entity',
        position: { x: e.x, y: e.y },
        data: {
          entityType: e.type,
          label: entityName(e.id),
          mono: e.id,
          findingCount: e.type === 'asset' ? findingCountFor(e.id) : 0,
          highlighted: hl,
          dimmed: dimUnhighlighted ? !hl : false,
          selected: selectedNodeId === e.id,
          stepIndex: stepIndexByNode?.[e.id] ?? null,
        },
        draggable: false,
        zIndex: hl ? 5 : 2,
      } satisfies Node;
    });

    const fNodes: Node[] = findingRefs.map((f) => {
      const hl = highlightNodeIds?.has(f.id) ?? false;
      return {
        id: f.id,
        type: 'entity',
        position: { x: f.x, y: f.y },
        data: {
          entityType: 'finding',
          label: f.title,
          mono: f.id,
          findingCount: 0,
          highlighted: hl,
          dimmed: dimUnhighlighted ? !hl : false,
          selected: selectedNodeId === f.id,
          stepIndex: null,
        },
        draggable: false,
        zIndex: 2,
      } satisfies Node;
    });

    // 5. structural edges
    const builtEdges: Edge[] = [];
    for (const ed of edgeData) {
      if (!visibleIds.has(ed.source) || !visibleIds.has(ed.target)) continue;
      if (!showInferred && ed.inferred) continue;
      const hl = highlightEdgeIds?.has(ed.id) ?? false;
      const broken = brokenEdgeIds?.has(ed.id) ?? false;
      const color = broken ? '#64748b' : hl ? '#22d3ee' : edgeKindColor[ed.kind];
      builtEdges.push({
        id: ed.id,
        source: ed.source,
        target: ed.target,
        type: 'floating',
        markerEnd: { type: MarkerType.ArrowClosed, color, width: 16, height: 16 },
        data: {
          kind: ed.kind,
          label: ed.label,
          inferred: ed.inferred,
          highlighted: hl,
          dimmed: dimUnhighlighted ? !hl : false,
          broken,
          showLabel: showEdgeLabels && mode !== 'mini',
        },
        zIndex: hl ? 4 : 1,
      });
    }

    // 6. finding-affects edges
    if (showFindings && typeVisible('finding')) {
      for (const f of findingRefs) {
        if (!visibleIds.has(f.id)) continue;
        const assetId = findings.find((x) => x.id === f.id)?.assetId;
        if (!assetId || !visibleIds.has(assetId)) continue;
        builtEdges.push({
          id: `FA-${f.id}`,
          source: f.id,
          target: assetId,
          type: 'floating',
          markerEnd: { type: MarkerType.ArrowClosed, color: edgeKindColor['finding-affects'], width: 14, height: 14 },
          data: {
            kind: 'finding-affects',
            label: 'affects',
            inferred: false,
            highlighted: false,
            dimmed: dimUnhighlighted,
            broken: false,
            showLabel: false,
          },
          zIndex: 1,
        });
      }
    }

    return { nodes: [...zNodes, ...eNodes, ...fNodes], edges: builtEdges };
  }, [
    showInferred, showZones, showEdgeLabels, showFindings, mode,
    filterTypes, filterZones, highlightNodeIds, highlightEdgeIds,
    stepIndexByNode, dimUnhighlighted, brokenEdgeIds, selectedNodeId,
  ]);

  // Fit to view once nodes are measured, and whenever the layout signal changes.
  useEffect(() => {
    if (!nodesInitialized) return;
    const t = setTimeout(() => {
      rf.fitView({ padding: mode === 'mini' ? 0.08 : 0.16, duration: 400 });
    }, 40);
    return () => clearTimeout(t);
  }, [fitKey, rf, mode, nodesInitialized]);

  // Center on a requested node (from global search)
  useEffect(() => {
    if (!centerNodeId) return;
    const p = NODE_POS[centerNodeId];
    if (p) {
      rf.setCenter(p.x + NODE_W / 2, p.y + NODE_H / 2, { zoom: 1.1, duration: 500 });
    }
  }, [centerNodeId, rf]);

  const interactive = mode !== 'mini';

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      fitViewOptions={{ padding: mode === 'mini' ? 0.08 : 0.16 }}
      minZoom={0.2}
      maxZoom={2}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={interactive}
      elevateNodesOnSelect={false}
      panOnDrag={interactive}
      zoomOnScroll={interactive}
      zoomOnPinch={interactive}
      zoomOnDoubleClick={interactive}
      preventScrolling={interactive}
      proOptions={{ hideAttribution: true }}
      onNodeClick={(_, n) => {
        if (n.type === 'entity') onNodeClick?.(n.id);
      }}
      onPaneClick={() => onPaneClick?.()}
      className="bg-grid"
    >
      <Background variant={BackgroundVariant.Dots} gap={28} size={1} color="#1a2740" />
      {mode === 'full' && <Controls showInteractive={false} position="bottom-right" />}
    </ReactFlow>
  );
}

export function GraphCanvas(props: GraphCanvasProps) {
  return (
    <ReactFlowProvider>
      <GraphInner {...props} />
    </ReactFlowProvider>
  );
}
