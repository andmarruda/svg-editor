import type { Document } from '../../../domain/aggregates/Document';
import type { NodeId } from '../../../domain/value-objects/NodeId';
import type { Point } from '../../../domain/value-objects/Point';
import type { HistoryManager } from '../../history/HistoryManager';
import { RotateNodesCommand } from '../../commands/RotateNodesCommand';

export class RotateNodesUseCase {
  constructor(private readonly history: HistoryManager) {}

  execute(doc: Document, ids: NodeId[], angleDeg: number, pivot?: Point): Document {
    if (ids.length === 0) return doc;
    return this.history.execute(new RotateNodesCommand(ids, angleDeg, pivot), doc);
  }
}
