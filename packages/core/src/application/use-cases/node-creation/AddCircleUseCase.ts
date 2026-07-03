import type { Document } from '../../../domain/aggregates/Document';
import type { CircleNode } from '../../../domain/entities/EllipseNode';
import type { NodeId } from '../../../domain/value-objects/NodeId';
import type { HistoryManager } from '../../history/HistoryManager';
import type { IIdGenerator } from '../../ports/driven/IIdGenerator';
import { NodeId as NodeIdNS } from '../../../domain/value-objects/NodeId';
import { AddNodeCommand } from '../../commands/AddNodeCommand';
import { createNodeBase } from './NodeDefaults';

export class AddCircleUseCase {
  constructor(
    private readonly history: HistoryManager,
    private readonly idGenerator: IIdGenerator,
  ) {}

  execute(doc: Document, cx: number, cy: number, r: number): { doc: Document; id: NodeId } {
    const id = NodeIdNS.from(this.idGenerator.generate());
    const circle: CircleNode = {
      ...createNodeBase(id, 'Circle'),
      type: 'circle',
      cx,
      cy,
      r,
    };
    return { doc: this.history.execute(new AddNodeCommand(circle), doc), id };
  }
}
