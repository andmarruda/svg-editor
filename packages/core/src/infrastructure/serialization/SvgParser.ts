import type { Document } from '../../domain/aggregates/Document';
import type { SvgNode } from '../../domain/entities/SvgNode';
import type { SvgDef } from '../../domain/aggregates/SvgDefs';
import type { NodeId, DocumentId } from '../../domain/value-objects/NodeId';
import { DocumentMutations, Document as Doc } from '../../domain/aggregates/Document';
import { DEFAULT_METADATA, ViewBox } from '../../domain/aggregates/SvgDefs';
import { Transform } from '../../domain/value-objects/Transform';
import { Fill } from '../../domain/value-objects/Fill';
import { Stroke } from '../../domain/value-objects/Stroke';
import { Color } from '../../domain/value-objects/Color';
import { parsePath } from './PathParser';
import {
  parseTransformAttr,
  parseFillAttr,
  parseStrokeAttrs,
  parsePointsAttr,
  parseStyleAttr,
} from './SvgAttributeMapper';

let _idCounter = 0;
function nextId(): NodeId {
  return `node-${++_idCounter}` as NodeId;
}

export function parseSvg(svgString: string, docId: DocumentId): Document {
  _idCounter = 0;
  const parser = new DOMParser();
  const dom = parser.parseFromString(svgString, 'image/svg+xml');
  const root = dom.documentElement;

  if (root.tagName === 'parsererror' || root.querySelector('parsererror')) {
    throw new Error('Invalid SVG: parse error');
  }

  const width = parseFloat(root.getAttribute('width') ?? '800') || 800;
  const height = parseFloat(root.getAttribute('height') ?? '600') || 600;
  const viewBoxStr = root.getAttribute('viewBox');
  const viewBox = viewBoxStr ? ViewBox.fromString(viewBoxStr) : { minX: 0, minY: 0, width, height };

  let doc = Doc.create(docId, width, height, viewBox);

  // Parse <defs>
  const defsEl = root.querySelector('defs');
  if (defsEl) {
    for (const child of Array.from(defsEl.children)) {
      const def = parseDef(child);
      if (def) doc = DocumentMutations.addDef(doc, def);
    }
  }

  // Parse root-level children (skip defs, title, desc)
  for (const child of Array.from(root.children)) {
    const tag = child.tagName.toLowerCase();
    if (['defs', 'title', 'desc', 'metadata'].includes(tag)) continue;
    const node = parseElement(child, getInheritedAttrs({}));
    if (node) doc = DocumentMutations.addNode(doc, node);
  }

  const titleEl = root.querySelector(':scope > title');
  const descEl = root.querySelector(':scope > desc');

  doc = {
    ...doc,
    title: titleEl?.textContent?.trim() ?? '',
    metadata: {
      ...DEFAULT_METADATA,
      xmlns: root.getAttribute('xmlns') ?? DEFAULT_METADATA.xmlns,
      xmlnsXlink: root.getAttribute('xmlns:xlink') ?? DEFAULT_METADATA.xmlnsXlink,
      title: titleEl?.textContent?.trim() ?? '',
      description: descEl?.textContent?.trim() ?? '',
      extraAttributes: {},
    },
  };

  return doc;
}

// ── Element dispatch ───────────────────────────────────────────────────────

function parseElement(el: Element, inherited: InheritedAttrs): SvgNode | null {
  const tag = el.tagName.toLowerCase();
  const attrs = mergeAttrs(el, inherited);

  switch (tag) {
    case 'rect':
      return parseRect(el, attrs);
    case 'circle':
      return parseCircle(el, attrs);
    case 'ellipse':
      return parseEllipse(el, attrs);
    case 'line':
      return parseLine(el, attrs);
    case 'polyline':
      return parsePolyline(el, attrs);
    case 'polygon':
      return parsePolygon(el, attrs);
    case 'path':
      return parsePath2(el, attrs);
    case 'text':
      return parseText(el, attrs);
    case 'image':
      return parseImage(el, attrs);
    case 'g':
      return parseGroup(el, attrs);
    case 'use':
      return parseUse(el, attrs);
    default:
      return parseRawXmlNode(el, attrs);
  }
}

// ── Base attrs ─────────────────────────────────────────────────────────────

