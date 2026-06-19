import type { Document } from '../../../domain/aggregates/Document';
import type { DocumentId } from '../../../domain/value-objects/NodeId';

export interface ISerializer {
  parse(svgString: string, docId: DocumentId): Document;
  serialize(document: Document): string;
}
