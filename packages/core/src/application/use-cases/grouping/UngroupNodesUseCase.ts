import type { Document } from '../../../domain/aggregates/Document';
import type { NodeId } from '../../../domain/value-objects/NodeId';
import type { HistoryManager } from '../../history/HistoryManager';
import { UngroupNodesCommand } from '../../commands/UngroupNodesCommand';
import { CompositeCommand } from '../../commands/CompositeCommand';

export class UngroupNodesUseCase {
  constructor(private readonly history: HistoryManager) {}

  execute(doc: Document, ids: NodeId[]): { doc: Document; ungroupedIds: NodeId[] } {
    const groupNodes = ids
      .map((id) => doc.nodes.get(id))
      .filter((n) => n?.type === 'group');

    const children = groupNodes.flatMap((g) => (g?.type === 'group' ? g.children : []));
    const commands = ids.map((id) => new UngroupNodesCommand(id));
    const newDoc = this.history.execute(new CompositeCommand('Ungroup', commands), doc);
    return { doc: newDoc, ungroupedIds: children };
  }
}
