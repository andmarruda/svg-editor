import type { ISerializer } from '../../ports/driven/ISerializer';
import type { Document } from '../../../domain/aggregates/Document';

export class ExportSvgUseCase {
  constructor(private readonly serializer: ISerializer) {}

  execute(document: Document): string {
    return this.serializer.serialize(document);
  }
}
