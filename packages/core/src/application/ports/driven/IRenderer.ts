import type { EditorState } from '../../../domain/aggregates/EditorState';
import type { NodeId } from '../../../domain/value-objects/NodeId';
import type { Point } from '../../../domain/value-objects/Point';
import type { BoundingBox } from '../../../domain/value-objects/BoundingBox';

export interface IRenderer {
  mount(container: HTMLElement): void;
  unmount(): void;
  render(state: EditorState): void;
  hitTest(point: Point, state: EditorState): NodeId | null;
  hitTestMarquee(box: BoundingBox, state: EditorState): NodeId[];
}
