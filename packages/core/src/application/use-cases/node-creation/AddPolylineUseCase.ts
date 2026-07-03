import type { Document } from '../../../domain/aggregates/Document';
import type { PolylineNode } from '../../../domain/entities/LineNode';
import type { NodeId } from '../../../domain/value-objects/NodeId';
import type { Point } from '../../../domain/value-objects/Point';
import type { HistoryManager } from '../../history/HistoryManager';
import type { IIdGenerator } from '../../ports/driven/IIdGenerator';
import { NodeId as NodeIdNS } from '../../../domain/value-objects/NodeId';
import { AddNodeCommand } from '../../commands/AddNodeCommand';
import { createNodeBase } from './NodeDefaults';

export class AddPolylineUseCase {
  constructor(
    private readonly history: HistoryManager,
    private readonly idGenerator: IIdGenerator,
  ) {}

  execute(doc: Document, points: readonly Point[]): { doc: Document; id: NodeId } {
    const id = NodeIdNS.from(this.idGenerator.generate());
    const polyline: PolylineNode = {
      ...createNodeBase(id, 'Polyline'),
      type: 'polyline',
      points: [...points],
    };
    return { doc: this.history.execute(new AddNodeCommand(polyline), doc), id };
  }
}
