import type { ICommand } from './ICommand';
import type { Document } from '../../domain/aggregates/Document';
import type { NodeId } from '../../domain/value-objects/NodeId';
import type { GroupNode } from '../../domain/entities/GroupNode';
import { DocumentMutations } from '../../domain/aggregates/Document';
import { Transform } from '../../domain/value-objects/Transform';
import { Fill } from '../../domain/value-objects/Fill';
import { Stroke } from '../../domain/value-objects/Stroke';

export class GroupNodesCommand implements ICommand {
  readonly description = 'Group nodes';

  constructor(
    private readonly groupId: NodeId,
    private readonly ids: readonly NodeId[],
  ) {}

  execute(doc: Document): Document {
    // Find the z-position of the topmost node
    const topIndex = Math.max(...this.ids.map((id) => doc.rootOrder.indexOf(id)).filter((i) => i !== -1));

    // Remove nodes from root
    const filteredRoot = doc.rootOrder.filter((id) => !this.ids.includes(id));
    const insertAt = Math.max(0, topIndex - (doc.rootOrder.length - filteredRoot.length) + 1);

    const group: GroupNode = {
      id: this.groupId,
      type: 'group',
      name: 'Group',
      children: [...this.ids],
      transform: Transform.identity(),
      fill: Fill.NONE,
      stroke: Stroke.NONE,
      opacity: 1,
      visibility: true,
      locked: false,
      metadata: {},
    };

    // Build updated nodes map: add group, keep existing nodes
    const updatedNodes = new Map(doc.nodes);
    updatedNodes.set(this.groupId, group);

    const newRoot = [...filteredRoot.slice(0, insertAt), this.groupId, ...filteredRoot.slice(insertAt)];

    return { ...doc, nodes: updatedNodes, rootOrder: newRoot };
  }

  undo(doc: Document): Document {
    const group = doc.nodes.get(this.groupId);
    if (!group || group.type !== 'group') return doc;

    const groupIndex = doc.rootOrder.indexOf(this.groupId);
    const filteredRoot = doc.rootOrder.filter((id) => id !== this.groupId);

    // Re-insert children at the group's position
    const newRoot = [
      ...filteredRoot.slice(0, groupIndex),
      ...this.ids,
      ...filteredRoot.slice(groupIndex),
    ];

    const updatedNodes = new Map(doc.nodes);
    updatedNodes.delete(this.groupId);

    return { ...doc, nodes: updatedNodes, rootOrder: newRoot };
  }
}
