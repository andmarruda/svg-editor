# @svg-editor/react

React adapter for `@svg-editor/core`.

## Install

```bash
pnpm add @svg-editor/core @svg-editor/react react react-dom
```

## Basic Usage

```tsx
import { Canvas, SelectionOverlay, SvgEditorRoot } from '@svg-editor/react';

export function App() {
  return (
    <SvgEditorRoot>
      <div style={{ position: 'relative', width: 800, height: 600 }}>
        <Canvas />
        <SelectionOverlay />
      </div>
    </SvgEditorRoot>
  );
}
```

## Hooks

```tsx
import { useEditor, useEditorCapabilities, useSelection } from '@svg-editor/react';

function Toolbar() {
  const editor = useEditor();
  const actions = useEditorCapabilities();
  const selection = useSelection();

  return (
    <>
      <button onClick={() => editor.setActiveTool('rect')}>Rect</button>
      <button onClick={actions.createDemoDesign}>Demo</button>
      <span>{selection.selectedNodes.length} selected</span>
    </>
  );
}
```

The adapter exposes creation, image, rich text, gradient, style and layout helpers without requiring direct escape hatches.
