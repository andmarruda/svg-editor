import type { IClipboardAdapter } from '@andmarruda/svg-editor-core';
import type { SvgNode } from '@andmarruda/svg-editor-core';

const MIME_TYPE = 'text/x-svg-editor-nodes';

export class BrowserClipboardAdapter implements IClipboardAdapter {
  private _fallback: SvgNode[] | null = null;

  async write(nodes: SvgNode[]): Promise<void> {
    const json = JSON.stringify(nodes);
    this._fallback = nodes;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(json);
      }
    } catch {
      // Clipboard API not available in some contexts; fallback used
    }
  }

  async read(): Promise<SvgNode[] | null> {
    try {
      if (navigator.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        const parsed = JSON.parse(text) as unknown;
        if (Array.isArray(parsed)) return parsed as SvgNode[];
      }
    } catch {
      // Parse failure or permission denied — fall through to in-memory fallback
    }
    return this._fallback;
  }
}
