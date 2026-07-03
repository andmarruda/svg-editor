import { describe, it, expect } from 'vitest';
import { BoundsCalculator } from '../BoundsCalculator';
import { Transform } from '../../value-objects/Transform';
import { Fill } from '../../value-objects/Fill';
import { Stroke } from '../../value-objects/Stroke';
import { NodeId } from '../../value-objects/NodeId';
import type { RectNode } from '../../entities/RectNode';
import type { EllipseNode } from '../../entities/EllipseNode';

const base = {
  name: 'test',
  transform: Transform.identity(),
  fill: Fill.NONE,
  stroke: Stroke.NONE,
  opacity: 1,
  visibility: true,
  locked: false,
  metadata: {},
};

function id(s: string) {
  return NodeId.from(s);
}

describe('BoundsCalculator.forNode', () => {
  it('calculates bounds for rect', () => {
    const node: RectNode = {
      ...base,
      id: id('r1'),
      type: 'rect',
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      rx: 0,
      ry: 0,
    };
    expect(BoundsCalculator.forNode(node)).toEqual({ x: 10, y: 20, width: 100, height: 50 });
  });

  it('calculates bounds for ellipse', () => {
    const node: EllipseNode = {
      ...base,
      id: id('e1'),
      type: 'ellipse',
      cx: 50,
      cy: 50,
      rx: 30,
      ry: 20,
    };
    expect(BoundsCalculator.forNode(node)).toEqual({ x: 20, y: 30, width: 60, height: 40 });
  });

  it('applies transform to bounds', () => {
    const node: RectNode = {
      ...base,
      id: id('r1'),
      type: 'rect',
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      rx: 0,
      ry: 0,
      transform: Transform.translation(50, 50),
    };
    const bounds = BoundsCalculator.forNode(node);
    expect(bounds.x).toBe(50);
    expect(bounds.y).toBe(50);
  });
});
