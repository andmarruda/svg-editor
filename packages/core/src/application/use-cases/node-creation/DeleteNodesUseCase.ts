import type { Document } from '../../../domain/aggregates/Document';
import type { NodeId } from '../../../domain/value-objects/NodeId';
import type { HistoryManager } from '../../history/HistoryManager';
import { RemoveNodesCommand } from '../../commands/RemoveNodesCommand';

export class DeleteNodesUseCase {
  constructor(private readonly history: HistoryManager) {}

  execute(doc: Document, ids: NodeId[]): Document {
    if (ids.length === 0) return doc;
    return this.history.execute(new RemoveNodesCommand(ids), doc);
  }
}
