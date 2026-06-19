declare const _nodeIdBrand: unique symbol;
export type NodeId = string & { readonly [_nodeIdBrand]: 'NodeId' };

declare const _documentIdBrand: unique symbol;
export type DocumentId = string & { readonly [_documentIdBrand]: 'DocumentId' };

export const NodeId = {
  from(raw: string): NodeId {
    if (!raw.trim()) throw new Error('NodeId cannot be empty');
    return raw as NodeId;
  },
  equals(a: NodeId, b: NodeId): boolean {
    return a === b;
  },
} as const;

export const DocumentId = {
  from(raw: string): DocumentId {
    if (!raw.trim()) throw new Error('DocumentId cannot be empty');
    return raw as DocumentId;
  },
} as const;
