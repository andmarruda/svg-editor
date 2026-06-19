import { Point } from './Point';

export interface BoundingBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export const BoundingBox = {
  of(x: number, y: number, width: number, height: number): BoundingBox {
    if (width < 0 || height < 0) {
      throw new Error(`BoundingBox dimensions must be non-negative, got (${width}, ${height})`);
    }
    return { x, y, width, height };
  },

  fromPoints(a: Point, b: Point): BoundingBox {
    const x = Math.min(a.x, b.x);
    const y = Math.min(a.y, b.y);
    return {
      x,
      y,
      width: Math.abs(b.x - a.x),
      height: Math.abs(b.y - a.y),
    };
  },

  fromLTRB(left: number, top: number, right: number, bottom: number): BoundingBox {
    return BoundingBox.of(left, top, right - left, bottom - top);
  },

  ZERO: { x: 0, y: 0, width: 0, height: 0 } as BoundingBox,

  get left(): (b: BoundingBox) => number {
    return (b) => b.x;
  },
  get top(): (b: BoundingBox) => number {
    return (b) => b.y;
  },
  get right(): (b: BoundingBox) => number {
    return (b) => b.x + b.width;
  },
  get bottom(): (b: BoundingBox) => number {
    return (b) => b.y + b.height;
  },
  get center(): (b: BoundingBox) => Point {
    return (b) => ({ x: b.x + b.width / 2, y: b.y + b.height / 2 });
  },
  get topLeft(): (b: BoundingBox) => Point {
    return (b) => ({ x: b.x, y: b.y });
  },
  get topRight(): (b: BoundingBox) => Point {
    return (b) => ({ x: b.x + b.width, y: b.y });
  },
  get bottomLeft(): (b: BoundingBox) => Point {
    return (b) => ({ x: b.x, y: b.y + b.height });
  },
  get bottomRight(): (b: BoundingBox) => Point {
    return (b) => ({ x: b.x + b.width, y: b.y + b.height });
  },

  union(a: BoundingBox, b: BoundingBox): BoundingBox {
    const x = Math.min(a.x, b.x);
    const y = Math.min(a.y, b.y);
    const right = Math.max(a.x + a.width, b.x + b.width);
    const bottom = Math.max(a.y + a.height, b.y + b.height);
    return { x, y, width: right - x, height: bottom - y };
  },

  unionAll(boxes: readonly BoundingBox[]): BoundingBox | null {
    if (boxes.length === 0) return null;
    return boxes.slice(1).reduce((acc, b) => BoundingBox.union(acc, b), boxes[0]!);
  },

  intersect(a: BoundingBox, b: BoundingBox): BoundingBox | null {
    const x = Math.max(a.x, b.x);
    const y = Math.max(a.y, b.y);
    const right = Math.min(a.x + a.width, b.x + b.width);
    const bottom = Math.min(a.y + a.height, b.y + b.height);
    if (right < x || bottom < y) return null;
    return { x, y, width: right - x, height: bottom - y };
  },

  containsPoint(b: BoundingBox, p: Point): boolean {
    return p.x >= b.x && p.x <= b.x + b.width && p.y >= b.y && p.y <= b.y + b.height;
  },

  intersects(a: BoundingBox, b: BoundingBox): boolean {
    return BoundingBox.intersect(a, b) !== null;
  },

  contains(outer: BoundingBox, inner: BoundingBox): boolean {
    return (
      inner.x >= outer.x &&
      inner.y >= outer.y &&
      inner.x + inner.width <= outer.x + outer.width &&
      inner.y + inner.height <= outer.y + outer.height
    );
  },

  expand(b: BoundingBox, margin: number): BoundingBox {
    return {
      x: b.x - margin,
      y: b.y - margin,
      width: b.width + margin * 2,
      height: b.height + margin * 2,
    };
  },

  translate(b: BoundingBox, p: Point): BoundingBox {
    return { x: b.x + p.x, y: b.y + p.y, width: b.width, height: b.height };
  },

  equals(a: BoundingBox, b: BoundingBox): boolean {
    return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
  },

  isEmpty(b: BoundingBox): boolean {
    return b.width === 0 || b.height === 0;
  },
} as const;
