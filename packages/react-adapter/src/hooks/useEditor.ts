import { useEditorContext } from '../context/EditorContext';
import type { IEditorApplication } from '@svg-editor/core';

export function useEditor(): IEditorApplication {
  return useEditorContext();
}
