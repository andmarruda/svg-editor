import type { ICommand } from './ICommand';
import type { Document } from '../../domain/aggregates/Document';
import type { NodeId } from '../../domain/value-objects/NodeId';
import { DocumentMutations } from '../../domain/aggregates/Document';

export class ReorderNodeCommand implements ICommand {
  readonly description = 'Reorder node';
  private previousIndex = -1;

  constructor(
    private readonly id: NodeId,
    private readonly toIndex: number,
    private readonly groupId?: NodeId,
  ) {}

  execute(doc: Document): Document {
    const order = this.groupId
      ? (() => { const g = doc.nodes.get(this.groupId!); return g?.type === 'group' ? g.children : []; })()
      : doc.rootOrder;
    this.previousIndex = order.indexOf(this.id);
    if (this.groupId) return DocumentMutations.reorderInGroup(doc, this.groupId, this.id, this.toIndex);
    return DocumentMutations.reorderInRoot(doc, this.id, this.toIndex);
  }

  undo(doc: Document): Document {
    if (this.previousIndex === -1) return doc;
    if (this.groupId) return DocumentMutations.reorderInGroup(doc, this.groupId, this.id, this.previousIndex);
    return DocumentMutations.reorderInRoot(doc, this.id, this.previousIndex);
  }
}
