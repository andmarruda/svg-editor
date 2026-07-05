<script setup lang="ts">
import { computed } from 'vue';
import { useEditor, useEditorState } from '@andmarruda/svg-editor-vue';

const editor = useEditor();
const state = useEditorState();
const nodes = computed(() => [...state.value.document.nodes.values()].reverse());
</script>

<template>
  <div style="padding: 12px; font-size: 12px; overflow-y: auto; flex: 1">
    <div style="font-weight: 600; margin-bottom: 8px">Layers</div>
    <button
      v-for="node in nodes"
      :key="node.id"
      :style="{
        display: 'flex',
        width: '100%',
        justifyContent: 'space-between',
        marginBottom: '4px',
        border: '1px solid #ddd',
        background: state.selection.ids.has(node.id) ? '#e7f0ff' : 'white',
      }"
      @click="editor.selectNode(node.id)"
    >
      <span>{{ node.name }}</span>
      <span>{{ node.type }}</span>
    </button>
  </div>
</template>
