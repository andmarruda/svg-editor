import type { IEventBus, Unsubscribe } from '../../application/ports/driven/IEventBus';
import type { EditorDomainEvent } from '../../domain/events/NodeEvents';

type Handler = (event: EditorDomainEvent) => void;

export class InMemoryEventBus implements IEventBus {
  private readonly handlers = new Map<string, Set<Handler>>();

  publish(event: EditorDomainEvent): void {
    const set = this.handlers.get(event.type);
    if (!set) return;
    for (const handler of set) {
      handler(event);
    }
  }

  subscribe<T extends EditorDomainEvent>(type: T['type'], handler: (event: T) => void): Unsubscribe {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    const set = this.handlers.get(type)!;
    set.add(handler as Handler);
    return () => { set.delete(handler as Handler); };
  }
}
