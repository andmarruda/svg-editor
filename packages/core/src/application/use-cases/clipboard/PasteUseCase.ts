import type { Document } from '../../../domain/aggregates/Document';
import type { IClipboardAdapter } from '../../ports/driven/IClipboardAdapter';
import type { IIdGenerator } from '../../ports/driven/IIdGenerator';
import type { HistoryManager } from '../../history/HistoryManager';
import type { SvgNode } from '../../../domain/entities/SvgNode';
import type { NodeId } from '../../../domain/value-objects/NodeId';
import { AddNodeCommand } from '../../commands/AddNodeCommand';
import { CompositeCommand } from '../../commands/CompositeCommand';
import { NodeId as NodeIdNS } from '../../../domain/value-objects/NodeId';

const PASTE_OFFSET = 10;

export class PasteUseCase {
  constructor(
    private readonly clipboard: IClipboardAdapter,
    private readonly history: HistoryManager,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async execute(doc: Document): Promise<{ doc: Document; pastedIds: NodeId[] }> {
    const nodes = await this.clipboard.read();
    if (!nodes || nodes.length === 0) return { doc, pastedIds: [] };

    const pastedIds: NodeId[] = [];
    const commands = nodes.map((node) => {
      const newId = NodeIdNS.from(this.idGenerator.generate());
      pastedIds.push(newId);
      const offset = { x: PASTE_OFFSET, y: PASTE_OFFSET };
      const offsetNode = applyOffset(node, newId, offset);
      return new AddNodeCommand(offsetNode);
    });

    const newDoc = this.history.execute(new CompositeCommand('Paste', commands), doc);
    return { doc: newDoc, pastedIds };
  }
}

function applyOffset(node: SvgNode, newId: NodeId, offset: { x: number; y: number }): SvgNode {
  const base = { ...node, id: newId };
  switch (base.type) {
    case 'rect':
    case 'image': return { ...base, x: base.x + offset.x, y: base.y + offset.y };
    case 'ellipse': return { ...base, cx: base.cx + offset.x, cy: base.cy + offset.y };
    case 'circle': return { ...base, cx: base.cx + offset.x, cy: base.cy + offset.y };
    case 'text': return { ...base, x: base.x + offset.x, y: base.y + offset.y };
    case 'line': return { ...base, x1: base.x1 + offset.x, y1: base.y1 + offset.y, x2: base.x2 + offset.x, y2: base.y2 + offset.y };
    default: return base;
  }
}
