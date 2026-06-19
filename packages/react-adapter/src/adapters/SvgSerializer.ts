import type { ISerializer } from '@svg-editor/core';
import type { Document } from '@svg-editor/core';
import type { DocumentId } from '@svg-editor/core';
import { parseSvg, serializeSvg } from '@svg-editor/core';

export class SvgSerializer implements ISerializer {
  parse(svgString: string, docId: DocumentId): Document {
    return parseSvg(svgString, docId);
  }

  serialize(document: Document): string {
    return serializeSvg(document);
  }
}
