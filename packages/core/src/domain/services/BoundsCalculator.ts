import type { SvgNode } from '../entities/SvgNode';
import type { Document } from '../aggregates/Document';
import type { NodeId } from '../value-objects/NodeId';
import { BoundingBox } from '../value-objects/BoundingBox';
import { Transform } from '../value-objects/Transform';
import { Point } from '../value-objects/Point';

export const BoundsCalculator = {
  forNode(node: SvgNode): BoundingBox {
    return applyTransformToBounds(rawBounds(node), node.transform);
  },

  forNodes(doc: Document, ids: readonly NodeId[]): BoundingBox | null {
    const boxes = ids
      .map((id) => doc.nodes.get(id))
      .filter((n): n is SvgNode => n !== undefined)
      .map((n) => BoundsCalculator.forNode(n));
    return BoundingBox.unionAll(boxes);
  },

  forDocument(doc: Document): BoundingBox | null {
    return BoundsCalculator.forNodes(doc, doc.rootOrder);
  },
} as const;

function rawBounds(node: SvgNode): BoundingBox {
  switch (node.type) {
    case 'rect':
      return BoundingBox.of(node.x, node.y, node.width, node.height);

    case 'ellipse':
      return BoundingBox.of(node.cx - node.rx, node.cy - node.ry, node.rx * 2, node.ry * 2);

    case 'circle':
      return BoundingBox.of(node.cx - node.r, node.cy - node.r, node.r * 2, node.r * 2);

    case 'line':
      return BoundingBox.fromPoints(Point.of(node.x1, node.y1), Point.of(node.x2, node.y2));

    case 'polyline':
    case 'polygon': {
      if (node.points.length === 0) return BoundingBox.ZERO;
      const xs = node.points.map((p) => p.x);
      const ys = node.points.map((p) => p.y);
      const minX = Math.min(...xs);
      const minY = Math.min(...ys);
      return BoundingBox.of(minX, minY, Math.max(...xs) - minX, Math.max(...ys) - minY);
    }

    case 'path': {
      if (node.commands.length === 0) return BoundingBox.ZERO;
      const points: Point[] = [];
      let cx = 0;
      let cy = 0;
      for (const cmd of node.commands) {
        switch (cmd.type) {
          case 'M':
          case 'L':
          case 'T':
            points.push(cmd.point);
            cx = cmd.point.x;
            cy = cmd.point.y;
            break;
          case 'H':
            cx = cmd.x;
            points.push(Point.of(cx, cy));
            break;
          case 'V':
            cy = cmd.y;
            points.push(Point.of(cx, cy));
            break;
          case 'C':
            points.push(cmd.cp1, cmd.cp2, cmd.point);
            cx = cmd.point.x;
            cy = cmd.point.y;
            break;
          case 'S':
            points.push(cmd.cp2, cmd.point);
            cx = cmd.point.x;
            cy = cmd.point.y;
            break;
          case 'Q':
            points.push(cmd.cp, cmd.point);
            cx = cmd.point.x;
            cy = cmd.point.y;
            break;
          case 'A':
            points.push(cmd.point);
            cx = cmd.point.x;
            cy = cmd.point.y;
            break;
          case 'Z':
            break;
        }
      }
      if (points.length === 0) return BoundingBox.ZERO;
      const xs = points.map((p) => p.x);
      const ys = points.map((p) => p.y);
      const minX = Math.min(...xs);
      const minY = Math.min(...ys);
      return BoundingBox.of(minX, minY, Math.max(...xs) - minX, Math.max(...ys) - minY);
    }

    case 'text':
      // Text bounds are approximate — actual rendering depends on font metrics
      return BoundingBox.of(node.x, node.y - node.fontSize, node.fontSize * node.content.length * 0.6, node.fontSize);

    case 'image':
      return BoundingBox.of(node.x, node.y, node.width, node.height);

    case 'group':
    case 'use':
      return BoundingBox.ZERO;
  }
}

function applyTransformToBounds(box: BoundingBox, transform: Transform): BoundingBox {
  if (Transform.isIdentity(transform)) return box;
  const corners: Point[] = [
    BoundingBox.topLeft(box),
    BoundingBox.topRight(box),
    BoundingBox.bottomLeft(box),
    BoundingBox.bottomRight(box),
  ];
  const transformed = corners.map((p) => Transform.applyToPoint(transform, p));
  const xs = transformed.map((p) => p.x);
  const ys = transformed.map((p) => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  return BoundingBox.of(minX, minY, Math.max(...xs) - minX, Math.max(...ys) - minY);
}
