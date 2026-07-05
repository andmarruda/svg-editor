import { useEffect } from 'react';
import { useEditor, useEditorCapabilities, useHistory } from '@andmarruda/svg-editor-react';
import { BrowserStorageAdapter } from '@andmarruda/svg-editor-react';

const storage = new BrowserStorageAdapter();

export function MenuBar() {
  const editor = useEditor();
  const actions = useEditorCapabilities();
  const { canUndo, canRedo, undo, redo } = useHistory();

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.ctrlKey || e.metaKey;
      if (meta && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if (meta && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
      if (meta && e.key === 'a') {
        e.preventDefault();
        editor.selectAll();
      }
      if (meta && e.key === 'c') {
        e.preventDefault();
        editor.copy();
      }
      if (meta && e.key === 'x') {
        e.preventDefault();
        editor.cut();
      }
      if (meta && e.key === 'v') {
        e.preventDefault();
        editor.paste();
      }
      if (meta && e.key === 'd') {
        e.preventDefault();
        editor.duplicate();
      }
      if (meta && e.key === 'g') {
        e.preventDefault();
        handleGroup();
      }
      if (meta && e.shiftKey && e.key === 'G') {
        e.preventDefault();
        handleUngroup();
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if ((e.target as HTMLElement).tagName === 'INPUT') return;
        e.preventDefault();
        editor.deleteSelected();
      }
      if (e.key === 'Escape') {
        editor.deselectAll();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [editor, undo, redo]);

  const handleOpen = async () => {
    try {
      const content = await storage.loadFile();
      editor.openSvg(content, 'file.svg');
    } catch {
      /* user cancelled */
    }
  };

  const handleSave = async () => {
    const svg = editor.exportSvg();
    const state = editor.getState();
    const filename = state.filename ?? 'untitled.svg';
    await storage.saveFile(filename, svg);
    editor.markClean();
  };

  const handleNew = () => {
    editor.newDocument(800, 600);
  };

  const handleGroup = () => {
    const ids = [...editor.getState().selection.ids];
    if (ids.length >= 2) editor.groupNodes(ids);
  };

  const handleUngroup = () => {
    const ids = [...editor.getState().selection.ids];
    if (ids.length > 0) editor.ungroupNodes(ids);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 8px',
        borderBottom: '1px solid #ddd',
        background: 'white',
        fontSize: 13,
      }}
    >
      <button onClick={handleNew}>New</button>
      <button onClick={handleOpen}>Open…</button>
      <button onClick={handleSave}>Save</button>
      <span style={{ width: 1, height: 20, background: '#ddd', margin: '0 4px' }} />
      <button onClick={undo} disabled={!canUndo}>
        Undo
      </button>
      <button onClick={redo} disabled={!canRedo}>
        Redo
      </button>
      <span style={{ width: 1, height: 20, background: '#ddd', margin: '0 4px' }} />
      <button onClick={handleGroup}>Group</button>
      <button onClick={handleUngroup}>Ungroup</button>
      <span style={{ width: 1, height: 20, background: '#ddd', margin: '0 4px' }} />
      <button
        onClick={() => {
          const ids = [...editor.getState().selection.ids];
          editor.bringToFront(ids);
        }}
      >
        ↑↑
      </button>
      <button
        onClick={() => {
          const ids = [...editor.getState().selection.ids];
          editor.bringForward(ids);
        }}
      >
        ↑
      </button>
      <button
        onClick={() => {
          const ids = [...editor.getState().selection.ids];
          editor.sendBackward(ids);
        }}
      >
        ↓
      </button>
      <button
        onClick={() => {
          const ids = [...editor.getState().selection.ids];
          editor.sendToBack(ids);
        }}
      >
        ↓↓
      </button>
      <span style={{ width: 1, height: 20, background: '#ddd', margin: '0 4px' }} />
      <button onClick={() => actions.alignSelected('horizontal', 'left')}>Left</button>
      <button onClick={() => actions.alignSelected('horizontal', 'center')}>Center</button>
      <button onClick={() => actions.alignSelected('horizontal', 'right')}>Right</button>
      <button onClick={() => actions.alignSelected('vertical', 'top')}>Top</button>
      <button onClick={() => actions.alignSelected('vertical', 'middle')}>Middle</button>
      <button onClick={() => actions.alignSelected('vertical', 'bottom')}>Bottom</button>
      <button onClick={() => actions.distributeSelected('horizontal')}>Dist H</button>
      <button onClick={() => actions.distributeSelected('vertical')}>Dist V</button>
      <button onClick={() => actions.arrangeSelected('row')}>Row</button>
      <button onClick={() => actions.arrangeSelected('column')}>Column</button>
      <button onClick={() => actions.arrangeSelected('grid')}>Grid</button>
      <button onClick={actions.matchSelectedSize}>Match</button>
      <span style={{ width: 1, height: 20, background: '#ddd', margin: '0 4px' }} />
      <button onClick={actions.createDemoDesign}>Demo Spec</button>
    </div>
  );
}
