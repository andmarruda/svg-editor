import type { ICommand } from './ICommand';
import type { Document } from '../../domain/aggregates/Document';
import type { NodeId } from '../../domain/value-objects/NodeId';
import type { SvgNode } from '../../domain/entities/SvgNode';
import { DocumentMutations } from '../../domain/aggregates/Document';

export class SetAttributeCommand<K extends keyof SvgNode> implements ICommand {
  readonly description: string;
  private previousValue: SvgNode[K] | undefined;

  constructor(
    private readonly id: NodeId,
    private readonly key: K,
    private readonly value: SvgNode[K],
  ) {
    this.description = `Set ${String(key)}`;
  }

  execute(doc: Document): Document {
    const node = doc.nodes.get(this.id);
    if (!node) return doc;
    this.previousValue = node[this.key as keyof typeof node] as SvgNode[K];
    return DocumentMutations.updateNode(doc, this.id, { [this.key]: this.value } as Partial<SvgNode>);
  }

  undo(doc: Document): Document {
    if (this.previousValue === undefined) return doc;
    return DocumentMutations.updateNode(doc, this.id, { [this.key]: this.previousValue } as Partial<SvgNode>);
  }
}
