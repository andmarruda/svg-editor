import type { ICommand } from './ICommand';
import type { Document } from '../../domain/aggregates/Document';

export class UpdateDocumentCommand implements ICommand {
  private beforeSnapshot: Document | null = null;

  constructor(
    readonly description: string,
    private readonly updater: (doc: Document) => Document,
  ) {}

  execute(doc: Document): Document {
    this.beforeSnapshot = doc;
    return this.updater(doc);
  }

  undo(doc: Document): Document {
    return this.beforeSnapshot ?? doc;
  }
}
