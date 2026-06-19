import type { ICommand } from './ICommand';
import type { Document } from '../../domain/aggregates/Document';
import type { NodeId } from '../../domain/value-objects/NodeId';
import type { GroupNode } from '../../domain/entities/GroupNode';
import { DocumentMutations } from '../../domain/aggregates/Document';

export class UngroupNodesCommand implements ICommand {
  readonly description = 'Ungroup';
  private snapshot: GroupNode | null = null;
  private groupIndex = -1;

  constructor(private readonly groupId: NodeId) {}

  execute(doc: Document): Document {
    const group = doc.nodes.get(this.groupId);
    if (!group || group.type !== 'group') return doc;

    this.snapshot = group;
    this.groupIndex = doc.rootOrder.indexOf(this.groupId);

    const children = group.children;
    const filteredRoot = doc.rootOrder.filter((id) => id !== this.groupId);
    const newRoot = [
      ...filteredRoot.slice(0, this.groupIndex),
      ...children,
      ...filteredRoot.slice(this.groupIndex),
    ];

    const updatedNodes = new Map(doc.nodes);
    updatedNodes.delete(this.groupId);

    return { ...doc, nodes: updatedNodes, rootOrder: newRoot };
  }

  undo(doc: Document): Document {
    if (!this.snapshot) return doc;

    const group = this.snapshot;
    const filteredRoot = doc.rootOrder.filter((id) => !group.children.includes(id));
    const insertAt = Math.max(0, Math.min(this.groupIndex, filteredRoot.length));
    const newRoot = [...filteredRoot.slice(0, insertAt), this.groupId, ...filteredRoot.slice(insertAt)];

    const updatedNodes = new Map(doc.nodes);
    updatedNodes.set(this.groupId, group);

    return { ...doc, nodes: updatedNodes, rootOrder: newRoot };
  }
}
