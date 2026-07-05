# @andmarruda/svg-editor-vue

Vue adapter for `@andmarruda/svg-editor-core`.

## Install

```bash
npm install @andmarruda/svg-editor-core @andmarruda/svg-editor-vue vue
pnpm add @andmarruda/svg-editor-core @andmarruda/svg-editor-vue vue
yarn add @andmarruda/svg-editor-core @andmarruda/svg-editor-vue vue
bun add @andmarruda/svg-editor-core @andmarruda/svg-editor-vue vue
```

## Basic Usage

```vue
<script setup lang="ts">
import { Canvas, SelectionOverlay, SvgEditorRoot } from '@andmarruda/svg-editor-vue';
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
import { useEditor, useEditorCapabilities, useSelection } from '@andmarruda/svg-editor-vue';

const editor = useEditor();
const actions = useEditorCapabilities();
const selection = useSelection();

editor.setActiveTool('text');
actions.createDemoDesign();
console.log(selection.selectedNodes.value);
```

The Vue adapter mirrors the React capability surface and uses the same shared renderer infrastructure.
