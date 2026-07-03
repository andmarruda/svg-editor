// ── Context ─────────────────────────────────────────────────────────────────
export { EditorContext, useEditorContext } from './context/EditorContext';

// ── Hooks ────────────────────────────────────────────────────────────────────
export { useEditor } from './hooks/useEditor';
export { useEditorState } from './hooks/useEditorState';
export { useSelection } from './hooks/useSelection';
export type { SelectionInfo } from './hooks/useSelection';
export { useHistory } from './hooks/useHistory';
export type { HistoryActions } from './hooks/useHistory';
export { useViewport } from './hooks/useViewport';
export type { ViewportActions } from './hooks/useViewport';
export { useNodeCapabilities } from './hooks/useNodeCapabilities';
export type { NodeCapabilitiesInfo } from './hooks/useNodeCapabilities';

// ── Components ───────────────────────────────────────────────────────────────
export { SvgEditorRoot } from './components/SvgEditorRoot';
export { Canvas } from './components/Canvas';
export { SelectionOverlay } from './components/SelectionOverlay';
export { MarqueeRect } from './components/MarqueeRect';

// ── Renderer ─────────────────────────────────────────────────────────────────
export { SvgDomRenderer } from './renderer/SvgDomRenderer';

// ── Adapters ─────────────────────────────────────────────────────────────────
export { BrowserClipboardAdapter } from './adapters/BrowserClipboardAdapter';
export { BrowserStorageAdapter } from './adapters/BrowserStorageAdapter';
export { SvgSerializer } from './adapters/SvgSerializer';
