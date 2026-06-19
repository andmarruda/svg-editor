import type { Document } from '../../../domain/aggregates/Document';
import type { NodeId } from '../../../domain/value-objects/NodeId';
import type { HistoryManager } from '../../history/HistoryManager';
import { FlipNodesCommand } from '../../commands/FlipNodesCommand';

export class FlipNodesUseCase {
  constructor(private readonly history: HistoryManager) {}

  execute(doc: Document, ids: NodeId[], axis: 'horizontal' | 'vertical'): Document {
    if (ids.length === 0) return doc;
    return this.history.execute(new FlipNodesCommand(ids, axis), doc);
  }
}
