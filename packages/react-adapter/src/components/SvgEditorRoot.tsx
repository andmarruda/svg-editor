import { useMemo, type ReactNode } from 'react';
import { EditorApplication, NanoIdGenerator, InMemoryEventBus } from '@andmarruda/svg-editor-core';
import type { IEditorApplication, IStorage } from '@andmarruda/svg-editor-core';
import { EditorContext } from '../context/EditorContext';
import { BrowserClipboardAdapter } from '../adapters/BrowserClipboardAdapter';
import { BrowserStorageAdapter } from '../adapters/BrowserStorageAdapter';
import { SvgSerializer } from '../adapters/SvgSerializer';

interface SvgEditorRootProps {
  children: ReactNode;
  editor?: IEditorApplication;
  storage?: IStorage;
}

export function SvgEditorRoot({ children, editor: externalEditor, storage }: SvgEditorRootProps) {
  const editor = useMemo(() => {
    if (externalEditor) return externalEditor;
    return new EditorApplication({
      serializer: new SvgSerializer(),
      clipboard: new BrowserClipboardAdapter(),
      eventBus: new InMemoryEventBus(),
      idGenerator: new NanoIdGenerator(),
    });
  }, [externalEditor]);

  return <EditorContext.Provider value={editor}>{children}</EditorContext.Provider>;
}
