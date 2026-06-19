import type { SvgNodeBase } from './SvgNodeBase';

export type PreserveAspectRatio =
  | 'none'
  | 'xMinYMin'
  | 'xMidYMin'
  | 'xMaxYMin'
  | 'xMinYMid'
  | 'xMidYMid'
  | 'xMaxYMid'
  | 'xMinYMax'
  | 'xMidYMax'
  | 'xMaxYMax';

export interface ImageNode extends SvgNodeBase {
  readonly type: 'image';
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly href: string;
  readonly preserveAspectRatio: PreserveAspectRatio;
}
