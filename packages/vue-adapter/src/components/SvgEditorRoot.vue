<script setup lang="ts">
import { provide, shallowRef } from 'vue';
import {
  EditorApplication,
  InMemoryEventBus,
  NanoIdGenerator,
  type IEditorApplication,
} from '@svg-editor/core';
import { editorInjectionKey } from '../context';
import { BrowserClipboardAdapter } from '../adapters/BrowserClipboardAdapter';
import { SvgSerializer } from '../adapters/SvgSerializer';

const props = defineProps<{
  editor?: IEditorApplication;
}>();

const editor = shallowRef(
  props.editor ??
    new EditorApplication({
      serializer: new SvgSerializer(),
      clipboard: new BrowserClipboardAdapter(),
      eventBus: new InMemoryEventBus(),
      idGenerator: new NanoIdGenerator(),
    }),
);

provide(editorInjectionKey, editor.value);
</script>

<template>
  <slot />
</template>
