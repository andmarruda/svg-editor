import type { Document } from '../../../domain/aggregates/Document';
import type { Selection } from '../../../domain/aggregates/Selection';
import type { IIdGenerator } from '../../ports/driven/IIdGenerator';
import type { HistoryManager } from '../../history/HistoryManager';
import type { SvgNode } from '../../../domain/entities/SvgNode';
import type { NodeId } from '../../../domain/value-objects/NodeId';
import { AddNodeCommand } from '../../commands/AddNodeCommand';
import { CompositeCommand } from '../../commands/CompositeCommand';
import { NodeId as NodeIdNS } from '../../../domain/value-objects/NodeId';

const PASTE_OFFSET = 10;

export class DuplicateUseCase {
  constructor(
    private readonly history: HistoryManager,
    private readonly idGenerator: IIdGenerator,
  ) {}

  execute(doc: Document, selection: Selection): { doc: Document; duplicatedIds: NodeId[] } {
    if (selection.ids.size === 0) return { doc, duplicatedIds: [] };

    const duplicatedIds: NodeId[] = [];
    const commands = [...selection.ids]
      .map((id) => doc.nodes.get(id))
      .filter((n): n is SvgNode => n !== undefined)
      .map((node) => {
        const newId = NodeIdNS.from(this.idGenerator.generate());
        duplicatedIds.push(newId);
        const dup = offsetNode(node, newId);
        return new AddNodeCommand(dup);
      });

    const newDoc = this.history.execute(new CompositeCommand('Duplicate', commands), doc);
    return { doc: newDoc, duplicatedIds };
  }
}

function offsetNode(node: SvgNode, newId: NodeId): SvgNode {
  const base = { ...node, id: newId };
  switch (base.type) {
    case 'rect':
    case 'image': return { ...base, x: base.x + PASTE_OFFSET, y: base.y + PASTE_OFFSET };
    case 'ellipse': return { ...base, cx: base.cx + PASTE_OFFSET, cy: base.cy + PASTE_OFFSET };
    case 'circle': return { ...base, cx: base.cx + PASTE_OFFSET, cy: base.cy + PASTE_OFFSET };
    case 'text': return { ...base, x: base.x + PASTE_OFFSET, y: base.y + PASTE_OFFSET };
    case 'line': return { ...base, x1: base.x1 + PASTE_OFFSET, y1: base.y1 + PASTE_OFFSET, x2: base.x2 + PASTE_OFFSET, y2: base.y2 + PASTE_OFFSET };
    default: return base;
  }
}
