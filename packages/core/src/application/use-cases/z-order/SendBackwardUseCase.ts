import type { Document } from '../../../domain/aggregates/Document';
import type { NodeId } from '../../../domain/value-objects/NodeId';
import type { HistoryManager } from '../../history/HistoryManager';
import { ReorderNodeCommand } from '../../commands/ReorderNodeCommand';
import { CompositeCommand } from '../../commands/CompositeCommand';

export class SendBackwardUseCase {
  constructor(private readonly history: HistoryManager) {}

  execute(doc: Document, ids: NodeId[]): Document {
    const commands = ids.map((id) => {
      const idx = doc.rootOrder.indexOf(id);
      return new ReorderNodeCommand(id, Math.max(0, idx - 1));
    });
    return this.history.execute(new CompositeCommand('Send backward', commands), doc);
  }
}
