import type { IStorage } from '@svg-editor/core';

export class BrowserStorageAdapter implements IStorage {
  async saveFile(filename: string, content: string): Promise<void> {
    try {
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
    } catch (error) {
      if ((error as DOMException).name === 'AbortError') return;
    }

    const blob = new Blob([content], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  async loadFile(): Promise<string> {
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
        return (await handle.getFile()).text();
      }
    } catch (error) {
      if ((error as DOMException).name === 'AbortError') throw error;
    }

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
        reader.onload = () => resolve(String(reader.result));
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
