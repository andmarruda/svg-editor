import type { Document } from '../../../domain/aggregates/Document';
import type { NodeId } from '../../../domain/value-objects/NodeId';
import type { HistoryManager } from '../../history/HistoryManager';
import { ReorderNodeCommand } from '../../commands/ReorderNodeCommand';
import { CompositeCommand } from '../../commands/CompositeCommand';

export class SendToBackUseCase {
  constructor(private readonly history: HistoryManager) {}

  execute(doc: Document, ids: NodeId[]): Document {
    const commands = ids.map((id) => new ReorderNodeCommand(id, 0));
    return this.history.execute(new CompositeCommand('Send to back', commands), doc);
  }
}
