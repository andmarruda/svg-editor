import { Color } from './Color';
import { Point } from './Point';

export interface GradientStop {
  readonly offset: number; // 0–1
  readonly color: Color;
}

export type Fill =
  | { readonly kind: 'none' }
  | { readonly kind: 'solid'; readonly color: Color }
  | {
      readonly kind: 'linear-gradient';
      readonly stops: readonly GradientStop[];
      readonly angleDeg: number;
    }
  | {
      readonly kind: 'radial-gradient';
      readonly stops: readonly GradientStop[];
      readonly center: Point;
      readonly radius: number;
    }
  | { readonly kind: 'pattern'; readonly patternId: string };

export const Fill = {
  none(): Fill {
    return { kind: 'none' };
  },

  solid(color: Color): Fill {
    return { kind: 'solid', color };
  },

  linearGradient(stops: readonly GradientStop[], angleDeg = 0): Fill {
    return { kind: 'linear-gradient', stops, angleDeg };
  },

  radialGradient(stops: readonly GradientStop[], center: Point, radius: number): Fill {
    return { kind: 'radial-gradient', stops, center, radius };
  },

  pattern(patternId: string): Fill {
    return { kind: 'pattern', patternId };
  },

  NONE: { kind: 'none' } as Fill,
  BLACK: { kind: 'solid', color: Color.BLACK } as Fill,
  WHITE: { kind: 'solid', color: Color.WHITE } as Fill,
  TRANSPARENT: { kind: 'none' } as Fill,

  isNone(f: Fill): boolean {
    return f.kind === 'none';
  },

  isSolid(f: Fill): f is { kind: 'solid'; color: Color } {
    return f.kind === 'solid';
  },

  equals(a: Fill, b: Fill): boolean {
    if (a.kind !== b.kind) return false;
    if (a.kind === 'none' && b.kind === 'none') return true;
    if (a.kind === 'solid' && b.kind === 'solid') return Color.equals(a.color, b.color);
    if (a.kind === 'pattern' && b.kind === 'pattern') return a.patternId === b.patternId;
    return false;
  },
} as const;
