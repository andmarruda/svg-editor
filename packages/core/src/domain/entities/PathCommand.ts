import type { Point } from '../value-objects/Point';

export type PathCommandType = 'M' | 'L' | 'H' | 'V' | 'C' | 'S' | 'Q' | 'T' | 'A' | 'Z';

export type PathCommand =
  | { readonly type: 'M'; readonly point: Point }
  | { readonly type: 'L'; readonly point: Point }
  | { readonly type: 'H'; readonly x: number }
  | { readonly type: 'V'; readonly y: number }
  | { readonly type: 'C'; readonly cp1: Point; readonly cp2: Point; readonly point: Point }
  | { readonly type: 'S'; readonly cp2: Point; readonly point: Point }
  | { readonly type: 'Q'; readonly cp: Point; readonly point: Point }
  | { readonly type: 'T'; readonly point: Point }
  | {
      readonly type: 'A';
      readonly rx: number;
      readonly ry: number;
      readonly xRotation: number;
      readonly largeArc: boolean;
      readonly sweep: boolean;
      readonly point: Point;
    }
  | { readonly type: 'Z' };
