import type { Document } from '../../../domain/aggregates/Document';
import type { LineNode } from '../../../domain/entities/LineNode';
import type { NodeId } from '../../../domain/value-objects/NodeId';
import type { HistoryManager } from '../../history/HistoryManager';
import type { IIdGenerator } from '../../ports/driven/IIdGenerator';
import { NodeId as NodeIdNS } from '../../../domain/value-objects/NodeId';
import { AddNodeCommand } from '../../commands/AddNodeCommand';
import { createNodeBase } from './NodeDefaults';

export class AddLineUseCase {
  constructor(
    private readonly history: HistoryManager,
    private readonly idGenerator: IIdGenerator,
  ) {}

  execute(
    doc: Document,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ): { doc: Document; id: NodeId } {
    const id = NodeIdNS.from(this.idGenerator.generate());
    const line: LineNode = {
      ...createNodeBase(id, 'Line'),
      type: 'line',
      x1,
      y1,
      x2,
      y2,
    };
    return { doc: this.history.execute(new AddNodeCommand(line), doc), id };
  }
}
