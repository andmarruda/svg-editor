import type { Document } from '../../../domain/aggregates/Document';
import type { NodeId } from '../../../domain/value-objects/NodeId';
import type { IIdGenerator } from '../../ports/driven/IIdGenerator';
import type { HistoryManager } from '../../history/HistoryManager';
import type { TextNode } from '../../../domain/entities/TextNode';
import { AddNodeCommand } from '../../commands/AddNodeCommand';
import { NodeId as NodeIdNS } from '../../../domain/value-objects/NodeId';
import { Transform } from '../../../domain/value-objects/Transform';
import { Fill } from '../../../domain/value-objects/Fill';
import { Stroke } from '../../../domain/value-objects/Stroke';
import { Color } from '../../../domain/value-objects/Color';

export class AddTextUseCase {
  constructor(
    private readonly history: HistoryManager,
    private readonly idGenerator: IIdGenerator,
  ) {}

  execute(doc: Document, x: number, y: number, content: string): { doc: Document; id: NodeId } {
    const id = NodeIdNS.from(this.idGenerator.generate());
    const text: TextNode = {
      id,
      type: 'text',
      name: 'Text',
      x,
      y,
      content,
      fontSize: 16,
      fontFamily: 'sans-serif',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAnchor: 'start',
      letterSpacing: 0,
      transform: Transform.identity(),
      fill: Fill.solid(Color.BLACK),
      stroke: Stroke.NONE,
      opacity: 1,
      visibility: true,
      locked: false,
      metadata: {},
    };
    const newDoc = this.history.execute(new AddNodeCommand(text), doc);
    return { doc: newDoc, id };
  }
}
