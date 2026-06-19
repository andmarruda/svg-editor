import type { SvgNodeBase } from './SvgNodeBase';

export type TextAnchor = 'start' | 'middle' | 'end';
export type FontWeight = 'normal' | 'bold' | 'bolder' | 'lighter' | number;

export interface TextNode extends SvgNodeBase {
  readonly type: 'text';
  readonly x: number;
  readonly y: number;
  readonly content: string;
  readonly fontFamily: string;
  readonly fontSize: number;
  readonly fontWeight: FontWeight;
  readonly fontStyle: 'normal' | 'italic' | 'oblique';
  readonly textAnchor: TextAnchor;
  readonly letterSpacing: number;
}
