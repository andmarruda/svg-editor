import type { Document } from '../../../domain/aggregates/Document';
import type { NodeId } from '../../../domain/value-objects/NodeId';
import type { Point } from '../../../domain/value-objects/Point';
import type { HistoryManager } from '../../history/HistoryManager';
import { MoveNodesCommand } from '../../commands/MoveNodesCommand';

export class MoveNodesUseCase {
  constructor(private readonly history: HistoryManager) {}

  execute(doc: Document, ids: NodeId[], delta: Point): Document {
    if (ids.length === 0) return doc;
    return this.history.execute(new MoveNodesCommand(ids, delta), doc);
  }
}
