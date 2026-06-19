import type { Document } from '../../../domain/aggregates/Document';
import type { Selection } from '../../../domain/aggregates/Selection';
import type { IClipboardAdapter } from '../../ports/driven/IClipboardAdapter';
import type { HistoryManager } from '../../history/HistoryManager';
import { RemoveNodesCommand } from '../../commands/RemoveNodesCommand';
import { CopyUseCase } from './CopyUseCase';

export class CutUseCase {
  private readonly copyUseCase: CopyUseCase;

  constructor(
    clipboard: IClipboardAdapter,
    private readonly history: HistoryManager,
  ) {
    this.copyUseCase = new CopyUseCase(clipboard);
  }

  execute(doc: Document, selection: Selection): Document {
    if (selection.ids.size === 0) return doc;
    this.copyUseCase.execute(doc, selection);
    const ids = [...selection.ids];
    return this.history.execute(new RemoveNodesCommand(ids), doc);
  }
}
