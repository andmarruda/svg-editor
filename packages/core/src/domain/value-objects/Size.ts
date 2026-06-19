export interface Size {
  readonly width: number;
  readonly height: number;
}

export const Size = {
  of(width: number, height: number): Size {
    if (width < 0 || height < 0) {
      throw new Error(`Size dimensions must be non-negative, got (${width}, ${height})`);
    }
    return { width, height };
  },

  ZERO: { width: 0, height: 0 } as Size,

  scale(s: Size, factor: number): Size {
    return Size.of(s.width * factor, s.height * factor);
  },

  scaleXY(s: Size, sx: number, sy: number): Size {
    return Size.of(s.width * sx, s.height * sy);
  },

  aspectRatio(s: Size): number {
    if (s.height === 0) return 0;
    return s.width / s.height;
  },

  equals(a: Size, b: Size): boolean {
    return a.width === b.width && a.height === b.height;
  },

  isEmpty(s: Size): boolean {
    return s.width === 0 || s.height === 0;
  },
} as const;
