import type { ICommand } from './ICommand';
import type { Document } from '../../domain/aggregates/Document';
import type { SvgDef } from '../../domain/aggregates/SvgDefs';
import { DocumentMutations } from '../../domain/aggregates/Document';

export class SetDefCommand implements ICommand {
  readonly description = 'Set SVG def';
  private previousDef: SvgDef | null = null;

  constructor(private readonly def: SvgDef) {}

  execute(doc: Document): Document {
    this.previousDef = doc.defs.get(this.def.id) ?? null;
    return DocumentMutations.addDef(doc, this.def);
  }

  undo(doc: Document): Document {
    if (this.previousDef) return DocumentMutations.addDef(doc, this.previousDef);
    return DocumentMutations.removeDef(doc, this.def.id);
  }
}

export class RemoveDefCommand implements ICommand {
  readonly description = 'Remove SVG def';
  private previousDef: SvgDef | null = null;

  constructor(private readonly id: string) {}

  execute(doc: Document): Document {
    this.previousDef = doc.defs.get(this.id) ?? null;
    return DocumentMutations.removeDef(doc, this.id);
  }

  undo(doc: Document): Document {
    if (!this.previousDef) return doc;
    return DocumentMutations.addDef(doc, this.previousDef);
  }
}
