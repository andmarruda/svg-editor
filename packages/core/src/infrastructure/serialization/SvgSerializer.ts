import type { Document } from '../../domain/aggregates/Document';
import type { SvgNode } from '../../domain/entities/SvgNode';
import type { SvgDef } from '../../domain/aggregates/SvgDefs';
import type { NodeId } from '../../domain/value-objects/NodeId';
import { ViewBox } from '../../domain/aggregates/SvgDefs';
import { Transform } from '../../domain/value-objects/Transform';
import { Fill } from '../../domain/value-objects/Fill';
import { Stroke } from '../../domain/value-objects/Stroke';
import { Color } from '../../domain/value-objects/Color';
import { serializePath } from './PathParser';
import { serializeTransform, serializePoints } from './SvgAttributeMapper';

export function serializeSvg(doc: Document): string {
  const lines: string[] = [];

  const vb = ViewBox.toString(doc.viewBox);
  lines.push(`<?xml version="1.0" encoding="UTF-8"?>`);
  lines.push(
    `<svg xmlns="${doc.metadata.xmlns}" xmlns:xlink="${doc.metadata.xmlnsXlink}" ` +
    `width="${fmt(doc.width)}" height="${fmt(doc.height)}" viewBox="${vb}">`,
  );

  if (doc.metadata.title) {
    lines.push(`  <title>${escXml(doc.metadata.title)}</title>`);
  }
  if (doc.metadata.description) {
    lines.push(`  <desc>${escXml(doc.metadata.description)}</desc>`);
  }

  // <defs>
  if (doc.defs.size > 0) {
    lines.push('  <defs>');
    for (const def of doc.defs.values()) {
      lines.push(...serializeDef(def).map((l) => `    ${l}`));
    }
    lines.push('  </defs>');
  }

  // Root nodes
  for (const id of doc.rootOrder) {
    const node = doc.nodes.get(id);
    if (node) lines.push(...serializeNode(node, doc, 1));
  }

  lines.push('</svg>');
  return lines.join('\n');
}

// ── Node serialization ─────────────────────────────────────────────────────

function serializeNode(node: SvgNode, doc: Document, depth: number): string[] {
  const indent = '  '.repeat(depth);
  const baseAttrs = buildBaseAttrs(node);

  switch (node.type) {
    case 'rect':
      return [`${indent}<rect ${baseAttrs} x="${fmt(node.x)}" y="${fmt(node.y)}" width="${fmt(node.width)}" height="${fmt(node.height)}"${node.rx ? ` rx="${fmt(node.rx)}"` : ''}${node.ry ? ` ry="${fmt(node.ry)}"` : ''}/>`];

    case 'circle':
      return [`${indent}<circle ${baseAttrs} cx="${fmt(node.cx)}" cy="${fmt(node.cy)}" r="${fmt(node.r)}"/>`];

    case 'ellipse':
      return [`${indent}<ellipse ${baseAttrs} cx="${fmt(node.cx)}" cy="${fmt(node.cy)}" rx="${fmt(node.rx)}" ry="${fmt(node.ry)}"/>`];

    case 'line':
      return [`${indent}<line ${baseAttrs} x1="${fmt(node.x1)}" y1="${fmt(node.y1)}" x2="${fmt(node.x2)}" y2="${fmt(node.y2)}"/>`];

    case 'polyline':
      return [`${indent}<polyline ${baseAttrs} points="${serializePoints(node.points)}"/>`];

    case 'polygon':
      return [`${indent}<polygon ${baseAttrs} points="${serializePoints(node.points)}"/>`];

    case 'path':
      return [`${indent}<path ${baseAttrs} d="${serializePath(node.commands)}"/>`];

    case 'text':
      return [
        `${indent}<text ${baseAttrs} x="${fmt(node.x)}" y="${fmt(node.y)}" ` +
        `font-family="${escAttr(node.fontFamily)}" font-size="${fmt(node.fontSize)}" ` +
        `font-weight="${node.fontWeight}" font-style="${node.fontStyle}" ` +
        `text-anchor="${node.textAnchor}"${node.letterSpacing ? ` letter-spacing="${fmt(node.letterSpacing)}"` : ''}>` +
        `${escXml(node.content)}</text>`,
      ];

    case 'image':
      return [
        `${indent}<image ${baseAttrs} x="${fmt(node.x)}" y="${fmt(node.y)}" ` +
        `width="${fmt(node.width)}" height="${fmt(node.height)}" ` +
        `href="${escAttr(node.href)}" preserveAspectRatio="${node.preserveAspectRatio}"/>`,
      ];

    case 'group': {
      const lines = [`${indent}<g ${baseAttrs}>`];
      for (const childId of node.children) {
        const child = doc.nodes.get(childId);
        if (child) lines.push(...serializeNode(child, doc, depth + 1));
      }
      lines.push(`${indent}</g>`);
      return lines;
    }

    case 'use':
      return [`${indent}<use ${baseAttrs} href="#${node.href}" x="${fmt(node.x)}" y="${fmt(node.y)}"${node.width ? ` width="${fmt(node.width)}"` : ''}${node.height ? ` height="${fmt(node.height)}"` : ''}/>`];
  }
}

