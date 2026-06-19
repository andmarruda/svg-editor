import type { Document } from '../../domain/aggregates/Document';

export interface ICommand {
  readonly description: string;
  execute(doc: Document): Document;
  undo(doc: Document): Document;
}
