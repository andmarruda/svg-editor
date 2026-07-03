<script setup lang="ts">
import { computed } from 'vue';
import type { BoundingBox, Point, ResizeHandle } from '@svg-editor/core';
import { BoundingBox as BoundingBoxValue, BoundsCalculator } from '@svg-editor/core';
import { useEditor } from '../composables/useEditor';
import { useEditorState } from '../composables/useEditorState';

const HANDLE_SIZE = 8;
const ROTATE_HANDLE_OFFSET = 28;
const handles: Array<[number, number, ResizeHandle]> = [
  [0, 0, 'top-left'],
  [0.5, 0, 'top'],
  [1, 0, 'top-right'],
  [0, 0.5, 'left'],
  [1, 0.5, 'right'],
  [0, 1, 'bottom-left'],
  [0.5, 1, 'bottom'],
  [1, 1, 'bottom-right'],
];

const editor = useEditor();
const state = useEditorState();
const selectedNodes = computed(() =>
  [...state.value.selection.ids]
    .map((id) => state.value.document.nodes.get(id))
    .filter((node) => node !== undefined),
);
const union = computed(() => {
  const boxes = selectedNodes.value.map((node) => BoundsCalculator.forNode(node));
  return boxes.length > 0 ? boxes.reduce((acc, box) => BoundingBoxValue.union(acc, box)) : null;
});
const matrix = computed(() => state.value.viewTransform.matrix);
const screenBox = computed(() => {
  if (!union.value) return null;
  const [a, , , d, e, f] = matrix.value;
  return {
    x: union.value.x * (a ?? 1) + (e ?? 0),
    y: union.value.y * (d ?? 1) + (f ?? 0),
    width: union.value.width * (a ?? 1),
    height: union.value.height * (d ?? 1),
  };
});

function resizeBounds(bounds: BoundingBox, handle: ResizeHandle, delta: Point): BoundingBox {
  let left = bounds.x;
  let top = bounds.y;
  let right = bounds.x + bounds.width;
  let bottom = bounds.y + bounds.height;
  if (handle.includes('left')) left += delta.x;
  if (handle.includes('right')) right += delta.x;
  if (handle.includes('top')) top += delta.y;
  if (handle.includes('bottom')) bottom += delta.y;
  return { x: left, y: top, width: Math.max(1, right - left), height: Math.max(1, bottom - top) };
}

function startResize(event: PointerEvent, handle: ResizeHandle) {
  if (!union.value) return;
  event.stopPropagation();
  const ids = [...state.value.selection.ids];
  const startX = event.clientX;
  const startY = event.clientY;
  const initial = union.value;
  const [a, , , d] = matrix.value;
  const onMove = (moveEvent: PointerEvent) => {
    editor.resizeSelectionToBounds(
      ids,
      resizeBounds(initial, handle, {
        x: (moveEvent.clientX - startX) / (a ?? 1),
        y: (moveEvent.clientY - startY) / (d ?? 1),
      }),
    );
  };
  const onUp = () => {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
  };
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
}

function startRotate(event: PointerEvent) {
  if (!union.value || !screenBox.value) return;
  event.stopPropagation();
  const ids = [...state.value.selection.ids];
  const pivot = BoundingBoxValue.center(union.value);
  const screenPivot = {
    x: screenBox.value.x + screenBox.value.width / 2,
    y: screenBox.value.y + screenBox.value.height / 2,
  };
  const startAngle = angle({ x: event.clientX, y: event.clientY }, screenPivot);
  const onMove = (moveEvent: PointerEvent) => {
    editor.setRotation(
      ids,
      angle({ x: moveEvent.clientX, y: moveEvent.clientY }, screenPivot) - startAngle,
      pivot,
    );
  };
  const onUp = () => {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
  };
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
}

function angle(point: Point, pivot: Point): number {
  return (Math.atan2(point.y - pivot.y, point.x - pivot.x) * 180) / Math.PI;
}
</script>

<template>
  <svg
    v-if="screenBox"
    style="
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      overflow: visible;
    "
  >
    <rect
      :x="screenBox.x - 1"
      :y="screenBox.y - 1"
      :width="screenBox.width + 2"
      :height="screenBox.height + 2"
      fill="none"
      stroke="#0066ff"
      stroke-width="1"
      stroke-dasharray="4 2"
    />
    <rect
      v-for="[hx, hy, handle] in handles"
      :key="handle"
      :x="screenBox.x + hx * screenBox.width - HANDLE_SIZE / 2"
      :y="screenBox.y + hy * screenBox.height - HANDLE_SIZE / 2"
      :width="HANDLE_SIZE"
      :height="HANDLE_SIZE"
      fill="white"
      stroke="#0066ff"
      stroke-width="1"
      style="pointer-events: all; cursor: nwse-resize"
      @pointerdown="(event) => startResize(event, handle)"
    />
    <line
      :x1="screenBox.x + screenBox.width / 2"
      :y1="screenBox.y"
      :x2="screenBox.x + screenBox.width / 2"
      :y2="screenBox.y - ROTATE_HANDLE_OFFSET"
      stroke="#0066ff"
      stroke-width="1"
    />
    <circle
      :cx="screenBox.x + screenBox.width / 2"
      :cy="screenBox.y - ROTATE_HANDLE_OFFSET"
      :r="HANDLE_SIZE / 2"
      fill="white"
      stroke="#0066ff"
      stroke-width="1"
      style="pointer-events: all; cursor: grab"
      @pointerdown="startRotate"
    />
  </svg>
</template>
