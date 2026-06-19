import type { Document } from '../../../domain/aggregates/Document';
import type { NodeId } from '../../../domain/value-objects/NodeId';
import type { IIdGenerator } from '../../ports/driven/IIdGenerator';
import type { HistoryManager } from '../../history/HistoryManager';
import type { EllipseNode } from '../../../domain/entities/EllipseNode';
import { AddNodeCommand } from '../../commands/AddNodeCommand';
import { NodeId as NodeIdNS } from '../../../domain/value-objects/NodeId';
import { Transform } from '../../../domain/value-objects/Transform';
import { Fill } from '../../../domain/value-objects/Fill';
import { Stroke } from '../../../domain/value-objects/Stroke';
import { Color } from '../../../domain/value-objects/Color';

export class AddEllipseUseCase {
  constructor(
    private readonly history: HistoryManager,
    private readonly idGenerator: IIdGenerator,
  ) {}

  execute(doc: Document, cx: number, cy: number, rx: number, ry: number): { doc: Document; id: NodeId } {
    const id = NodeIdNS.from(this.idGenerator.generate());
    const ellipse: EllipseNode = {
      id,
      type: 'ellipse',
      name: 'Ellipse',
      cx,
      cy,
      rx,
      ry,
      transform: Transform.identity(),
      fill: Fill.solid(Color.BLACK),
      stroke: Stroke.NONE,
      opacity: 1,
      visibility: true,
      locked: false,
      metadata: {},
    };
    const newDoc = this.history.execute(new AddNodeCommand(ellipse), doc);
    return { doc: newDoc, id };
  }
}
