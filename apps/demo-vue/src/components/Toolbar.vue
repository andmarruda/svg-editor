<script setup lang="ts">
import type { ShapePreset, ToolType } from '@andmarruda/svg-editor-core';
import { useEditor, useEditorCapabilities, useEditorState } from '@andmarruda/svg-editor-vue';

const editor = useEditor();
const state = useEditorState();
const actions = useEditorCapabilities();
const tools: Array<{ tool: ToolType; label: string; mark: string }> = [
  { tool: 'select', label: 'Select', mark: 'V' },
  { tool: 'rect', label: 'Rect', mark: '▭' },
  { tool: 'ellipse', label: 'Ellipse', mark: '◯' },
  { tool: 'circle', label: 'Circle', mark: '○' },
  { tool: 'line', label: 'Line', mark: '╱' },
  { tool: 'polyline', label: 'Polyline', mark: '⌁' },
  { tool: 'polygon', label: 'Polygon', mark: '⬠' },
  { tool: 'path', label: 'Path', mark: '⌇' },
  { tool: 'text', label: 'Text', mark: 'T' },
  { tool: 'image', label: 'Image', mark: 'Img' },
  { tool: 'shape', label: 'Shape', mark: '★' },
  { tool: 'pan', label: 'Pan', mark: 'H' },
];
const quickShapes: ShapePreset[] = ['triangle', 'diamond', 'star', 'arrow-right', 'speech-bubble'];

function importImage(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener('load', () => {
    actions.createImage({
      href: String(reader.result),
      x: 140,
      y: 140,
      width: 240,
      height: 160,
      preserveAspectRatio: 'xMidYMid',
    });
  });
  reader.readAsDataURL(file);
  input.value = '';
}
</script>

<template>
  <div
    style="
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 8px;
      border-right: 1px solid #ddd;
      background: white;
      width: 72px;
    "
  >
    <button
      v-for="tool in tools"
      :key="tool.tool"
      :title="tool.label"
      :style="{
        width: '56px',
        height: '32px',
        fontSize: '11px',
        background: state.activeTool === tool.tool ? '#0066ff' : 'transparent',
        color: state.activeTool === tool.tool ? 'white' : 'inherit',
        border: '1px solid #ccc',
        borderRadius: '4px',
      }"
      @click="editor.setActiveTool(tool.tool)"
    >
      {{ tool.mark }}
    </button>
    <span style="height: 1px; background: #ddd; margin: 4px 0" />
    <button
      v-for="preset in quickShapes"
      :key="preset"
      style="width: 56px; height: 28px; font-size: 10px; border: 1px solid #ccc; border-radius: 4px"
      @click="actions.createShapePreset(preset, { x: 120, y: 120, width: 120, height: 90 })"
    >
      {{ preset.split('-')[0] }}
    </button>
    <label
      style="
        width: 56px;
        height: 32px;
        font-size: 10px;
        border: 1px solid #ccc;
        border-radius: 4px;
        display: grid;
        place-items: center;
      "
    >
      Import
      <input type="file" accept="image/*" style="display: none" @change="importImage" />
    </label>
  </div>
</template>
