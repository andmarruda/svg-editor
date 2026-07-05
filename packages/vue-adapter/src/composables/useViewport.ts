import type { Transform } from '@andmarruda/svg-editor-core';
import { useEditor } from './useEditor';
import { useEditorState } from './useEditorState';

export function useViewport() {
  const editor = useEditor();
  const state = useEditorState();
  return {
    viewTransform: state.value.viewTransform,
    setViewTransform: (transform: Transform) => editor.setViewTransform(transform),
    zoomBy: (factor: number) => {
      const [a, b, c, d, e, f] = editor.getState().viewTransform.matrix;
      editor.setViewTransform({
        matrix: [(a ?? 1) * factor, b ?? 0, c ?? 0, (d ?? 1) * factor, e ?? 0, f ?? 0],
      });
    },
  };
}
