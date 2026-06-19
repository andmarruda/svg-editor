import { useEditorState } from './useEditorState';
import { useEditor } from './useEditor';

export interface HistoryActions {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
}

export function useHistory(): HistoryActions {
  const { canUndo, canRedo } = useEditorState();
  const editor = useEditor();
  return {
    canUndo,
    canRedo,
    undo: () => editor.undo(),
    redo: () => editor.redo(),
  };
}
