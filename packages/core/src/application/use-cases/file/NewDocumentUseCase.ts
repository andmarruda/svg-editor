import type { IIdGenerator } from '../../ports/driven/IIdGenerator';
import { Document } from '../../../domain/aggregates/Document';
import { DocumentId } from '../../../domain/value-objects/NodeId';

export class NewDocumentUseCase {
  constructor(private readonly idGenerator: IIdGenerator) {}

  execute(width: number, height: number): Document {
    const docId = DocumentId.from(this.idGenerator.generate());
    return Document.create(docId, width, height);
  }
}
