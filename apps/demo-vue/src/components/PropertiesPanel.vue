<script setup lang="ts">
import { computed } from 'vue';
import { defineComponent, h } from 'vue';
import type { FontWeight, SvgNode } from '@andmarruda/svg-editor-core';
import { Color, Fill, Stroke } from '@andmarruda/svg-editor-core';
import {
  useEditor,
  useEditorCapabilities,
  useNodeCapabilities,
  useSelection,
} from '@andmarruda/svg-editor-vue';

const editor = useEditor();
const actions = useEditorCapabilities();
const selection = useSelection();
const capabilityInfo = useNodeCapabilities();
const node = computed(() => (selection.isSingle.value ? selection.selectedNodes.value[0] : null));

function colorHex(fill: SvgNode['fill']) {
  return fill.kind === 'solid' ? Color.toHex(fill.color).slice(0, 7) : '#000000';
}

function setFill(value: string) {
  if (node.value) editor.setFill([node.value.id], Fill.solid(Color.fromHex(value)));
}

function setStrokeColor(value: string) {
  if (!node.value) return;
  const stroke = node.value.stroke ?? Stroke.DEFAULT;
  editor.setStroke([node.value.id], { ...stroke, color: Color.fromHex(value) });
}

function numericOrString(value: string): FontWeight {
  const numeric = Number(value);
  return (Number.isFinite(numeric) && value.trim() !== '' ? numeric : value) as FontWeight;
}

const Field = defineComponent({
  props: { label: { type: String, required: true } },
  setup(props, { slots }) {
    return () =>
      h('div', { style: 'display:flex;align-items:center;gap:4px;margin-bottom:4px' }, [
        h('span', { style: 'min-width:44px;color:#666' }, props.label),
        h('div', { style: 'flex:1' }, slots.default?.()),
      ]);
  },
});
</script>

