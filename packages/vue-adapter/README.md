# @svg-editor/vue

Vue adapter for `@svg-editor/core`.

## Install

```bash
pnpm add @svg-editor/core @svg-editor/vue vue
```

## Basic Usage

```vue
<script setup lang="ts">
import { Canvas, SelectionOverlay, SvgEditorRoot } from '@svg-editor/vue';
</script>

<template>
  <SvgEditorRoot>
    <div style="position: relative; width: 800px; height: 600px">
      <Canvas />
      <SelectionOverlay />
    </div>
  </SvgEditorRoot>
</template>
```

## Composables

```ts
import { useEditor, useEditorCapabilities, useSelection } from '@svg-editor/vue';

const editor = useEditor();
const actions = useEditorCapabilities();
const selection = useSelection();

editor.setActiveTool('text');
actions.createDemoDesign();
console.log(selection.selectedNodes.value);
```

The Vue adapter mirrors the React capability surface and uses the same shared renderer infrastructure.
