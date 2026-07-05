<script setup lang="ts">
import { computed } from 'vue';
import { useEditor, useEditorState } from '@andmarruda/svg-editor-vue';

const editor = useEditor();
const state = useEditorState();
const zoom = computed(() => Math.round((state.value.viewTransform.matrix[0] ?? 1) * 100));

function zoomBy(factor: number) {
  const [a, b, c, d, e, f] = state.value.viewTransform.matrix;
  editor.setViewTransform({
    matrix: [(a ?? 1) * factor, b ?? 0, c ?? 0, (d ?? 1) * factor, e ?? 0, f ?? 0],
  });
}
</script>

<template>
  <div
    style="
      position: absolute;
      right: 12px;
      bottom: 12px;
      display: flex;
      gap: 4px;
      align-items: center;
      background: white;
      border: 1px solid #ddd;
      padding: 4px;
      font-size: 12px;
    "
  >
    <button @click="zoomBy(0.9)">-</button>
    <span style="min-width: 44px; text-align: center">{{ zoom }}%</span>
    <button @click="zoomBy(1.1)">+</button>
  </div>
</template>
