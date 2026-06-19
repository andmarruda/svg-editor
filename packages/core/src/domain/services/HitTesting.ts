import type { Document } from '../aggregates/Document';
import type { NodeId } from '../value-objects/NodeId';
import type { Point } from '../value-objects/Point';
import type { BoundingBox } from '../value-objects/BoundingBox';
import { BoundsCalculator } from './BoundsCalculator';
import { DocumentMutations } from '../aggregates/Document';

export const HitTesting = {
  /**
   * Returns the topmost non-locked node whose bounds contain the point.
   * Traverses depth-first in reverse z-order (topmost rendered = last in order).
   */
  nodeAtPoint(doc: Document, point: Point): NodeId | null {
    const order = DocumentMutations.traverseDepthFirst(doc);
    // Reverse: last in paint order = topmost visually
    for (let i = order.length - 1; i >= 0; i--) {
      const id = order[i];
      if (!id) continue;
      const node = doc.nodes.get(id);
      if (!node || node.locked || !node.visibility) continue;
      const bounds = BoundsCalculator.forNode(node);
      if (BoundingBox_containsPoint(bounds, point)) return id;
    }
    return null;
  },

  /**
   * Returns all non-locked visible nodes whose bounds intersect or are contained within the box.
   */
  nodesInBoundingBox(doc: Document, box: BoundingBox): NodeId[] {
    const result: NodeId[] = [];
    for (const id of DocumentMutations.traverseDepthFirst(doc)) {
      const node = doc.nodes.get(id);
      if (!node || node.locked || !node.visibility) continue;
      const bounds = BoundsCalculator.forNode(node);
      if (boundsIntersect(bounds, box)) result.push(id);
    }
    return result;
  },

  /**
   * Returns all non-locked visible nodes fully contained within the box (marquee select semantics).
   */
  nodesInsideBoundingBox(doc: Document, box: BoundingBox): NodeId[] {
    const result: NodeId[] = [];
    for (const id of DocumentMutations.traverseDepthFirst(doc)) {
      const node = doc.nodes.get(id);
      if (!node || node.locked || !node.visibility) continue;
      const bounds = BoundsCalculator.forNode(node);
      if (boundsContained(bounds, box)) result.push(id);
    }
    return result;
  },
} as const;

function BoundingBox_containsPoint(b: BoundingBox, p: Point): boolean {
  return p.x >= b.x && p.x <= b.x + b.width && p.y >= b.y && p.y <= b.y + b.height;
}

function boundsIntersect(a: BoundingBox, b: BoundingBox): boolean {
  return !(a.x + a.width < b.x || b.x + b.width < a.x || a.y + a.height < b.y || b.y + b.height < a.y);
}

function boundsContained(inner: BoundingBox, outer: BoundingBox): boolean {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.width <= outer.x + outer.width &&
    inner.y + inner.height <= outer.y + outer.height
  );
}
