import type { Document } from '../../../domain/aggregates/Document';
import type { BoundingBox } from '../../../domain/value-objects/BoundingBox';
import { Selection } from '../../../domain/aggregates/Selection';
import { HitTesting } from '../../../domain/services/HitTesting';

export class SelectByMarqueeUseCase {
  execute(current: Selection, doc: Document, box: BoundingBox, addToSelection: boolean): Selection {
    const ids = HitTesting.nodesInsideBoundingBox(doc, box);
    if (ids.length === 0) return addToSelection ? current : Selection.EMPTY;
    const base = addToSelection ? current : Selection.EMPTY;
    return ids.reduce((sel, id) => Selection.add(sel, id), base);
  }
}
