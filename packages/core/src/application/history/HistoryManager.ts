import type { ICommand } from '../commands/ICommand';
import type { Document } from '../../domain/aggregates/Document';

const MAX_STACK_SIZE = 100;

export class HistoryManager {
  private undoStack: Array<{ command: ICommand; before: Document }> = [];
  private redoStack: Array<{ command: ICommand; before: Document }> = [];

  execute(command: ICommand, current: Document): Document {
    const before = current;
    const after = command.execute(current);
    this.undoStack.push({ command, before });
    if (this.undoStack.length > MAX_STACK_SIZE) {
      this.undoStack.shift();
    }
    this.redoStack = [];
    return after;
  }

  undo(current: Document): Document {
    const entry = this.undoStack.pop();
    if (!entry) return current;
    const after = entry.command.undo(current);
    this.redoStack.push({ command: entry.command, before: current });
    return after;
  }

  redo(current: Document): Document {
    const entry = this.redoStack.pop();
    if (!entry) return current;
    const after = entry.command.execute(current);
    this.undoStack.push({ command: entry.command, before: current });
    return after;
  }

  get canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }
}