// ── Defs serialization ─────────────────────────────────────────────────────

function serializeDef(def: SvgDef): string[] {
  if (def.kind === 'raw-xml') return [def.rawXml];

  if (def.kind === 'linear-gradient') {
    const stops = def.stops.map(
      (s) => `  <stop offset="${s.offset}" stop-color="${Color.toHex(s.color)}" stop-opacity="${s.opacity}"/>`,
    );
    return [
      `<linearGradient id="${def.id}" x1="${def.x1}" y1="${def.y1}" x2="${def.x2}" y2="${def.y2}" gradientUnits="${def.gradientUnits}">`,
      ...stops,
      '</linearGradient>',
    ];
  }

  if (def.kind === 'radial-gradient') {
    const stops = def.stops.map(
      (s) => `  <stop offset="${s.offset}" stop-color="${Color.toHex(s.color)}" stop-opacity="${s.opacity}"/>`,
    );
    return [
      `<radialGradient id="${def.id}" cx="${def.cx}" cy="${def.cy}" r="${def.r}" fx="${def.fx}" fy="${def.fy}" gradientUnits="${def.gradientUnits}">`,
      ...stops,
      '</radialGradient>',
    ];
  }

  return [];
}

// ── Attribute helpers ──────────────────────────────────────────────────────

function buildBaseAttrs(node: SvgNode): string {
  const parts: string[] = [];

  if (node.name && node.name !== node.type) parts.push(`id="${escAttr(node.id)}"`);
  else parts.push(`id="${escAttr(node.id)}"`);

  const fillStr = serializeFill(node.fill);
  parts.push(`fill="${fillStr}"`);

  if (Stroke.isVisible(node.stroke)) {
    parts.push(`stroke="${Color.toHex(node.stroke.color)}"`);
    if (node.stroke.width !== 1) parts.push(`stroke-width="${fmt(node.stroke.width)}"`);
    if (node.stroke.opacity !== 1) parts.push(`stroke-opacity="${fmt(node.stroke.opacity)}"`);
    if (node.stroke.lineCap !== 'butt') parts.push(`stroke-linecap="${node.stroke.lineCap}"`);
    if (node.stroke.lineJoin !== 'miter') parts.push(`stroke-linejoin="${node.stroke.lineJoin}"`);
    if (node.stroke.dashArray.length > 0) parts.push(`stroke-dasharray="${node.stroke.dashArray.join(' ')}"`);
  } else {
    parts.push('stroke="none"');
  }

  if (node.opacity !== 1) parts.push(`opacity="${fmt(node.opacity)}"`);
  if (!node.visibility) parts.push('visibility="hidden"');

  const transformStr = serializeTransform(node.transform);
  if (transformStr) parts.push(`transform="${transformStr}"`);

  return parts.join(' ');
}

function serializeFill(fill: Fill): string {
  if (fill.kind === 'none') return 'none';
  if (fill.kind === 'solid') return Color.toHex(fill.color);
  if (fill.kind === 'pattern') return `url(#${fill.patternId})`;
  if (fill.kind === 'linear-gradient') return `url(#lg)`;
  if (fill.kind === 'radial-gradient') return `url(#rg)`;
  return 'none';
}

function fmt(n: number): string {
  return parseFloat(n.toFixed(4)).toString();
}

function escXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}
