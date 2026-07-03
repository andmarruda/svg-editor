import type { Document } from '../../../domain/aggregates/Document';
import type { UseNode } from '../../../domain/entities/UseNode';
import type { NodeId } from '../../../domain/value-objects/NodeId';
import type { HistoryManager } from '../../history/HistoryManager';
import type { IIdGenerator } from '../../ports/driven/IIdGenerator';
import { NodeId as NodeIdNS } from '../../../domain/value-objects/NodeId';
import { AddNodeCommand } from '../../commands/AddNodeCommand';
import { createNodeBase } from './NodeDefaults';

export interface AddUseInput {
  readonly href: NodeId;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export class AddUseUseCase {
  constructor(
    private readonly history: HistoryManager,
    private readonly idGenerator: IIdGenerator,
  ) {}

  execute(doc: Document, input: AddUseInput): { doc: Document; id: NodeId } {
    const id = NodeIdNS.from(this.idGenerator.generate());
    const use: UseNode = {
      ...createNodeBase(id, 'Use'),
      type: 'use',
      href: input.href,
      x: input.x,
      y: input.y,
      width: input.width,
      height: input.height,
    };
    return { doc: this.history.execute(new AddNodeCommand(use), doc), id };
  }
}
