import type { SvgNodeBase } from './SvgNodeBase';

export interface RectNode extends SvgNodeBase {
  readonly type: 'rect';
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly rx: number;
  readonly ry: number;
}
