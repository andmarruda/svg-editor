import type { Document } from '../../../domain/aggregates/Document';
import type { NodeId } from '../../../domain/value-objects/NodeId';
import type { HistoryManager } from '../../history/HistoryManager';
import type { IIdGenerator } from '../../ports/driven/IIdGenerator';
import { GroupNodesCommand } from '../../commands/GroupNodesCommand';
import { NodeId as NodeIdNS } from '../../../domain/value-objects/NodeId';

export class GroupNodesUseCase {
  constructor(
    private readonly history: HistoryManager,
    private readonly idGenerator: IIdGenerator,
  ) {}

  execute(doc: Document, ids: NodeId[]): { doc: Document; groupId: NodeId } {
    const groupId = NodeIdNS.from(this.idGenerator.generate());
    const newDoc = this.history.execute(new GroupNodesCommand(groupId, ids), doc);
    return { doc: newDoc, groupId };
  }
}
