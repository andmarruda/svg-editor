<script setup lang="ts">
import { useEditor, useEditorCapabilities, useHistory } from '@svg-editor/vue';
import { BrowserStorageAdapter } from '@svg-editor/vue';

const editor = useEditor();
const actions = useEditorCapabilities();
const history = useHistory();
const storage = new BrowserStorageAdapter();

async function openFile() {
  try {
    editor.openSvg(await storage.loadFile(), 'file.svg');
  } catch {
    // User cancelled.
  }
}

async function saveFile() {
  await storage.saveFile(editor.getState().filename ?? 'untitled.svg', editor.exportSvg());
  editor.markClean();
}

function selectedIds() {
  return [...editor.getState().selection.ids];
}
</script>

<template>
  <div
    style="
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      border-bottom: 1px solid #ddd;
      background: white;
      font-size: 13px;
      overflow-x: auto;
    "
  >
    <button @click="editor.newDocument(800, 600)">New</button>
    <button @click="openFile">Open…</button>
    <button @click="saveFile">Save</button>
    <button :disabled="!history.canUndo.value" @click="history.undo">Undo</button>
    <button :disabled="!history.canRedo.value" @click="history.redo">Redo</button>
    <button @click="editor.groupNodes(selectedIds())">Group</button>
    <button @click="editor.ungroupNodes(selectedIds())">Ungroup</button>
    <button @click="editor.bringToFront(selectedIds())">↑↑</button>
    <button @click="editor.bringForward(selectedIds())">↑</button>
    <button @click="editor.sendBackward(selectedIds())">↓</button>
    <button @click="editor.sendToBack(selectedIds())">↓↓</button>
    <button @click="actions.alignSelected('horizontal', 'left')">Left</button>
    <button @click="actions.alignSelected('horizontal', 'center')">Center</button>
    <button @click="actions.alignSelected('horizontal', 'right')">Right</button>
    <button @click="actions.alignSelected('vertical', 'top')">Top</button>
    <button @click="actions.alignSelected('vertical', 'middle')">Middle</button>
    <button @click="actions.alignSelected('vertical', 'bottom')">Bottom</button>
    <button @click="actions.distributeSelected('horizontal')">Dist H</button>
    <button @click="actions.distributeSelected('vertical')">Dist V</button>
    <button @click="actions.arrangeSelected('row')">Row</button>
    <button @click="actions.arrangeSelected('column')">Column</button>
    <button @click="actions.arrangeSelected('grid')">Grid</button>
    <button @click="actions.matchSelectedSize">Match</button>
    <button @click="actions.createDemoDesign">Demo Spec</button>
  </div>
</template>
