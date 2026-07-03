import type { Document } from '../../../domain/aggregates/Document';
import type { ImageNode, PreserveAspectRatio } from '../../../domain/entities/ImageNode';
import type { NodeId } from '../../../domain/value-objects/NodeId';
import type { HistoryManager } from '../../history/HistoryManager';
import type { IIdGenerator } from '../../ports/driven/IIdGenerator';
import { NodeId as NodeIdNS } from '../../../domain/value-objects/NodeId';
import { Fill } from '../../../domain/value-objects/Fill';
import { AddNodeCommand } from '../../commands/AddNodeCommand';
import { createNodeBase } from './NodeDefaults';

export interface AddImageInput {
  readonly href: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly preserveAspectRatio?: PreserveAspectRatio;
}

export class AddImageUseCase {
  constructor(
    private readonly history: HistoryManager,
    private readonly idGenerator: IIdGenerator,
  ) {}

  execute(doc: Document, input: AddImageInput): { doc: Document; id: NodeId } {
    if (!input.href.trim()) throw new Error('Image href is required');
    if (input.width <= 0 || input.height <= 0) throw new Error('Image dimensions must be positive');
    const id = NodeIdNS.from(this.idGenerator.generate());
    const image: ImageNode = {
      ...createNodeBase(id, 'Image', { fill: Fill.NONE }),
      type: 'image',
      href: input.href,
      x: input.x,
      y: input.y,
      width: input.width,
      height: input.height,
      preserveAspectRatio: input.preserveAspectRatio ?? 'xMidYMid',
    };
    return { doc: this.history.execute(new AddNodeCommand(image), doc), id };
  }
}
