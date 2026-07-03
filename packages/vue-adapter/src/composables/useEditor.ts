import { inject } from 'vue';
import type { IEditorApplication } from '@svg-editor/core';
import { editorInjectionKey } from '../context';

export function useEditor(): IEditorApplication {
  const editor = inject(editorInjectionKey);
  if (!editor) throw new Error('useEditor must be used inside SvgEditorRoot');
  return editor;
}
