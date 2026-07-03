import type { ICommand } from './ICommand';
import type { Document } from '../../domain/aggregates/Document';
import type { SvgNode } from '../../domain/entities/SvgNode';
import type { NodeId } from '../../domain/value-objects/NodeId';
import { DocumentMutations } from '../../domain/aggregates/Document';

export type NodeUpdater = (node: SvgNode, doc: Document) => SvgNode | null | undefined;

export class UpdateNodesCommand implements ICommand {
  private readonly beforeSnapshots = new Map<NodeId, SvgNode>();

  constructor(
    readonly description: string,
    private readonly ids: readonly NodeId[],
    private readonly updater: NodeUpdater,
  ) {}

  execute(doc: Document): Document {
    this.beforeSnapshots.clear();
    return this.ids.reduce((currentDoc, id) => {
      const node = currentDoc.nodes.get(id);
      if (!node) return currentDoc;
      const updated = this.updater(node, currentDoc);
      if (!updated) return currentDoc;
      this.beforeSnapshots.set(id, node);
      return DocumentMutations.updateNode(currentDoc, id, updated);
    }, doc);
  }

  undo(doc: Document): Document {
    let currentDoc = doc;
    for (const [id, snapshot] of this.beforeSnapshots) {
      currentDoc = DocumentMutations.updateNode(currentDoc, id, snapshot);
    }
    return currentDoc;
  }
}
