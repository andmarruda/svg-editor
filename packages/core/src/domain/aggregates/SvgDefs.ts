import type { Color } from '../value-objects/Color';
import type { Point } from '../value-objects/Point';

export interface GradientStopDef {
  readonly offset: number; // 0–1
  readonly color: Color;
  readonly opacity: number; // 0–1
}

export interface LinearGradientDef {
  readonly kind: 'linear-gradient';
  readonly id: string;
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  readonly stops: readonly GradientStopDef[];
  readonly gradientUnits: 'userSpaceOnUse' | 'objectBoundingBox';
}

export interface RadialGradientDef {
  readonly kind: 'radial-gradient';
  readonly id: string;
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
  readonly fx: number;
  readonly fy: number;
  readonly stops: readonly GradientStopDef[];
  readonly gradientUnits: 'userSpaceOnUse' | 'objectBoundingBox';
}

export interface RawXmlDef {
  readonly kind: 'raw-xml';
  readonly id: string;
  readonly tagName: string;
  readonly rawXml: string;
}

export type SvgDef = LinearGradientDef | RadialGradientDef | RawXmlDef;

export interface SvgMetadata {
  readonly title: string;
  readonly description: string;
  readonly xmlns: string;
  readonly xmlnsXlink: string;
  readonly extraAttributes: Readonly<Record<string, string>>;
}

export interface ViewBox {
  readonly minX: number;
  readonly minY: number;
  readonly width: number;
  readonly height: number;
}

export const ViewBox = {
  toString(vb: ViewBox): string {
    return `${vb.minX} ${vb.minY} ${vb.width} ${vb.height}`;
  },
  fromString(s: string): ViewBox {
    const parts = s
      .trim()
      .split(/[\s,]+/)
      .map(Number);
    if (parts.length < 4) throw new Error(`Invalid viewBox: "${s}"`);
    return {
      minX: parts[0] ?? 0,
      minY: parts[1] ?? 0,
      width: parts[2] ?? 0,
      height: parts[3] ?? 0,
    };
  },
} as const;

export const DEFAULT_METADATA: SvgMetadata = {
  title: '',
  description: '',
  xmlns: 'http://www.w3.org/2000/svg',
  xmlnsXlink: 'http://www.w3.org/1999/xlink',
  extraAttributes: {},
};
