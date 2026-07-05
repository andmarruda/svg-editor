import { useSyncExternalStore } from 'react';
import type { EditorState } from '@andmarruda/svg-editor-core';
import { useEditorContext } from '../context/EditorContext';

export function useEditorState(): EditorState {
  const editor = useEditorContext();
  return useSyncExternalStore(
    editor.subscribe.bind(editor),
    editor.getState.bind(editor),
    editor.getState.bind(editor),
  );
}
