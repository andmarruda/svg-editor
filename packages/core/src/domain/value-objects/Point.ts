export interface Point {
  readonly x: number;
  readonly y: number;
}

export const Point = {
  of(x: number, y: number): Point {
    return { x, y };
  },

  ORIGIN: { x: 0, y: 0 } as Point,

  add(a: Point, b: Point): Point {
    return { x: a.x + b.x, y: a.y + b.y };
  },

  subtract(a: Point, b: Point): Point {
    return { x: a.x - b.x, y: a.y - b.y };
  },

  scale(p: Point, factor: number): Point {
    return { x: p.x * factor, y: p.y * factor };
  },

  negate(p: Point): Point {
    return { x: -p.x, y: -p.y };
  },

  distanceTo(a: Point, b: Point): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  },

  lerp(a: Point, b: Point, t: number): Point {
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  },

  equals(a: Point, b: Point): boolean {
    return a.x === b.x && a.y === b.y;
  },

  round(p: Point): Point {
    return { x: Math.round(p.x), y: Math.round(p.y) };
  },
} as const;