<template>
  <div
    style="
      padding: 12px;
      font-size: 12px;
      border-bottom: 1px solid #eee;
      overflow-y: auto;
      max-height: 360px;
    "
  >
    <div style="font-weight: 600; margin-bottom: 8px">Properties</div>
    <div v-if="selection.isEmpty.value" style="color: #888">No selection</div>
    <template v-else-if="node">
      <Field label="Name">
        <input
          :value="node.name"
          style="width: 100%"
          @input="
            editor.setNodeAttribute(node.id, 'name', ($event.target as HTMLInputElement).value)
          "
        />
      </Field>
      <Field label="Opacity">
        <input
          type="number"
          min="0"
          max="1"
          step="0.1"
          :value="node.opacity"
          style="width: 100%"
          @input="editor.setOpacity([node.id], Number(($event.target as HTMLInputElement).value))"
        />
      </Field>
      <Field v-if="capabilityInfo.some('canFill')" label="Fill">
        <input
          type="color"
          :value="colorHex(node.fill)"
          @input="setFill(($event.target as HTMLInputElement).value)"
        />
      </Field>
      <template v-if="capabilityInfo.some('canStroke')">
        <Field label="Stroke">
          <input
            type="color"
            :value="Color.toHex((node.stroke ?? Stroke.DEFAULT).color).slice(0, 7)"
            @input="setStrokeColor(($event.target as HTMLInputElement).value)"
          />
          <button @click="editor.setStroke([node.id], Stroke.NONE)">None</button>
        </Field>
        <Field label="Sw">
          <input
            type="number"
            :value="(node.stroke ?? Stroke.DEFAULT).width"
            style="width: 100%"
            @input="
              editor.setStroke(
                [node.id],
                Stroke.withWidth(
                  node.stroke ?? Stroke.DEFAULT,
                  Number(($event.target as HTMLInputElement).value),
                ),
              )
            "
          />
        </Field>
        <Field label="Dash">
          <input
            :value="(node.stroke ?? Stroke.DEFAULT).dashArray.join(' ')"
            style="width: 100%"
            @input="
              editor.setStroke([node.id], {
                ...(node.stroke ?? Stroke.DEFAULT),
                dashArray: ($event.target as HTMLInputElement).value
                  .split(/[,\s]+/)
                  .map(Number)
                  .filter(Number.isFinite),
              })
            "
          />
        </Field>
      </template>
      <Field v-if="capabilityInfo.some('canUseGradient')" label="Gradient">
        <button
          @click="
            actions.createLinearGradientForSelection(`vue-gradient-${Date.now()}`, [
              { offset: 0, color: Color.fromHex('#00a6ff'), opacity: 1 },
              { offset: 1, color: Color.fromHex('#ff5c8a'), opacity: 1 },
            ])
          "
        >
          Apply
        </button>
        <button
          @click="editor.applyStyle([node.id], editor.createFillStyle('Saved Fill', node.fill))"
        >
          Style
        </button>
      </Field>
      <template v-if="node.type === 'rect'">
        <Field label="X"
          ><input
            type="number"
            :value="node.x"
            @input="
              editor.setRectGeometry(node.id, {
                x: Number(($event.target as HTMLInputElement).value),
              })
            "
        /></Field>
        <Field label="Y"
          ><input
            type="number"
            :value="node.y"
            @input="
              editor.setRectGeometry(node.id, {
                y: Number(($event.target as HTMLInputElement).value),
              })
            "
        /></Field>
        <Field label="W"
          ><input
            type="number"
            :value="node.width"
            @input="
              editor.setRectGeometry(node.id, {
                width: Number(($event.target as HTMLInputElement).value),
              })
            "
        /></Field>
        <Field label="H"
          ><input
            type="number"
            :value="node.height"
            @input="
              editor.setRectGeometry(node.id, {
                height: Number(($event.target as HTMLInputElement).value),
              })
            "
        /></Field>
        <Field label="Rx"
          ><input
            type="number"
            :value="node.rx"
            @input="
              editor.setCornerRadii(node.id, {
                rx: Number(($event.target as HTMLInputElement).value),
                ry: node.ry,
              })
            "
        /></Field>
      </template>
      <template v-if="node.type === 'circle'">
        <Field label="Cx"
          ><input
            type="number"
            :value="node.cx"
            @input="
              editor.setCircleGeometry(node.id, {
                cx: Number(($event.target as HTMLInputElement).value),
              })
            "
        /></Field>
        <Field label="Cy"
          ><input
            type="number"
            :value="node.cy"
            @input="
              editor.setCircleGeometry(node.id, {
                cy: Number(($event.target as HTMLInputElement).value),
              })
            "
        /></Field>
        <Field label="R"
          ><input
            type="number"
            :value="node.r"
            @input="
              editor.setCircleGeometry(node.id, {
                r: Number(($event.target as HTMLInputElement).value),
              })
            "
        /></Field>
      </template>
      <template v-if="node.type === 'image'">
        <Field label="Href"
          ><input
            :value="node.href"
            style="width: 100%"
            @input="editor.setImageHref(node.id, ($event.target as HTMLInputElement).value)"
        /></Field>
        <Field label="Fit">
          <select
            :value="node.metadata.imageFit ?? 'contain'"
            @change="
              editor.setImageFit(
                node.id,
                ($event.target as HTMLSelectElement).value as 'contain' | 'cover' | 'stretch',
              )
            "
          >
            <option value="contain">contain</option>
            <option value="cover">cover</option>
            <option value="stretch">stretch</option>
          </select>
        </Field>
        <Field label="Crop"
          ><button
            @click="
              editor.setImageCrop(node.id, {
                x: node.x + node.width * 0.1,
                y: node.y + node.height * 0.1,
                width: node.width * 0.8,
                height: node.height * 0.8,
              })
            "
          >
            Center
          </button></Field
        >
      </template>
      <template v-if="node.type === 'text'">
        <Field label="Content"
          ><input
            :value="node.content"
            style="width: 100%"
            @input="editor.replaceTextContent(node.id, ($event.target as HTMLInputElement).value)"
        /></Field>
        <Field label="Font"
          ><input
            :value="node.fontFamily"
            style="width: 100%"
            @input="
              editor.setTextStyle(node.id, {
                fontFamily: ($event.target as HTMLInputElement).value,
              })
            "
        /></Field>
        <Field label="Size"
          ><input
            type="number"
            :value="node.fontSize"
            @input="
              editor.setTextStyle(node.id, {
                fontSize: Number(($event.target as HTMLInputElement).value),
              })
            "
        /></Field>
        <Field label="Weight"
          ><input
            :value="node.fontWeight"
            @input="
              editor.setTextStyle(node.id, {
                fontWeight: numericOrString(($event.target as HTMLInputElement).value),
              })
            "
        /></Field>
        <Field label="Space"
          ><input
            type="number"
            :value="node.letterSpacing"
            @input="
              editor.setTextStyle(node.id, {
                letterSpacing: Number(($event.target as HTMLInputElement).value),
              })
            "
        /></Field>
        <Field label="Rich"
          ><button
            @click="
              editor.setTextRangeStyle(
                node.id,
                { start: 0, end: Math.max(1, Math.min(5, node.content.length)) },
                { fill: Fill.solid(Color.fromHex('#ff3366')), fontWeight: 800 },
              )
            "
          >
            Accent
          </button></Field
        >
      </template>
    </template>
    <div v-else style="color: #666">{{ selection.selectedNodes.value.length }} nodes selected</div>
  </div>
</template>
