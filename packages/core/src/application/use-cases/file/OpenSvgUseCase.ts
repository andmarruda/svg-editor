import type { ISerializer } from '../../ports/driven/ISerializer';
import type { IIdGenerator } from '../../ports/driven/IIdGenerator';
import type { Document } from '../../../domain/aggregates/Document';
import { DocumentId } from '../../../domain/value-objects/NodeId';

export class OpenSvgUseCase {
  constructor(
    private readonly serializer: ISerializer,
    private readonly idGenerator: IIdGenerator,
  ) {}

  execute(svgString: string): Document {
    const docId = DocumentId.from(this.idGenerator.generate());
    return this.serializer.parse(svgString, docId);
  }
}
