import { Color } from './Color';

export type LineCap = 'butt' | 'round' | 'square';
export type LineJoin = 'miter' | 'round' | 'bevel';

export interface Stroke {
  readonly color: Color;
  readonly width: number;
  readonly opacity: number; // 0–1
  readonly dashArray: readonly number[];
  readonly dashOffset: number;
  readonly lineCap: LineCap;
  readonly lineJoin: LineJoin;
  readonly miterLimit: number;
}

export const Stroke = {
  DEFAULT: {
    color: Color.BLACK,
    width: 1,
    opacity: 1,
    dashArray: [],
    dashOffset: 0,
    lineCap: 'butt' as LineCap,
    lineJoin: 'miter' as LineJoin,
    miterLimit: 4,
  } as Stroke,

  NONE: {
    color: Color.TRANSPARENT,
    width: 0,
    opacity: 0,
    dashArray: [],
    dashOffset: 0,
    lineCap: 'butt' as LineCap,
    lineJoin: 'miter' as LineJoin,
    miterLimit: 4,
  } as Stroke,

  of(partial: Partial<Stroke>): Stroke {
    return { ...Stroke.DEFAULT, ...partial };
  },

  withColor(s: Stroke, color: Color): Stroke {
    return { ...s, color };
  },

  withWidth(s: Stroke, width: number): Stroke {
    if (width < 0) throw new Error('Stroke width must be non-negative');
    return { ...s, width };
  },

  withOpacity(s: Stroke, opacity: number): Stroke {
    return { ...s, opacity: Math.min(1, Math.max(0, opacity)) };
  },

  isDashed(s: Stroke): boolean {
    return s.dashArray.length > 0;
  },

  isVisible(s: Stroke): boolean {
    return s.width > 0 && s.opacity > 0 && s.color.a > 0;
  },

  equals(a: Stroke, b: Stroke): boolean {
    return (
      Color.equals(a.color, b.color) &&
      a.width === b.width &&
      a.opacity === b.opacity &&
      a.lineCap === b.lineCap &&
      a.lineJoin === b.lineJoin &&
      a.miterLimit === b.miterLimit &&
      a.dashOffset === b.dashOffset &&
      a.dashArray.length === b.dashArray.length &&
      a.dashArray.every((v, i) => v === b.dashArray[i])
    );
  },
} as const;
