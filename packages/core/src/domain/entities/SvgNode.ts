import type { RectNode } from './RectNode';
import type { EllipseNode, CircleNode } from './EllipseNode';
import type { LineNode, PolylineNode, PolygonNode } from './LineNode';
import type { PathNode } from './PathNode';
import type { TextNode } from './TextNode';
import type { ImageNode } from './ImageNode';
import type { GroupNode } from './GroupNode';
import type { UseNode } from './UseNode';

export type SvgNode =
  | RectNode
  | EllipseNode
  | CircleNode
  | LineNode
  | PolylineNode
  | PolygonNode
  | PathNode
  | TextNode
  | ImageNode
  | GroupNode
  | UseNode;

export type { RectNode, EllipseNode, CircleNode, LineNode, PolylineNode, PolygonNode, PathNode, TextNode, ImageNode, GroupNode, UseNode };
