<script setup lang="ts">
import { Canvas, SelectionOverlay, SvgEditorRoot } from '@andmarruda/svg-editor-vue';
import Toolbar from './components/Toolbar.vue';
import MenuBar from './components/MenuBar.vue';
import PropertiesPanel from './components/PropertiesPanel.vue';
import LayersPanel from './components/LayersPanel.vue';
import ZoomControls from './components/ZoomControls.vue';
</script>

<template>
  <SvgEditorRoot>
    <div
      style="
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100vh;
        font-family: system-ui, sans-serif;
      "
    >
      <MenuBar />
      <div style="display: flex; flex: 1; overflow: hidden">
        <Toolbar />
        <div style="flex: 1; position: relative; background: #f0f0f0">
          <Canvas />
          <SelectionOverlay />
          <ZoomControls />
        </div>
        <div
          style="
            display: flex;
            flex-direction: column;
            width: 280px;
            border-left: 1px solid #ddd;
            background: white;
          "
        >
          <PropertiesPanel />
          <LayersPanel />
        </div>
      </div>
    </div>
  </SvgEditorRoot>
</template>
