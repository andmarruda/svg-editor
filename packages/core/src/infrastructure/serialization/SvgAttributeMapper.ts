import { Transform } from '../../domain/value-objects/Transform';
import { Color } from '../../domain/value-objects/Color';
import { Fill } from '../../domain/value-objects/Fill';
import { Stroke } from '../../domain/value-objects/Stroke';
import type { LineCap, LineJoin } from '../../domain/value-objects/Stroke';
import { Point } from '../../domain/value-objects/Point';

// ── Transform ──────────────────────────────────────────────────────────────

export function parseTransformAttr(value: string | null | undefined): Transform {
  if (!value?.trim()) return Transform.identity();

  const transforms: Transform[] = [];
  const regex = /(\w+)\s*\(([^)]*)\)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(value)) !== null) {
    const fn = match[1] ?? '';
    const args = (match[2] ?? '').trim().split(/[\s,]+/).map(Number);

    switch (fn) {
      case 'matrix':
        if (args.length >= 6) {
          transforms.push(Transform.of(args[0]!, args[1]!, args[2]!, args[3]!, args[4]!, args[5]!));
        }
        break;
      case 'translate':
        transforms.push(Transform.translation(args[0] ?? 0, args[1] ?? 0));
        break;
      case 'scale':
        transforms.push(Transform.scaling(args[0] ?? 1, args[1] ?? args[0] ?? 1));
        break;
      case 'rotate': {
        const angle = args[0] ?? 0;
        const cx = args[1] ?? 0;
        const cy = args[2] ?? 0;
        transforms.push(Transform.rotation(angle, cx, cy));
        break;
      }
      case 'skewX': {
        const rad = ((args[0] ?? 0) * Math.PI) / 180;
        transforms.push(Transform.of(1, 0, Math.tan(rad), 1, 0, 0));
        break;
      }
      case 'skewY': {
        const rad = ((args[0] ?? 0) * Math.PI) / 180;
        transforms.push(Transform.of(1, Math.tan(rad), 0, 1, 0, 0));
        break;
      }
    }
  }

  if (transforms.length === 0) return Transform.identity();
  return transforms.reduce((acc, t) => Transform.multiply(acc, t));
}

export function serializeTransform(t: Transform): string | null {
  if (Transform.isIdentity(t)) return null;
  const [a, b, c, d, e, f] = t.matrix;
  return `matrix(${fmt(a)},${fmt(b)},${fmt(c)},${fmt(d)},${fmt(e)},${fmt(f)})`;
}

// ── Color ──────────────────────────────────────────────────────────────────

export function parseColorAttr(value: string | null | undefined): Color | null {
  if (!value || value === 'none' || value === 'inherit' || value === 'currentColor') return null;
  try {
    if (value.startsWith('#')) return Color.fromHex(value);
    if (value.startsWith('rgb')) return Color.fromCssRgb(value);
    const named = NAMED_COLORS[value.toLowerCase()];
    if (named) return Color.fromHex(named);
  } catch {
    /* ignore unparseable colors */
  }
  return null;
}

// ── Fill ────────────────────────────────────────────────────────────────────

export function parseFillAttr(
  value: string | null | undefined,
  opacity: number,
): Fill {
  if (!value || value === 'none') return Fill.none();
  if (value.startsWith('url(')) return Fill.pattern(value.slice(5, -1));
  const color = parseColorAttr(value);
  if (!color) return Fill.none();
  return Fill.solid(Color.withAlpha(color, opacity));
}

// ── Stroke ─────────────────────────────────────────────────────────────────

export function parseStrokeAttrs(attrs: Record<string, string | undefined>): Stroke {
  const colorStr = attrs['stroke'];
  if (!colorStr || colorStr === 'none') return Stroke.NONE;

  const color = parseColorAttr(colorStr) ?? Color.BLACK;
  const opacity = parseFloat(attrs['stroke-opacity'] ?? '1');
  const width = parseFloat(attrs['stroke-width'] ?? '1');
  const lineCap = (attrs['stroke-linecap'] ?? 'butt') as LineCap;
  const lineJoin = (attrs['stroke-linejoin'] ?? 'miter') as LineJoin;
  const miterLimit = parseFloat(attrs['stroke-miterlimit'] ?? '4');
  const dashOffset = parseFloat(attrs['stroke-dashoffset'] ?? '0');
  const dashArrayStr = attrs['stroke-dasharray'];
  const dashArray = dashArrayStr && dashArrayStr !== 'none'
    ? dashArrayStr.split(/[\s,]+/).map(Number)
    : [];

  return {
    color: Color.withAlpha(color, isNaN(opacity) ? 1 : opacity),
    width: isNaN(width) ? 1 : width,
    opacity: isNaN(opacity) ? 1 : opacity,
    lineCap: ['butt', 'round', 'square'].includes(lineCap) ? lineCap : 'butt',
    lineJoin: ['miter', 'round', 'bevel'].includes(lineJoin) ? lineJoin : 'miter',
    miterLimit: isNaN(miterLimit) ? 4 : miterLimit,
    dashOffset: isNaN(dashOffset) ? 0 : dashOffset,
    dashArray,
  };
}

// ── Points (polyline/polygon) ──────────────────────────────────────────────

export function parsePointsAttr(value: string | null | undefined): Point[] {
  if (!value?.trim()) return [];
  const nums = value.trim().split(/[\s,]+/).map(Number);
  const points: Point[] = [];
  for (let i = 0; i + 1 < nums.length; i += 2) {
    points.push(Point.of(nums[i] ?? 0, nums[i + 1] ?? 0));
  }
  return points;
}

export function serializePoints(points: readonly Point[]): string {
  return points.map((p) => `${fmt(p.x)},${fmt(p.y)}`).join(' ');
}

// ── Inline style parsing ───────────────────────────────────────────────────

export function parseStyleAttr(style: string | null | undefined): Record<string, string> {
  if (!style?.trim()) return {};
  return Object.fromEntries(
    style
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((decl) => {
        const idx = decl.indexOf(':');
        return [decl.slice(0, idx).trim(), decl.slice(idx + 1).trim()] as [string, string];
      }),
  );
}

// ── Utilities ─────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return parseFloat(n.toFixed(4)).toString();
}

const NAMED_COLORS: Record<string, string> = {
  black: '#000000', white: '#ffffff', red: '#ff0000', green: '#008000',
  blue: '#0000ff', yellow: '#ffff00', cyan: '#00ffff', magenta: '#ff00ff',
  orange: '#ffa500', purple: '#800080', pink: '#ffc0cb', gray: '#808080',
  grey: '#808080', silver: '#c0c0c0', gold: '#ffd700', brown: '#a52a2a',
  lime: '#00ff00', navy: '#000080', teal: '#008080', maroon: '#800000',
  olive: '#808000', aqua: '#00ffff', fuchsia: '#ff00ff', transparent: '#00000000',
};