interface InheritedAttrs {
  fill?: string;
  stroke?: string;
  'fill-opacity'?: string;
  'stroke-opacity'?: string;
  'stroke-width'?: string;
  'stroke-linecap'?: string;
  'stroke-linejoin'?: string;
  'stroke-miterlimit'?: string;
  'stroke-dasharray'?: string;
  'stroke-dashoffset'?: string;
  opacity?: string;
  visibility?: string;
  'font-family'?: string;
  'font-size'?: string;
  'font-weight'?: string;
  'font-style'?: string;
  'text-anchor'?: string;
  'dominant-baseline'?: string;
  'letter-spacing'?: string;
  'word-spacing'?: string;
  'text-decoration'?: string;
}

function getInheritedAttrs(parent: InheritedAttrs): InheritedAttrs {
  return { ...parent };
}

function mergeAttrs(el: Element, inherited: InheritedAttrs): Record<string, string> {
  const result: Record<string, string> = { ...inherited };

  // Presentation attributes
  for (const attr of Array.from(el.attributes)) {
    result[attr.name] = attr.value;
  }

  // Inline style overrides presentation attrs
  const style = parseStyleAttr(el.getAttribute('style'));
  Object.assign(result, style);

  return result;
}

function baseNode(el: Element, attrs: Record<string, string>) {
  const fillOpacity = parseFloat(attrs['fill-opacity'] ?? '1');
  const strokeOpacity = parseFloat(attrs['stroke-opacity'] ?? '1');
  const opacity = parseFloat(attrs['opacity'] ?? '1');
  const visibility = attrs['visibility'] !== 'hidden';

  return {
    id: (el.getAttribute('id') ?? nextId()) as NodeId,
    name: el.getAttribute('id') ?? el.tagName.toLowerCase(),
    transform: parseTransformAttr(attrs['transform']),
    fill: parseFillAttr(attrs['fill'] ?? 'black', isNaN(fillOpacity) ? 1 : fillOpacity),
    stroke: parseStrokeAttrs(attrs as Record<string, string | undefined>),
    opacity: isNaN(opacity) ? 1 : Math.min(1, Math.max(0, opacity)),
    visibility,
    locked: false,
    metadata: {},
  };
}

// ── Concrete parsers ───────────────────────────────────────────────────────

function parseRect(el: Element, attrs: Record<string, string>): SvgNode {
  return {
    ...baseNode(el, attrs),
    type: 'rect',
    x: parseFloat(attrs['x'] ?? '0') || 0,
    y: parseFloat(attrs['y'] ?? '0') || 0,
    width: parseFloat(attrs['width'] ?? '0') || 0,
    height: parseFloat(attrs['height'] ?? '0') || 0,
    rx: parseFloat(attrs['rx'] ?? '0') || 0,
    ry: parseFloat(attrs['ry'] ?? '0') || 0,
  };
}

function parseCircle(el: Element, attrs: Record<string, string>): SvgNode {
  return {
    ...baseNode(el, attrs),
    type: 'circle',
    cx: parseFloat(attrs['cx'] ?? '0') || 0,
    cy: parseFloat(attrs['cy'] ?? '0') || 0,
    r: parseFloat(attrs['r'] ?? '0') || 0,
  };
}

function parseEllipse(el: Element, attrs: Record<string, string>): SvgNode {
  return {
    ...baseNode(el, attrs),
    type: 'ellipse',
    cx: parseFloat(attrs['cx'] ?? '0') || 0,
    cy: parseFloat(attrs['cy'] ?? '0') || 0,
    rx: parseFloat(attrs['rx'] ?? '0') || 0,
    ry: parseFloat(attrs['ry'] ?? '0') || 0,
  };
}

function parseLine(el: Element, attrs: Record<string, string>): SvgNode {
  return {
    ...baseNode(el, attrs),
    type: 'line',
    x1: parseFloat(attrs['x1'] ?? '0') || 0,
    y1: parseFloat(attrs['y1'] ?? '0') || 0,
    x2: parseFloat(attrs['x2'] ?? '0') || 0,
    y2: parseFloat(attrs['y2'] ?? '0') || 0,
  };
}

