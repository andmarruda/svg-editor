import type { ICommand } from './ICommand';
import type { Document } from '../../domain/aggregates/Document';
import type { NodeId } from '../../domain/value-objects/NodeId';
import type { Point } from '../../domain/value-objects/Point';
import { DocumentMutations } from '../../domain/aggregates/Document';
import { TransformService } from '../../domain/services/TransformService';

export class MoveNodesCommand implements ICommand {
  readonly description = 'Move nodes';

  constructor(
    private readonly ids: readonly NodeId[],
    private readonly delta: Point,
  ) {}

  execute(doc: Document): Document {
    return this.ids.reduce((d, id) => {
      const node = d.nodes.get(id);
      if (!node) return d;
      const moved = TransformService.translateNode(node, this.delta.x, this.delta.y);
      return DocumentMutations.updateNode(d, id, moved);
    }, doc);
  }

  undo(doc: Document): Document {
    return this.ids.reduce((d, id) => {
      const node = d.nodes.get(id);
      if (!node) return d;
      const moved = TransformService.translateNode(node, -this.delta.x, -this.delta.y);
      return DocumentMutations.updateNode(d, id, moved);
    }, doc);
  }
}
