<script setup lang="ts">
import type { BoundingBox } from '@svg-editor/core';

defineProps<{
  box: BoundingBox | null;
}>();
</script>

<template>
  <svg
    v-if="box"
    style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none"
  >
    <rect
      :x="box.x"
      :y="box.y"
      :width="box.width"
      :height="box.height"
      fill="rgba(0, 102, 255, 0.08)"
      stroke="#0066ff"
      stroke-width="1"
      stroke-dasharray="4 2"
    />
  </svg>
</template>
