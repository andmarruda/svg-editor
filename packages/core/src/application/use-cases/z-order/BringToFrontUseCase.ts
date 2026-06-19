import type { Document } from '../../../domain/aggregates/Document';
import type { NodeId } from '../../../domain/value-objects/NodeId';
import type { HistoryManager } from '../../history/HistoryManager';
import { ReorderNodeCommand } from '../../commands/ReorderNodeCommand';
import { CompositeCommand } from '../../commands/CompositeCommand';

export class BringToFrontUseCase {
  constructor(private readonly history: HistoryManager) {}

  execute(doc: Document, ids: NodeId[]): Document {
    const commands = ids.map((id) => new ReorderNodeCommand(id, doc.rootOrder.length - 1));
    return this.history.execute(new CompositeCommand('Bring to front', commands), doc);
  }
}
