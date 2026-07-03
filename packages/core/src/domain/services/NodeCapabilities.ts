import type { SvgNode } from '../entities/SvgNode';
import type { SvgNodeType } from '../entities/SvgNodeBase';

export interface NodeCapabilities {
  readonly canFill: boolean;
  readonly canStroke: boolean;
  readonly canRoundCorners: boolean;
  readonly canEditText: boolean;
  readonly canEditPath: boolean;
  readonly canResize: boolean;
  readonly canRotate: boolean;
  readonly canFlip: boolean;
  readonly canCrop: boolean;
  readonly canUseGradient: boolean;
  readonly canUseRichText: boolean;
}

export type EditableAttributeKind =
  | 'string'
  | 'number'
  | 'boolean'
  | 'fill'
  | 'stroke'
  | 'transform'
  | 'points'
  | 'path-commands';

export interface EditableAttribute {
  readonly key: string;
  readonly kind: EditableAttributeKind;
  readonly min?: number;
  readonly max?: number;
}

const COMMON_ATTRIBUTES: readonly EditableAttribute[] = [
  { key: 'name', kind: 'string' },
  { key: 'fill', kind: 'fill' },
  { key: 'stroke', kind: 'stroke' },
  { key: 'opacity', kind: 'number', min: 0, max: 1 },
  { key: 'visibility', kind: 'boolean' },
  { key: 'locked', kind: 'boolean' },
  { key: 'transform', kind: 'transform' },
];

export const NodeCapabilities = {
  forNode(node: SvgNode): NodeCapabilities {
    return NodeCapabilities.forType(node.type);
  },

  forType(type: SvgNodeType): NodeCapabilities {
    const canFill = type !== 'image' && type !== 'use';
    const canStroke = type !== 'image' && type !== 'use';
    return {
      canFill,
      canStroke,
      canRoundCorners: type === 'rect',
      canEditText: type === 'text',
      canEditPath: type === 'path',
      canResize: type !== 'group',
      canRotate: true,
      canFlip: true,
      canCrop: type === 'image',
      canUseGradient: canFill || canStroke,
      canUseRichText: type === 'text',
    };
  },

  getEditableAttributes(node: SvgNode): readonly EditableAttribute[] {
    const base = [...COMMON_ATTRIBUTES];
    switch (node.type) {
      case 'rect':
        return [
          ...base,
          numberAttr('x'),
          numberAttr('y'),
          numberAttr('width', 0),
          numberAttr('height', 0),
          numberAttr('rx', 0),
          numberAttr('ry', 0),
        ];
      case 'circle':
        return [...base, numberAttr('cx'), numberAttr('cy'), numberAttr('r', 0)];
      case 'ellipse':
        return [
          ...base,
          numberAttr('cx'),
          numberAttr('cy'),
          numberAttr('rx', 0),
          numberAttr('ry', 0),
        ];
      case 'line':
        return [...base, numberAttr('x1'), numberAttr('y1'), numberAttr('x2'), numberAttr('y2')];
      case 'polyline':
      case 'polygon':
        return [...base, { key: 'points', kind: 'points' }];
      case 'path':
        return [...base, { key: 'commands', kind: 'path-commands' }];
      case 'text':
        return [
          ...base,
          numberAttr('x'),
          numberAttr('y'),
          { key: 'content', kind: 'string' },
          { key: 'fontFamily', kind: 'string' },
          numberAttr('fontSize', 0),
          { key: 'fontWeight', kind: 'string' },
          { key: 'fontStyle', kind: 'string' },
          { key: 'textAnchor', kind: 'string' },
          numberAttr('letterSpacing'),
        ];
      case 'image':
        return [
          ...withoutPaint(base),
          { key: 'href', kind: 'string' },
          numberAttr('x'),
          numberAttr('y'),
          numberAttr('width', 0),
          numberAttr('height', 0),
          { key: 'preserveAspectRatio', kind: 'string' },
        ];
      case 'use':
        return [
          ...withoutPaint(base),
          { key: 'href', kind: 'string' },
          numberAttr('x'),
          numberAttr('y'),
          numberAttr('width', 0),
          numberAttr('height', 0),
        ];
      case 'group':
        return base.filter((attribute) => attribute.key !== 'fill' && attribute.key !== 'stroke');
    }
  },
} as const;

function numberAttr(key: string, min?: number, max?: number): EditableAttribute {
  return {
    key,
    kind: 'number',
    ...(min === undefined ? {} : { min }),
    ...(max === undefined ? {} : { max }),
  };
}

function withoutPaint(attributes: readonly EditableAttribute[]): EditableAttribute[] {
  return attributes.filter((attribute) => attribute.key !== 'fill' && attribute.key !== 'stroke');
}
