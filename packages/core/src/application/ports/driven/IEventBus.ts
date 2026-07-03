import type { EditorDomainEvent } from '../../../domain/events/NodeEvents';

export type Unsubscribe = () => void;

export interface IEventBus {
  publish(event: EditorDomainEvent): void;
  subscribe<T extends EditorDomainEvent>(type: T['type'], handler: (event: T) => void): Unsubscribe;
}