function parsePolyline(el: Element, attrs: Record<string, string>): SvgNode {
  return {
    ...baseNode(el, attrs),
    type: 'polyline',
    points: parsePointsAttr(attrs['points']),
  };
}

function parsePolygon(el: Element, attrs: Record<string, string>): SvgNode {
  return {
    ...baseNode(el, attrs),
    type: 'polygon',
    points: parsePointsAttr(attrs['points']),
  };
}

function parsePath2(el: Element, attrs: Record<string, string>): SvgNode {
  const d = attrs['d'] ?? '';
  return {
    ...baseNode(el, attrs),
    type: 'path',
    commands: parsePath(d),
  };
}

function parseText(el: Element, attrs: Record<string, string>): SvgNode {
  const runs = Array.from(el.children)
    .filter((child) => child.tagName.toLowerCase() === 'tspan')
    .map((child) => parseTextRun(child, attrs));
  const content =
    runs.length > 0 ? runs.map((run) => run.content).join('') : (el.textContent ?? '');
  return {
    ...baseNode(el, attrs),
    type: 'text',
    x: parseFloat(attrs['x'] ?? '0') || 0,
    y: parseFloat(attrs['y'] ?? '0') || 0,
    content,
    fontFamily: attrs['font-family'] ?? 'sans-serif',
    fontSize: parseFloat(attrs['font-size'] ?? '16') || 16,
    fontWeight: (attrs['font-weight'] ??
      'normal') as import('../../domain/entities/TextNode').FontWeight,
    fontStyle: (attrs['font-style'] as 'normal' | 'italic' | 'oblique') ?? 'normal',
    textAnchor: (attrs['text-anchor'] as 'start' | 'middle' | 'end') ?? 'start',
    dominantBaseline:
      (attrs['dominant-baseline'] as import('../../domain/entities/TextNode').DominantBaseline) ??
      'auto',
    letterSpacing: parseFloat(attrs['letter-spacing'] ?? '0') || 0,
    wordSpacing: parseFloat(attrs['word-spacing'] ?? '0') || 0,
    textDecoration:
      (attrs['text-decoration'] as import('../../domain/entities/TextNode').TextDecoration) ??
      'none',
    lineHeight: parseFloat(attrs['data-line-height'] ?? '1.2') || 1.2,
    runs,
  };
}

function parseTextRun(
  el: Element,
  parentAttrs: Record<string, string>,
): import('../../domain/entities/TextNode').TextRun {
  const attrs = mergeAttrs(el, parentAttrs as InheritedAttrs);
  const style: import('../../domain/entities/TextNode').TextRunStyle = {};
  const fill = attrs['fill']
    ? parseFillAttr(attrs['fill'], parseFloat(attrs['fill-opacity'] ?? '1') || 1)
    : undefined;
  const stroke = attrs['stroke']
    ? parseStrokeAttrs(attrs as Record<string, string | undefined>)
    : undefined;
  if (fill !== undefined) Object.assign(style, { fill });
  if (stroke !== undefined) Object.assign(style, { stroke });
  if (attrs['font-family'] !== undefined)
    Object.assign(style, { fontFamily: attrs['font-family'] });
  if (attrs['font-size'] !== undefined)
    Object.assign(style, { fontSize: parseFloat(attrs['font-size']) });
  if (attrs['font-weight'] !== undefined)
    Object.assign(style, { fontWeight: attrs['font-weight'] });
  if (attrs['font-style'] !== undefined) Object.assign(style, { fontStyle: attrs['font-style'] });
  if (attrs['letter-spacing'] !== undefined)
    Object.assign(style, { letterSpacing: parseFloat(attrs['letter-spacing']) });
  if (attrs['word-spacing'] !== undefined)
    Object.assign(style, { wordSpacing: parseFloat(attrs['word-spacing']) });
  if (attrs['text-decoration'] !== undefined)
    Object.assign(style, { textDecoration: attrs['text-decoration'] });
  return {
    content: el.textContent ?? '',
    style,
  };
}

function parseImage(el: Element, attrs: Record<string, string>): SvgNode {
  const href = el.getAttribute('href') ?? el.getAttribute('xlink:href') ?? '';
  return {
    ...baseNode(el, attrs),
    type: 'image',
    x: parseFloat(attrs['x'] ?? '0') || 0,
    y: parseFloat(attrs['y'] ?? '0') || 0,
    width: parseFloat(attrs['width'] ?? '0') || 0,
    height: parseFloat(attrs['height'] ?? '0') || 0,
    href,
    preserveAspectRatio: (attrs['preserveAspectRatio'] as 'xMidYMid') ?? 'xMidYMid',
  };
}

