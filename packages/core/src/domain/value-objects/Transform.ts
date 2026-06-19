import { Point } from './Point';

/**
 * Affine 2D transform stored as [a, b, c, d, e, f] — the 6 coefficients of a 3×3 matrix:
 *   | a  c  e |
 *   | b  d  f |
 *   | 0  0  1 |
 *
 * This matches the SVG/Canvas spec exactly. All operations return new immutable instances.
 */
export type TransformMatrix = readonly [
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
];

export interface Transform {
  readonly matrix: TransformMatrix;
}

export const Transform = {
  identity(): Transform {
    return { matrix: [1, 0, 0, 1, 0, 0] };
  },

  of(a: number, b: number, c: number, d: number, e: number, f: number): Transform {
    return { matrix: [a, b, c, d, e, f] };
  },

  translation(tx: number, ty: number): Transform {
    return { matrix: [1, 0, 0, 1, tx, ty] };
  },

  scaling(sx: number, sy: number, cx = 0, cy = 0): Transform {
    // Scale around (cx, cy): translate to origin, scale, translate back
    return { matrix: [sx, 0, 0, sy, cx - sx * cx, cy - sy * cy] };
  },

  rotation(angleDeg: number, cx = 0, cy = 0): Transform {
    const rad = (angleDeg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const e = cx - cos * cx + sin * cy;
    const f = cy - sin * cx - cos * cy;
    return { matrix: [cos, sin, -sin, cos, e, f] };
  },

  multiply(a: Transform, b: Transform): Transform {
    const [a0, a1, a2, a3, a4, a5] = a.matrix;
    const [b0, b1, b2, b3, b4, b5] = b.matrix;
    return {
      matrix: [
        a0 * b0 + a2 * b1,
        a1 * b0 + a3 * b1,
        a0 * b2 + a2 * b3,
        a1 * b2 + a3 * b3,
        a0 * b4 + a2 * b5 + a4,
        a1 * b4 + a3 * b5 + a5,
      ],
    };
  },

  inverse(t: Transform): Transform | null {
    const [a, b, c, d, e, f] = t.matrix;
    const det = a * d - b * c;
    if (Math.abs(det) < 1e-10) return null;
    const invDet = 1 / det;
    return {
      matrix: [
        d * invDet,
        -b * invDet,
        -c * invDet,
        a * invDet,
        (c * f - d * e) * invDet,
        (b * e - a * f) * invDet,
      ],
    };
  },

  applyToPoint(t: Transform, p: Point): Point {
    const [a, b, c, d, e, f] = t.matrix;
    return {
      x: a * p.x + c * p.y + e,
      y: b * p.x + d * p.y + f,
    };
  },

  isIdentity(t: Transform): boolean {
    const [a, b, c, d, e, f] = t.matrix;
    return a === 1 && b === 0 && c === 0 && d === 1 && e === 0 && f === 0;
  },

  equals(a: Transform, b: Transform): boolean {
    return a.matrix.every((v, i) => v === b.matrix[i]);
  },

  /**
   * Decomposes the matrix into human-readable components for the properties panel.
   * Returns null if the matrix cannot be cleanly decomposed (e.g., shear).
   */
  decompose(t: Transform): { tx: number; ty: number; rotation: number; sx: number; sy: number } {
    const [a, b, c, d, e, f] = t.matrix;
    const sx = Math.sqrt(a * a + b * b);
    const sy = Math.sqrt(c * c + d * d);
    const rotation = (Math.atan2(b, a) * 180) / Math.PI;
    return { tx: e, ty: f, rotation, sx, sy };
  },

  toCssString(t: Transform): string {
    const [a, b, c, d, e, f] = t.matrix;
    return `matrix(${a},${b},${c},${d},${e},${f})`;
  },

  toSvgString(t: Transform): string {
    return Transform.toCssString(t);
  },
} as const;
