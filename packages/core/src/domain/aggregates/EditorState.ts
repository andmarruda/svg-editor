import type { Document } from './Document';
import type { Selection } from './Selection';
import type { Transform } from '../value-objects/Transform';

export type ToolType = 'select' | 'rect' | 'ellipse' | 'text' | 'pan' | 'image';

export interface EditorState {
  readonly document: Document;
  readonly selection: Selection;
  readonly viewTransform: Transform;
  readonly activeTool: ToolType;
  readonly isDirty: boolean;
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  readonly filename: string | null;
}
