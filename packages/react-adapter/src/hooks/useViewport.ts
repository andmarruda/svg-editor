import { useCallback } from 'react';
import type { Transform } from '@andmarruda/svg-editor-core';
import { useEditorState } from './useEditorState';
import { useEditor } from './useEditor';

export interface ViewportActions {
  viewTransform: Transform;
  setViewTransform: (t: Transform) => void;
  resetView: () => void;
}

const IDENTITY_TRANSFORM: Transform = { matrix: [1, 0, 0, 1, 0, 0] };

export function useViewport(): ViewportActions {
  const { viewTransform } = useEditorState();
  const editor = useEditor();

  const setViewTransform = useCallback(
    (t: Transform) => {
      editor.setViewTransform(t);
    },
    [editor],
  );

  const resetView = useCallback(() => {
    editor.setViewTransform(IDENTITY_TRANSFORM);
  }, [editor]);

  return { viewTransform, setViewTransform, resetView };
}
