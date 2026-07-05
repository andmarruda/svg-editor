import type { InjectionKey } from 'vue';
import type { IEditorApplication } from '@andmarruda/svg-editor-core';

export const editorInjectionKey: InjectionKey<IEditorApplication> = Symbol('SvgEditor');
