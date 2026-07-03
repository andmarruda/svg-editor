import { computed } from 'vue';
import { useEditor } from './useEditor';
import { useEditorState } from './useEditorState';

export function useHistory() {
  const editor = useEditor();
  const state = useEditorState();
  return {
    canUndo: computed(() => state.value.canUndo),
    canRedo: computed(() => state.value.canRedo),
    undo: () => editor.undo(),
    redo: () => editor.redo(),
  };
}