function parseGroup(el: Element, attrs: Record<string, string>): SvgNode {
  const childAttrs = getInheritedAttrs(attrs as InheritedAttrs);
  const children: NodeId[] = [];
  const childNodes: SvgNode[] = [];

  for (const child of Array.from(el.children)) {
    const tag = child.tagName.toLowerCase();
    if (['title', 'desc', 'metadata'].includes(tag)) continue;
    const node = parseElement(child, childAttrs);
    if (node) {
      children.push(node.id);
      childNodes.push(node);
    }
  }

  const group: SvgNode = {
    ...baseNode(el, attrs),
    type: 'group',
    children,
    // Store child nodes in metadata for retrieval — they'll be added to Document separately
    metadata: { _childNodes: JSON.stringify(childNodes.map((n) => n.id)) },
  };

  return group;
}

function parseUse(el: Element, attrs: Record<string, string>): SvgNode {
  const href = (el.getAttribute('href') ?? el.getAttribute('xlink:href') ?? '').replace('#', '');
  return {
    ...baseNode(el, attrs),
    type: 'use',
    href: href as NodeId,
    x: parseFloat(attrs['x'] ?? '0') || 0,
    y: parseFloat(attrs['y'] ?? '0') || 0,
    width: parseFloat(attrs['width'] ?? '0') || 0,
    height: parseFloat(attrs['height'] ?? '0') || 0,
  };
}

function parseRawXmlNode(el: Element, attrs: Record<string, string>): SvgNode | null {
  // Unsupported elements are silently skipped in V1
  return null;
}

// ── Defs parsing ───────────────────────────────────────────────────────────

function parseDef(el: Element): SvgDef | null {
  const id = el.getAttribute('id') ?? '';
  const tag = el.tagName.toLowerCase();

  if (tag === 'lineargradient') {
    const stops = parseGradientStops(el);
    return {
      kind: 'linear-gradient',
      id,
      x1: parseFloat(el.getAttribute('x1') ?? '0'),
      y1: parseFloat(el.getAttribute('y1') ?? '0'),
      x2: parseFloat(el.getAttribute('x2') ?? '1'),
      y2: parseFloat(el.getAttribute('y2') ?? '0'),
      stops,
      gradientUnits: (el.getAttribute('gradientUnits') ??
        'objectBoundingBox') as 'objectBoundingBox',
    };
  }

  if (tag === 'radialgradient') {
    const stops = parseGradientStops(el);
    const cx = parseFloat(el.getAttribute('cx') ?? '0.5');
    const cy = parseFloat(el.getAttribute('cy') ?? '0.5');
    return {
      kind: 'radial-gradient',
      id,
      cx,
      cy,
      r: parseFloat(el.getAttribute('r') ?? '0.5'),
      fx: parseFloat(el.getAttribute('fx') ?? String(cx)),
      fy: parseFloat(el.getAttribute('fy') ?? String(cy)),
      stops,
      gradientUnits: (el.getAttribute('gradientUnits') ??
        'objectBoundingBox') as 'objectBoundingBox',
    };
  }

  // Everything else preserved as raw XML
  if (id) {
    return { kind: 'raw-xml', id, tagName: el.tagName, rawXml: el.outerHTML };
  }

  return null;
}

function parseGradientStops(el: Element) {
  return Array.from(el.querySelectorAll('stop')).map((stop) => {
    const style = parseStyleAttr(stop.getAttribute('style'));
    const colorStr = style['stop-color'] ?? stop.getAttribute('stop-color') ?? '#000000';
    const opacity = parseFloat(style['stop-opacity'] ?? stop.getAttribute('stop-opacity') ?? '1');
    const color = Color.fromHex(colorStr.startsWith('#') ? colorStr : '#000000');
    return {
      offset: parseFloat(stop.getAttribute('offset') ?? '0'),
      color,
      opacity: isNaN(opacity) ? 1 : opacity,
    };
  });
}
