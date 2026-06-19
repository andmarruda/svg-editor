export interface IStorage {
  saveFile(filename: string, content: string): Promise<void>;
  loadFile(filename: string): Promise<string>;
  listFiles(): Promise<string[]>;
}
