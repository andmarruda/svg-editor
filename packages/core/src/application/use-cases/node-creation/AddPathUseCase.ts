import type { Document } from '../../../domain/aggregates/Document';
import type { PathCommand } from '../../../domain/entities/PathCommand';
import type { PathNode } from '../../../domain/entities/PathNode';
import type { NodeId } from '../../../domain/value-objects/NodeId';
import type { HistoryManager } from '../../history/HistoryManager';
import type { IIdGenerator } from '../../ports/driven/IIdGenerator';
import { NodeId as NodeIdNS } from '../../../domain/value-objects/NodeId';
import { parsePath } from '../../../infrastructure/serialization/PathParser';
import { AddNodeCommand } from '../../commands/AddNodeCommand';
import { createNodeBase } from './NodeDefaults';

export class AddPathUseCase {
  constructor(
    private readonly history: HistoryManager,
    private readonly idGenerator: IIdGenerator,
  ) {}

  execute(
    doc: Document,
    commandsOrD: readonly PathCommand[] | string,
    name = 'Path',
  ): { doc: Document; id: NodeId } {
    const id = NodeIdNS.from(this.idGenerator.generate());
    const commands = typeof commandsOrD === 'string' ? parsePath(commandsOrD) : [...commandsOrD];
    const path: PathNode = {
      ...createNodeBase(id, name),
      type: 'path',
      commands,
    };
    return { doc: this.history.execute(new AddNodeCommand(path), doc), id };
  }
}
