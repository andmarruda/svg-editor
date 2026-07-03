import type { ICommand } from './ICommand';
import type { Document } from '../../domain/aggregates/Document';
import type { NodeId } from '../../domain/value-objects/NodeId';
import type { Point } from '../../domain/value-objects/Point';
import type { ResizeHandle } from '../ports/driving/IEditorApplication';
import type { SvgNode } from '../../domain/entities/SvgNode';
import { DocumentMutations } from '../../domain/aggregates/Document';
import { BoundsCalculator } from '../../domain/services/BoundsCalculator';

export class ResizeNodeCommand implements ICommand {
  readonly description = 'Resize node';
  private beforeSnapshot: SvgNode | null = null;

  constructor(
    private readonly id: NodeId,
    private readonly handle: ResizeHandle,
    private readonly delta: Point,
    private readonly keepAspectRatio: boolean,
  ) {}

  execute(doc: Document): Document {
    const node = doc.nodes.get(this.id);
    if (!node) return doc;
    this.beforeSnapshot = node;
    const resized = applyResize(node, this.handle, this.delta, this.keepAspectRatio);
    return DocumentMutations.updateNode(doc, this.id, resized);
  }

  undo(doc: Document): Document {
    if (!this.beforeSnapshot) return doc;
    return DocumentMutations.updateNode(doc, this.id, this.beforeSnapshot);
  }
}

function applyResize(
  node: SvgNode,
  handle: ResizeHandle,
  delta: Point,
  keepAspectRatio: boolean,
): SvgNode {
  const bounds = BoundsCalculator.forNode(node);
  let { x, y, width, height } = bounds;

  const isLeft = handle.includes('left');
  const isRight = handle.includes('right');
  const isTop = handle.includes('top');
  const isBottom = handle.includes('bottom');

  if (isLeft) {
    x += delta.x;
    width -= delta.x;
  }
  if (isRight) {
    width += delta.x;
  }
  if (isTop) {
    y += delta.y;
    height -= delta.y;
  }
  if (isBottom) {
    height += delta.y;
  }

  width = Math.max(1, width);
  height = Math.max(1, height);

  if (keepAspectRatio && bounds.width > 0) {
    const ratio = bounds.width / bounds.height;
    if (isLeft || isRight) height = width / ratio;
    else width = height * ratio;
  }

  switch (node.type) {
    case 'rect':
      return { ...node, x, y, width, height };
    case 'image':
      return { ...node, x, y, width, height };
    case 'ellipse':
      return { ...node, cx: x + width / 2, cy: y + height / 2, rx: width / 2, ry: height / 2 };
    case 'circle': {
      const r = Math.min(width, height) / 2;
      return { ...node, cx: x + r, cy: y + r, r };
    }
    default:
      return node;
  }
}
