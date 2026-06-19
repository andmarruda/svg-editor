import type { SvgNodeBase } from './SvgNodeBase';

export interface EllipseNode extends SvgNodeBase {
  readonly type: 'ellipse';
  readonly cx: number;
  readonly cy: number;
  readonly rx: number;
  readonly ry: number;
}

export interface CircleNode extends SvgNodeBase {
  readonly type: 'circle';
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
}
