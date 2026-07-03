import type { Document } from '../../../domain/aggregates/Document';
import type { PolygonNode } from '../../../domain/entities/LineNode';
import type { NodeId } from '../../../domain/value-objects/NodeId';
import type { Point } from '../../../domain/value-objects/Point';
import type { HistoryManager } from '../../history/HistoryManager';
import type { IIdGenerator } from '../../ports/driven/IIdGenerator';
import { NodeId as NodeIdNS } from '../../../domain/value-objects/NodeId';
import { AddNodeCommand } from '../../commands/AddNodeCommand';
import { createNodeBase } from './NodeDefaults';

export class AddPolygonUseCase {
  constructor(
    private readonly history: HistoryManager,
    private readonly idGenerator: IIdGenerator,
  ) {}

  execute(
    doc: Document,
    points: readonly Point[],
    name = 'Polygon',
  ): { doc: Document; id: NodeId } {
    const id = NodeIdNS.from(this.idGenerator.generate());
    const polygon: PolygonNode = {
      ...createNodeBase(id, name),
      type: 'polygon',
      points: [...points],
    };
    return { doc: this.history.execute(new AddNodeCommand(polygon), doc), id };
  }
}
