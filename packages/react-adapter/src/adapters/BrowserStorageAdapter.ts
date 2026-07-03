import type { IStorage } from '@svg-editor/core';

export class BrowserStorageAdapter implements IStorage {
  async saveFile(filename: string, content: string): Promise<void> {
    try {
      // File System Access API
      if ('showSaveFilePicker' in window) {
        const handle = await (
          window as typeof window & {
            showSaveFilePicker: (opts: object) => Promise<FileSystemFileHandle>;
          }
        ).showSaveFilePicker({
          suggestedName: filename,
          types: [{ description: 'SVG files', accept: { 'image/svg+xml': ['.svg'] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(content);
        await writable.close();
        return;
      }
    } catch (e) {
      if ((e as DOMException).name === 'AbortError') return;
    }

    // Fallback: anchor download
    const blob = new Blob([content], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async loadFile(_filename?: string): Promise<string> {
    try {
      if ('showOpenFilePicker' in window) {
        const [handle] = await (
          window as typeof window & {
            showOpenFilePicker: (opts: object) => Promise<FileSystemFileHandle[]>;
          }
        ).showOpenFilePicker({
          types: [{ description: 'SVG files', accept: { 'image/svg+xml': ['.svg'] } }],
          multiple: false,
        });
        if (!handle) throw new Error('No file selected');
        const file = await handle.getFile();
        return file.text();
      }
    } catch (e) {
      if ((e as DOMException).name === 'AbortError') throw e;
    }

    // Fallback: input[type=file]
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.svg,image/svg+xml';
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) {
          reject(new Error('No file selected'));
          return;
        }
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
      };
      input.click();
    });
  }

  async listFiles(): Promise<string[]> {
    return [];
  }
}
