import type { ICommand } from './ICommand';
import type { Document } from '../../domain/aggregates/Document';

export class CompositeCommand implements ICommand {
  readonly description: string;
  private readonly commands: ICommand[];

  constructor(description: string, commands: ICommand[]) {
    this.description = description;
    this.commands = commands;
  }

  execute(doc: Document): Document {
    return this.commands.reduce((d, cmd) => cmd.execute(d), doc);
  }

  undo(doc: Document): Document {
    return [...this.commands].reverse().reduce((d, cmd) => cmd.undo(d), doc);
  }
}
