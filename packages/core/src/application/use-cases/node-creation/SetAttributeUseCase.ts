import type { Document } from '../../../domain/aggregates/Document';
import type { NodeId } from '../../../domain/value-objects/NodeId';
import type { SvgNode } from '../../../domain/entities/SvgNode';
import type { HistoryManager } from '../../history/HistoryManager';
import { SetAttributeCommand } from '../../commands/SetAttributeCommand';
import { CompositeCommand } from '../../commands/CompositeCommand';

export class SetAttributeUseCase {
  constructor(private readonly history: HistoryManager) {}

  execute<K extends keyof SvgNode>(doc: Document, ids: NodeId[], key: K, value: SvgNode[K]): Document {
    if (ids.length === 0) return doc;
    if (ids.length === 1) {
      const id = ids[0]!;
      return this.history.execute(new SetAttributeCommand(id, key, value), doc);
    }
    const commands = ids.map((id) => new SetAttributeCommand(id, key, value));
    return this.history.execute(new CompositeCommand(`Set ${String(key)}`, commands), doc);
  }
}
