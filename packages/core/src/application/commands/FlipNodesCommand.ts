import type { ICommand } from './ICommand';
import type { Document } from '../../domain/aggregates/Document';
import type { NodeId } from '../../domain/value-objects/NodeId';
import { DocumentMutations } from '../../domain/aggregates/Document';
import { TransformService } from '../../domain/services/TransformService';
import { Transform } from '../../domain/value-objects/Transform';
import { BoundsCalculator } from '../../domain/services/BoundsCalculator';
import { BoundingBox } from '../../domain/value-objects/BoundingBox';

export class FlipNodesCommand implements ICommand {
  readonly description: string;

  constructor(
    private readonly ids: readonly NodeId[],
    private readonly axis: 'horizontal' | 'vertical',
  ) {
    this.description = `Flip ${axis}`;
  }

  execute(doc: Document): Document {
    return this.applyFlip(doc);
  }

  undo(doc: Document): Document {
    // Flip is its own inverse
    return this.applyFlip(doc);
  }

  private applyFlip(doc: Document): Document {
    const boxes = this.ids
      .map((id) => doc.nodes.get(id))
      .filter((n): n is NonNullable<typeof n> => n !== undefined)
      .map((n) => BoundsCalculator.forNode(n));
    const union = BoundingBox.unionAll(boxes);
    if (!union) return doc;

    const center = BoundingBox.center(union);
    const flipTransform = this.axis === 'horizontal'
      ? Transform.of(-1, 0, 0, 1, center.x * 2, 0)
      : Transform.of(1, 0, 0, -1, 0, center.y * 2);

    return this.ids.reduce((d, id) => {
      const node = d.nodes.get(id);
      if (!node) return d;
      return DocumentMutations.updateNode(d, id, TransformService.applyToNode(node, flipTransform));
    }, doc);
  }
}
