import type { DomainEvent } from './DomainEvent';
import type { NodeId } from '../value-objects/NodeId';
import type { SvgNode } from '../entities/SvgNode';

export interface NodeAddedEvent extends DomainEvent {
  readonly type: 'node:added';
  readonly node: SvgNode;
  readonly parentId: NodeId | null;
}

export interface NodeRemovedEvent extends DomainEvent {
  readonly type: 'node:removed';
  readonly nodeId: NodeId;
  readonly parentId: NodeId | null;
}

export interface NodeMutatedEvent extends DomainEvent {
  readonly type: 'node:mutated';
  readonly nodeId: NodeId;
  readonly before: SvgNode;
  readonly after: SvgNode;
}

export interface SelectionChangedEvent extends DomainEvent {
  readonly type: 'selection:changed';
  readonly previousIds: readonly NodeId[];
  readonly currentIds: readonly NodeId[];
}

export interface DocumentChangedEvent extends DomainEvent {
  readonly type: 'document:changed';
}

export type EditorDomainEvent =
  | NodeAddedEvent
  | NodeRemovedEvent
  | NodeMutatedEvent
  | SelectionChangedEvent
  | DocumentChangedEvent;
