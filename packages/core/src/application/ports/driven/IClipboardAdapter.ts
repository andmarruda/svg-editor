import type { SvgNode } from '../../../domain/entities/SvgNode';

export interface IClipboardAdapter {
  write(nodes: SvgNode[]): Promise<void>;
  read(): Promise<SvgNode[] | null>;
}
