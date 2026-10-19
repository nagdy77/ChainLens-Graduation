import { Position, type InternalNode, type Node } from '@xyflow/react';

// Standard React Flow "floating edge" geometry: connect node borders along the
// line between their centers, so edges stay clean regardless of relative
// position. Adapted from the official floating-edges example.

function getNodeCenter(node: InternalNode<Node>) {
  const w = node.measured?.width ?? 0;
  const h = node.measured?.height ?? 0;
  return {
    x: node.internals.positionAbsolute.x + w / 2,
    y: node.internals.positionAbsolute.y + h / 2,
  };
}

function getNodeIntersection(
  intersectionNode: InternalNode<Node>,
  targetNode: InternalNode<Node>,
) {
  const w = (intersectionNode.measured?.width ?? 0) / 2;
  const h = (intersectionNode.measured?.height ?? 0) / 2;
  const c = getNodeCenter(intersectionNode);
  const t = getNodeCenter(targetNode);

  const x2 = c.x;
  const y2 = c.y;
  const x1 = t.x;
  const y1 = t.y;

  if (w === 0 || h === 0) return { x: x2, y: y2 };

  const xx1 = (x1 - x2) / (2 * w) - (y1 - y2) / (2 * h);
  const yy1 = (x1 - x2) / (2 * w) + (y1 - y2) / (2 * h);
  const a = 1 / (Math.abs(xx1) + Math.abs(yy1) || 1);
  const xx3 = a * xx1;
  const yy3 = a * yy1;
  const x = w * (xx3 + yy3) + x2;
  const y = h * (-xx3 + yy3) + y2;

  return { x, y };
}

function getEdgePosition(node: InternalNode<Node>, px: number, py: number): Position {
  const w = node.measured?.width ?? 0;
  const h = node.measured?.height ?? 0;
  const nx = Math.round(node.internals.positionAbsolute.x);
  const ny = Math.round(node.internals.positionAbsolute.y);
  const x = Math.round(px);
  const y = Math.round(py);

  if (x <= nx + 1) return Position.Left;
  if (x >= nx + w - 1) return Position.Right;
  if (y <= ny + 1) return Position.Top;
  if (y >= ny + h - 1) return Position.Bottom;
  return Position.Top;
}

export function getEdgeParams(source: InternalNode<Node>, target: InternalNode<Node>) {
  const sourceIntersection = getNodeIntersection(source, target);
  const targetIntersection = getNodeIntersection(target, source);
  return {
    sx: sourceIntersection.x,
    sy: sourceIntersection.y,
    tx: targetIntersection.x,
    ty: targetIntersection.y,
    sourcePos: getEdgePosition(source, sourceIntersection.x, sourceIntersection.y),
    targetPos: getEdgePosition(target, targetIntersection.x, targetIntersection.y),
  };
}
