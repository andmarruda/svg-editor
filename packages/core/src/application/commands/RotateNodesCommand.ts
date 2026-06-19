import type { ICommand } from './ICommand';
import type { Document } from '../../domain/aggregates/Document';
import type { NodeId } from '../../domain/value-objects/NodeId';
import type { Point } from '../../domain/value-objects/Point';
import { DocumentMutations } from '../../domain/aggregates/Document';
import { TransformService } from '../../domain/services/TransformService';
import { Transform } from '../../domain/value-objects/Transform';
import { BoundsCalculator } from '../../domain/services/BoundsCalculator';
import { BoundingBox } from '../../domain/value-objects/BoundingBox';

export class RotateNodesCommand implements ICommand {
  readonly description = 'Rotate nodes';

  constructor(
    private readonly ids: readonly NodeId[],
    private readonly angleDeg: number,
    private readonly pivot?: Point,
  ) {}

  execute(doc: Document): Document {
    return this.applyRotation(doc, this.angleDeg);
  }

  undo(doc: Document): Document {
    return this.applyRotation(doc, -this.angleDeg);
  }

  private applyRotation(doc: Document, angle: number): Document {
    const pivot = this.pivot ?? this.computePivot(doc);
    const rotation = Transform.rotation(angle, pivot.x, pivot.y);
    return this.ids.reduce((d, id) => {
      const node = d.nodes.get(id);
      if (!node) return d;
      const rotated = TransformService.applyToNode(node, rotation);
      return DocumentMutations.updateNode(d, id, rotated);
    }, doc);
  }

  private computePivot(doc: Document): Point {
    const boxes = this.ids
      .map((id) => doc.nodes.get(id))
      .filter((n): n is NonNullable<typeof n> => n !== undefined)
      .map((n) => BoundsCalculator.forNode(n));
    const union = BoundingBox.unionAll(boxes);
    return union ? BoundingBox.center(union) : { x: 0, y: 0 };
  }
}
