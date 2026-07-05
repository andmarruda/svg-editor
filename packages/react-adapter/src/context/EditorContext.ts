import { createContext, useContext } from 'react';
import type { IEditorApplication } from '@andmarruda/svg-editor-core';

export const EditorContext = createContext<IEditorApplication | null>(null);

export function useEditorContext(): IEditorApplication {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error('useEditorContext must be used inside SvgEditorRoot');
  return ctx;
}
