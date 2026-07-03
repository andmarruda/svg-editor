import type { SvgNodeBase } from './SvgNodeBase';
import type { Fill } from '../value-objects/Fill';
import type { Stroke } from '../value-objects/Stroke';

export type TextAnchor = 'start' | 'middle' | 'end';
export type FontWeight = 'normal' | 'bold' | 'bolder' | 'lighter' | number;
export type TextDecoration = 'none' | 'underline' | 'overline' | 'line-through';
export type DominantBaseline =
  | 'auto'
  | 'middle'
  | 'hanging'
  | 'central'
  | 'text-before-edge'
  | 'text-after-edge';

export interface TextRunStyle {
  readonly fill?: Fill;
  readonly stroke?: Stroke;
  readonly fontFamily?: string;
  readonly fontSize?: number;
  readonly fontWeight?: FontWeight;
  readonly fontStyle?: 'normal' | 'italic' | 'oblique';
  readonly letterSpacing?: number;
  readonly wordSpacing?: number;
  readonly textDecoration?: TextDecoration;
}

export interface TextRun {
  readonly content: string;
  readonly style: TextRunStyle;
}

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
  readonly dominantBaseline: DominantBaseline;
  readonly letterSpacing: number;
  readonly wordSpacing: number;
  readonly textDecoration: TextDecoration;
  readonly lineHeight: number;
  readonly runs: readonly TextRun[];
}
