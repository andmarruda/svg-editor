import type { Document } from '../../../domain/aggregates/Document';
import type { NodeId } from '../../../domain/value-objects/NodeId';
import type { IIdGenerator } from '../../ports/driven/IIdGenerator';
import type { HistoryManager } from '../../history/HistoryManager';
import type { RectNode } from '../../../domain/entities/RectNode';
import { AddNodeCommand } from '../../commands/AddNodeCommand';
import { NodeId as NodeIdNS } from '../../../domain/value-objects/NodeId';
import { Transform } from '../../../domain/value-objects/Transform';
import { Fill } from '../../../domain/value-objects/Fill';
import { Stroke } from '../../../domain/value-objects/Stroke';
import { Color } from '../../../domain/value-objects/Color';

export class AddRectUseCase {
  constructor(
    private readonly history: HistoryManager,
    private readonly idGenerator: IIdGenerator,
  ) {}

  execute(
    doc: Document,
    x: number,
    y: number,
    width: number,
    height: number,
  ): { doc: Document; id: NodeId } {
    const id = NodeIdNS.from(this.idGenerator.generate());
    const rect: RectNode = {
      id,
      type: 'rect',
      name: 'Rectangle',
      x,
      y,
      width,
      height,
      rx: 0,
      ry: 0,
      transform: Transform.identity(),
      fill: Fill.solid(Color.BLACK),
      stroke: Stroke.NONE,
      opacity: 1,
      visibility: true,
      locked: false,
      metadata: {},
    };
    const newDoc = this.history.execute(new AddNodeCommand(rect), doc);
    return { doc: newDoc, id };
  }
}
