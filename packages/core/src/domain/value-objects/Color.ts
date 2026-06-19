export interface Color {
  readonly r: number; // 0–255
  readonly g: number; // 0–255
  readonly b: number; // 0–255
  readonly a: number; // 0–1
}

export const Color = {
  of(r: number, g: number, b: number, a = 1): Color {
    return { r: clamp(r, 0, 255), g: clamp(g, 0, 255), b: clamp(b, 0, 255), a: clamp(a, 0, 1) };
  },

  BLACK: { r: 0, g: 0, b: 0, a: 1 } as Color,
  WHITE: { r: 255, g: 255, b: 255, a: 1 } as Color,
  TRANSPARENT: { r: 0, g: 0, b: 0, a: 0 } as Color,

  fromHex(hex: string): Color {
    const clean = hex.replace(/^#/, '');
    if (!/^[0-9a-fA-F]+$/.test(clean)) throw new Error(`Invalid hex color: ${hex}`);
    if (clean.length === 3) {
      const [r, g, b] = clean.split('').map((c) => parseInt(c + c, 16));
      return Color.of(r ?? 0, g ?? 0, b ?? 0);
    }
    if (clean.length === 6) {
      const r = parseInt(clean.slice(0, 2), 16);
      const g = parseInt(clean.slice(2, 4), 16);
      const b = parseInt(clean.slice(4, 6), 16);
      return Color.of(r, g, b);
    }
    if (clean.length === 8) {
      const r = parseInt(clean.slice(0, 2), 16);
      const g = parseInt(clean.slice(2, 4), 16);
      const b = parseInt(clean.slice(4, 6), 16);
      const a = parseInt(clean.slice(6, 8), 16) / 255;
      return Color.of(r, g, b, a);
    }
    throw new Error(`Invalid hex color: ${hex}`);
  },

  fromCssRgb(css: string): Color {
    const match = css.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/);
    if (!match) throw new Error(`Invalid CSS rgb color: ${css}`);
    return Color.of(
      parseInt(match[1] ?? '0'),
      parseInt(match[2] ?? '0'),
      parseInt(match[3] ?? '0'),
      match[4] !== undefined ? parseFloat(match[4]) : 1,
    );
  },

  toHex(c: Color): string {
    const r = Math.round(c.r).toString(16).padStart(2, '0');
    const g = Math.round(c.g).toString(16).padStart(2, '0');
    const b = Math.round(c.b).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  },

  toRgba(c: Color): string {
    return `rgba(${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)},${c.a})`;
  },

  withAlpha(c: Color, a: number): Color {
    return { ...c, a: clamp(a, 0, 1) };
  },

  equals(a: Color, b: Color): boolean {
    return a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a;
  },
} as const;

function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max);
}
