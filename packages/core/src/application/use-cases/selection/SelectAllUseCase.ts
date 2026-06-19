import type { Document } from '../../../domain/aggregates/Document';
import { Selection } from '../../../domain/aggregates/Selection';
import type { NodeId } from '../../../domain/value-objects/NodeId';

export class SelectAllUseCase {
  execute(doc: Document): Selection {
    const ids = [...doc.nodes.keys()] as NodeId[];
    return Selection.of(ids);
  }
}
