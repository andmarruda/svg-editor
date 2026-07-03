import type { PathCommand } from '../entities/PathCommand';
import type { SvgNode } from '../entities/SvgNode';
import type { BoundingBox } from '../value-objects/BoundingBox';
import { Point } from '../value-objects/Point';
import { Transform } from '../value-objects/Transform';
import { TransformService } from './TransformService';

const KAPPA = 0.5522847498307936;

export const GeometryService = {
  toPathCommands(node: SvgNode): PathCommand[] | null {
    switch (node.type) {
      case 'rect':
        return rectToPath(node.x, node.y, node.width, node.height, node.rx, node.ry);
      case 'circle':
        return ellipseToPath(node.cx, node.cy, node.r, node.r);
      case 'ellipse':
        return ellipseToPath(node.cx, node.cy, node.rx, node.ry);
      case 'line':
        return [
          { type: 'M', point: Point.of(node.x1, node.y1) },
          { type: 'L', point: Point.of(node.x2, node.y2) },
        ];
      case 'polyline':
        return pointsToPath(node.points, false);
      case 'polygon':
        return pointsToPath(node.points, true);
      case 'path':
        return [...node.commands];
      default:
        return null;
    }
  },

  bakeTransform(node: SvgNode): SvgNode {
    if (Transform.isIdentity(node.transform)) return node;
    const transform = node.transform;
    const identity = Transform.identity();

    switch (node.type) {
      case 'line': {
        const p1 = Transform.applyToPoint(transform, Point.of(node.x1, node.y1));
        const p2 = Transform.applyToPoint(transform, Point.of(node.x2, node.y2));
        return { ...node, x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, transform: identity };
      }
      case 'polyline':
      case 'polygon':
        return {
          ...node,
          points: node.points.map((point) => Transform.applyToPoint(transform, point)),
          transform: identity,
        };
      case 'path':
        return {
          ...node,
          commands: TransformService.applyToPathCommands(node.commands, transform),
          transform: identity,
        };
      default:
        return node;
    }
  },

  fitBounds(node: SvgNode, target: BoundingBox): SvgNode {
    switch (node.type) {
      case 'rect':
        return { ...node, x: target.x, y: target.y, width: target.width, height: target.height };
      case 'image':
        return { ...node, x: target.x, y: target.y, width: target.width, height: target.height };
      case 'text':
        return { ...node, x: target.x, y: target.y + node.fontSize };
      case 'circle': {
        const r = Math.min(target.width, target.height) / 2;
        return { ...node, cx: target.x + target.width / 2, cy: target.y + target.height / 2, r };
      }
      case 'ellipse':
        return {
          ...node,
          cx: target.x + target.width / 2,
          cy: target.y + target.height / 2,
          rx: target.width / 2,
          ry: target.height / 2,
        };
      case 'line':
      case 'polyline':
      case 'polygon':
      case 'path':
      case 'group':
      case 'use':
        return node;
    }
  },
} as const;

function rectToPath(
  x: number,
  y: number,
  width: number,
  height: number,
  rx: number,
  ry: number,
): PathCommand[] {
  const rrx = Math.min(Math.max(0, rx), width / 2);
  const rry = Math.min(Math.max(0, ry), height / 2);
  if (rrx === 0 && rry === 0) {
    return [
      { type: 'M', point: Point.of(x, y) },
      { type: 'L', point: Point.of(x + width, y) },
      { type: 'L', point: Point.of(x + width, y + height) },
      { type: 'L', point: Point.of(x, y + height) },
      { type: 'Z' },
    ];
  }

  return [
    { type: 'M', point: Point.of(x + rrx, y) },
    { type: 'L', point: Point.of(x + width - rrx, y) },
    { type: 'Q', cp: Point.of(x + width, y), point: Point.of(x + width, y + rry) },
    { type: 'L', point: Point.of(x + width, y + height - rry) },
    {
      type: 'Q',
      cp: Point.of(x + width, y + height),
      point: Point.of(x + width - rrx, y + height),
    },
    { type: 'L', point: Point.of(x + rrx, y + height) },
    { type: 'Q', cp: Point.of(x, y + height), point: Point.of(x, y + height - rry) },
    { type: 'L', point: Point.of(x, y + rry) },
    { type: 'Q', cp: Point.of(x, y), point: Point.of(x + rrx, y) },
    { type: 'Z' },
  ];
}

function ellipseToPath(cx: number, cy: number, rx: number, ry: number): PathCommand[] {
  const ox = rx * KAPPA;
  const oy = ry * KAPPA;
  return [
    { type: 'M', point: Point.of(cx, cy - ry) },
    {
      type: 'C',
      cp1: Point.of(cx + ox, cy - ry),
      cp2: Point.of(cx + rx, cy - oy),
      point: Point.of(cx + rx, cy),
    },
    {
      type: 'C',
      cp1: Point.of(cx + rx, cy + oy),
      cp2: Point.of(cx + ox, cy + ry),
      point: Point.of(cx, cy + ry),
    },
    {
      type: 'C',
      cp1: Point.of(cx - ox, cy + ry),
      cp2: Point.of(cx - rx, cy + oy),
      point: Point.of(cx - rx, cy),
    },
    {
      type: 'C',
      cp1: Point.of(cx - rx, cy - oy),
      cp2: Point.of(cx - ox, cy - ry),
      point: Point.of(cx, cy - ry),
    },
    { type: 'Z' },
  ];
}

function pointsToPath(points: readonly Point[], closed: boolean): PathCommand[] {
  if (points.length === 0) return [];
  const [first, ...rest] = points;
  return [
    { type: 'M', point: first! },
    ...rest.map((point): PathCommand => ({ type: 'L', point })),
    ...(closed ? [{ type: 'Z' } satisfies PathCommand] : []),
  ];
}
