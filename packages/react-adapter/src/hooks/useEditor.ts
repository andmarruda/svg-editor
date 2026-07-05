import { useEditorContext } from '../context/EditorContext';
import type { IEditorApplication } from '@andmarruda/svg-editor-core';

export function useEditor(): IEditorApplication {
  return useEditorContext();
}
