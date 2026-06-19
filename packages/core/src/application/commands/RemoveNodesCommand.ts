import type { ICommand } from './ICommand';
import type { Document } from '../../domain/aggregates/Document';
import type { SvgNode } from '../../domain/entities/SvgNode';
import type { NodeId } from '../../domain/value-objects/NodeId';
import { DocumentMutations } from '../../domain/aggregates/Document';

export class RemoveNodesCommand implements ICommand {
  readonly description = 'Remove nodes';
  private snapshots: SvgNode[] = [];
  private parentIds: Array<NodeId | null> = [];

  constructor(private readonly ids: readonly NodeId[]) {}

  execute(doc: Document): Document {
    this.snapshots = this.ids
      .map((id) => doc.nodes.get(id))
      .filter((n): n is SvgNode => n !== undefined);
    this.parentIds = this.ids.map((id) => DocumentMutations.findParentId(doc, id));
    return DocumentMutations.removeNodes(doc, this.ids);
  }

  undo(doc: Document): Document {
    return this.snapshots.reduce((d, node, i) => {
      const parentId = this.parentIds[i] ?? undefined;
      return DocumentMutations.addNode(d, node, parentId);
    }, doc);
  }
}
