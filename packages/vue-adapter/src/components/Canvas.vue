<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { BoundingBox, ShapePreset } from '@andmarruda/svg-editor-core';
import {
  createNodeFromPointer,
  inlinePlaceholderImage,
  snapPointToGrid,
  snapPointToObjects,
  toDocCoords,
} from '@andmarruda/svg-editor-adapter-utils';
import { SvgDomRenderer } from '../renderer/SvgDomRenderer';
import { useEditor } from '../composables/useEditor';
import { useEditorState } from '../composables/useEditorState';

const props = withDefaults(
  defineProps<{
    imageHref?: string;
    shapePreset?: ShapePreset;
    snapToGrid?: boolean;
    snapToObjects?: boolean;
    gridSize?: number;
  }>(),
  {
    imageHref: () => inlinePlaceholderImage(),
    shapePreset: 'star',
    snapToGrid: true,
    snapToObjects: true,
    gridSize: 10,
  },
);

const editor = useEditor();
const state = useEditorState();
const root = ref<HTMLDivElement | null>(null);
const renderer = ref<SvgDomRenderer | null>(null);
const marquee = { startX: 0, startY: 0, active: false };

function docPoint(event: PointerEvent) {
  if (!root.value) return { x: event.clientX, y: event.clientY };
  return toDocCoords(
    { x: event.clientX, y: event.clientY },
    root.value.getBoundingClientRect(),
    state.value.viewTransform.matrix,
    (point) =>
      snapPointToObjects(
        state.value.document,
        snapPointToGrid(point, props.gridSize, props.snapToGrid),
        props.snapToObjects ? 6 : 0,
      ),
  );
}

function onPointerDown(event: PointerEvent) {
  if (state.value.activeTool !== 'select') return;
  const point = docPoint(event);
  marquee.startX = point.x;
  marquee.startY = point.y;
  marquee.active = true;
  (event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId);
}

function onPointerUp(event: PointerEvent) {
  if (!marquee.active) return;
  marquee.active = false;
  const point = docPoint(event);
  const dx = Math.abs(point.x - marquee.startX);
  const dy = Math.abs(point.y - marquee.startY);

  if (state.value.activeTool !== 'select') {
    createNodeFromPointer({
      editor,
      tool: state.value.activeTool,
      start: { x: marquee.startX, y: marquee.startY },
      end: point,
      imageHref: props.imageHref,
      shapePreset: props.shapePreset,
      snap: (candidate) =>
        snapPointToObjects(
          state.value.document,
          snapPointToGrid(candidate, props.gridSize, props.snapToGrid),
          props.snapToObjects ? 6 : 0,
        ),
    });
    editor.setActiveTool('select');
    return;
  }

  if (dx < 3 && dy < 3) {
    const hitId = renderer.value?.hitTest(point, state.value) ?? null;
    if (hitId) editor.selectNode(hitId, event.shiftKey);
    else editor.deselectAll();
    return;
  }

  const box: BoundingBox = {
    x: Math.min(marquee.startX, point.x),
    y: Math.min(marquee.startY, point.y),
    width: Math.abs(point.x - marquee.startX),
    height: Math.abs(point.y - marquee.startY),
  };
  editor.selectByMarquee(box, event.shiftKey);
}

function onWheel(event: WheelEvent) {
  event.preventDefault();
  const scaleDelta = event.deltaY > 0 ? 0.9 : 1.1;
  const [a, b, c, d, e, f] = state.value.viewTransform.matrix;
  editor.setViewTransform({
    matrix: [(a ?? 1) * scaleDelta, b ?? 0, c ?? 0, (d ?? 1) * scaleDelta, e ?? 0, f ?? 0],
  });
}

onMounted(() => {
  if (!root.value) return;
  const next = new SvgDomRenderer();
  next.mount(root.value);
  renderer.value = next;
  next.render(state.value);
});

watch(state, (next) => renderer.value?.render(next), { deep: true });
onBeforeUnmount(() => renderer.value?.unmount());
</script>

<template>
  <div
    ref="root"
    style="position: relative; overflow: hidden; cursor: default; width: 100%; height: 100%"
    @pointerdown="onPointerDown"
    @pointerup="onPointerUp"
    @wheel="onWheel"
  />
</template>
