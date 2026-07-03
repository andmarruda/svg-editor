import type { Document, Point } from '@svg-editor/core';
import { BoundsCalculator } from '@svg-editor/core';

export function snapPointToGrid(point: Point, gridSize = 10, enabled = true): Point {
  if (!enabled || gridSize <= 0) return point;
  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize,
  };
}

export interface SnapGuide {
  readonly axis: 'x' | 'y';
  readonly value: number;
}

export function findObjectSnapGuides(doc: Document, point: Point, threshold = 6): SnapGuide[] {
  const guides: SnapGuide[] = [];
  for (const node of doc.nodes.values()) {
    const box = BoundsCalculator.forNode(node);
    const values = {
      x: [box.x, box.x + box.width / 2, box.x + box.width],
      y: [box.y, box.y + box.height / 2, box.y + box.height],
    };
    for (const value of values.x) {
      if (Math.abs(value - point.x) <= threshold) guides.push({ axis: 'x', value });
    }
    for (const value of values.y) {
      if (Math.abs(value - point.y) <= threshold) guides.push({ axis: 'y', value });
    }
  }
  return guides;
}

export function snapPointToObjects(doc: Document, point: Point, threshold = 6): Point {
  const guides = findObjectSnapGuides(doc, point, threshold);
  const xGuide = guides.find((guide) => guide.axis === 'x');
  const yGuide = guides.find((guide) => guide.axis === 'y');
  return {
    x: xGuide?.value ?? point.x,
    y: yGuide?.value ?? point.y,
  };
}
