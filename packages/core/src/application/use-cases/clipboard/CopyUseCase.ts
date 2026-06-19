import type { Document } from '../../../domain/aggregates/Document';
import type { Selection } from '../../../domain/aggregates/Selection';
import type { IClipboardAdapter } from '../../ports/driven/IClipboardAdapter';
import type { SvgNode } from '../../../domain/entities/SvgNode';

export class CopyUseCase {
  constructor(private readonly clipboard: IClipboardAdapter) {}

  execute(doc: Document, selection: Selection): void {
    const nodes: SvgNode[] = [];
    for (const id of selection.ids) {
      const node = doc.nodes.get(id);
      if (node) nodes.push(node);
    }
    if (nodes.length > 0) {
      void this.clipboard.write(nodes);
    }
  }
}
