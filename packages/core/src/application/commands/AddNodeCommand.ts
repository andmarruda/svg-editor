import type { ICommand } from './ICommand';
import type { Document } from '../../domain/aggregates/Document';
import type { SvgNode } from '../../domain/entities/SvgNode';
import type { NodeId } from '../../domain/value-objects/NodeId';
import { DocumentMutations } from '../../domain/aggregates/Document';

export class AddNodeCommand implements ICommand {
  readonly description = 'Add node';

  constructor(
    private readonly node: SvgNode,
    private readonly parentId?: NodeId,
  ) {}

  execute(doc: Document): Document {
    return DocumentMutations.addNode(doc, this.node, this.parentId);
  }

  undo(doc: Document): Document {
    return DocumentMutations.removeNode(doc, this.node.id);
  }
}
