import type { IClipboardAdapter, SvgNode } from '@andmarruda/svg-editor-core';

export class BrowserClipboardAdapter implements IClipboardAdapter {
  private fallback: SvgNode[] | null = null;

  async write(nodes: SvgNode[]): Promise<void> {
    this.fallback = nodes;
    try {
      await navigator.clipboard?.writeText(JSON.stringify(nodes));
    } catch {
      // Browser clipboard may be unavailable; fallback keeps same-tab copy/paste working.
    }
  }

  async read(): Promise<SvgNode[] | null> {
    try {
      const text = await navigator.clipboard?.readText();
      if (text) {
        const parsed = JSON.parse(text) as unknown;
        if (Array.isArray(parsed)) return parsed as SvgNode[];
      }
    } catch {
      // Ignore parse/permission failures and use the fallback.
    }
    return this.fallback;
  }
}
