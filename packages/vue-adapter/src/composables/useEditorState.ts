import { onUnmounted, readonly, ref } from 'vue';
import type { EditorState } from '@svg-editor/core';
import { useEditor } from './useEditor';

export function useEditorState() {
  const editor = useEditor();
  const state = ref<EditorState>(editor.getState());
  const unsubscribe = editor.subscribe((next) => {
    state.value = next;
  });
  onUnmounted(unsubscribe);
  return readonly(state);
}
