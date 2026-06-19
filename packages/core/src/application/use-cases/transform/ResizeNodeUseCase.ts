import type { Document } from '../../../domain/aggregates/Document';
import type { NodeId } from '../../../domain/value-objects/NodeId';
import type { Point } from '../../../domain/value-objects/Point';
import type { ResizeHandle } from '../../ports/driving/IEditorApplication';
import type { HistoryManager } from '../../history/HistoryManager';
import { ResizeNodeCommand } from '../../commands/ResizeNodeCommand';

export class ResizeNodeUseCase {
  constructor(private readonly history: HistoryManager) {}

  execute(doc: Document, id: NodeId, handle: ResizeHandle, delta: Point, keepAspectRatio: boolean): Document {
    return this.history.execute(new ResizeNodeCommand(id, handle, delta, keepAspectRatio), doc);
  }
}
