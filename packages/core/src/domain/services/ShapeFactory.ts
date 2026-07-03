import type { PathCommand } from '../entities/PathCommand';
import type { BoundingBox } from '../value-objects/BoundingBox';
import type { Point } from '../value-objects/Point';

export type ShapePreset =
  | 'triangle'
  | 'diamond'
  | 'pentagon'
  | 'hexagon'
  | 'star'
  | 'arrow-right'
  | 'arrow-left'
  | 'arrow-up'
  | 'arrow-down'
  | 'speech-bubble'
  | 'heart'
  | 'badge'
  | 'ribbon';

export type ShapePresetGeometry =
  | { readonly kind: 'polygon'; readonly points: readonly Point[] }
  | { readonly kind: 'path'; readonly commands: readonly PathCommand[] };

export const ShapeFactory = {
  create(preset: ShapePreset, bounds: BoundingBox): ShapePresetGeometry {
    switch (preset) {
      case 'triangle':
        return { kind: 'polygon', points: regularPolygon(bounds, 3, -90) };
      case 'diamond':
        return {
          kind: 'polygon',
          points: [
            { x: bounds.x + bounds.width / 2, y: bounds.y },
            { x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2 },
            { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height },
            { x: bounds.x, y: bounds.y + bounds.height / 2 },
          ],
        };
      case 'pentagon':
        return { kind: 'polygon', points: regularPolygon(bounds, 5, -90) };
      case 'hexagon':
        return { kind: 'polygon', points: regularPolygon(bounds, 6, 30) };
      case 'star':
        return { kind: 'polygon', points: star(bounds, 5, 0.46) };
      case 'arrow-right':
        return { kind: 'polygon', points: arrow(bounds, 'right') };
      case 'arrow-left':
        return { kind: 'polygon', points: arrow(bounds, 'left') };
      case 'arrow-up':
        return { kind: 'polygon', points: arrow(bounds, 'up') };
      case 'arrow-down':
        return { kind: 'polygon', points: arrow(bounds, 'down') };
      case 'speech-bubble':
        return { kind: 'path', commands: speechBubble(bounds) };
      case 'heart':
        return { kind: 'path', commands: heart(bounds) };
      case 'badge':
        return { kind: 'polygon', points: star(bounds, 8, 0.82) };
      case 'ribbon':
        return { kind: 'polygon', points: ribbon(bounds) };
    }
  },
} as const;

function regularPolygon(bounds: BoundingBox, sides: number, rotationDeg: number): Point[] {
  const cx = bounds.x + bounds.width / 2;
  const cy = bounds.y + bounds.height / 2;
  const rx = bounds.width / 2;
  const ry = bounds.height / 2;
  return Array.from({ length: sides }, (_, index) => {
    const angle = (((360 / sides) * index + rotationDeg) * Math.PI) / 180;
    return { x: cx + Math.cos(angle) * rx, y: cy + Math.sin(angle) * ry };
  });
}

function star(bounds: BoundingBox, points: number, innerRatio: number): Point[] {
  const cx = bounds.x + bounds.width / 2;
  const cy = bounds.y + bounds.height / 2;
  const outerRx = bounds.width / 2;
  const outerRy = bounds.height / 2;
  const innerRx = outerRx * innerRatio;
  const innerRy = outerRy * innerRatio;
  return Array.from({ length: points * 2 }, (_, index) => {
    const isOuter = index % 2 === 0;
    const angle = (((360 / (points * 2)) * index - 90) * Math.PI) / 180;
    return {
      x: cx + Math.cos(angle) * (isOuter ? outerRx : innerRx),
      y: cy + Math.sin(angle) * (isOuter ? outerRy : innerRy),
    };
  });
}

function arrow(bounds: BoundingBox, direction: 'right' | 'left' | 'up' | 'down'): Point[] {
  const x = bounds.x;
  const y = bounds.y;
  const w = bounds.width;
  const h = bounds.height;
  const right: Point[] = [
    { x, y: y + h * 0.25 },
    { x: x + w * 0.58, y: y + h * 0.25 },
    { x: x + w * 0.58, y },
    { x: x + w, y: y + h / 2 },
    { x: x + w * 0.58, y: y + h },
    { x: x + w * 0.58, y: y + h * 0.75 },
    { x, y: y + h * 0.75 },
  ];

  if (direction === 'right') return right;
  if (direction === 'left') return right.map((point) => ({ x: x + w - (point.x - x), y: point.y }));
  if (direction === 'down')
    return right.map((point) => ({
      x: x + (point.y - y) * (w / h),
      y: y + (point.x - x) * (h / w),
    }));
  return right.map((point) => ({
    x: x + (h - (point.y - y)) * (w / h),
    y: y + (point.x - x) * (h / w),
  }));
}

function speechBubble(bounds: BoundingBox): PathCommand[] {
  const x = bounds.x;
  const y = bounds.y;
  const w = bounds.width;
  const h = bounds.height;
  const r = Math.min(w, h) * 0.16;
  return [
    { type: 'M', point: { x: x + r, y } },
    { type: 'L', point: { x: x + w - r, y } },
    { type: 'Q', cp: { x: x + w, y }, point: { x: x + w, y: y + r } },
    { type: 'L', point: { x: x + w, y: y + h * 0.72 } },
    { type: 'Q', cp: { x: x + w, y: y + h - r }, point: { x: x + w - r, y: y + h - r } },
    { type: 'L', point: { x: x + w * 0.45, y: y + h - r } },
    { type: 'L', point: { x: x + w * 0.28, y: y + h } },
    { type: 'L', point: { x: x + w * 0.32, y: y + h - r } },
    { type: 'L', point: { x: x + r, y: y + h - r } },
    { type: 'Q', cp: { x, y: y + h - r }, point: { x, y: y + h * 0.72 } },
    { type: 'L', point: { x, y: y + r } },
    { type: 'Q', cp: { x, y }, point: { x: x + r, y } },
    { type: 'Z' },
  ];
}

function heart(bounds: BoundingBox): PathCommand[] {
  const x = bounds.x;
  const y = bounds.y;
  const w = bounds.width;
  const h = bounds.height;
  return [
    { type: 'M', point: { x: x + w / 2, y: y + h * 0.88 } },
    {
      type: 'C',
      cp1: { x: x + w * 0.08, y: y + h * 0.58 },
      cp2: { x, y: y + h * 0.32 },
      point: { x: x + w * 0.2, y: y + h * 0.16 },
    },
    {
      type: 'C',
      cp1: { x: x + w * 0.34, y: y + h * 0.04 },
      cp2: { x: x + w * 0.48, y: y + h * 0.12 },
      point: { x: x + w / 2, y: y + h * 0.28 },
    },
    {
      type: 'C',
      cp1: { x: x + w * 0.52, y: y + h * 0.12 },
      cp2: { x: x + w * 0.66, y: y + h * 0.04 },
      point: { x: x + w * 0.8, y: y + h * 0.16 },
    },
    {
      type: 'C',
      cp1: { x: x + w, y: y + h * 0.32 },
      cp2: { x: x + w * 0.92, y: y + h * 0.58 },
      point: { x: x + w / 2, y: y + h * 0.88 },
    },
    { type: 'Z' },
  ];
}

function ribbon(bounds: BoundingBox): Point[] {
  const x = bounds.x;
  const y = bounds.y;
  const w = bounds.width;
  const h = bounds.height;
  return [
    { x, y },
    { x: x + w, y },
    { x: x + w, y: y + h },
    { x: x + w / 2, y: y + h * 0.72 },
    { x, y: y + h },
  ];
}
