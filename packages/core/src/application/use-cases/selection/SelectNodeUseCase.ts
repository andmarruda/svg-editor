import type { Document } from '../../../domain/aggregates/Document';
import type { NodeId } from '../../../domain/value-objects/NodeId';
import { Selection } from '../../../domain/aggregates/Selection';

export class SelectNodeUseCase {
  execute(current: Selection, doc: Document, id: NodeId, addToSelection: boolean): Selection {
    if (!doc.nodes.has(id)) return current;
    if (addToSelection) return Selection.toggle(current, id);
    return Selection.of([id]);
  }
}
