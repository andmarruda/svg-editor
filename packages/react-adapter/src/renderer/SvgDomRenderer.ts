import type { IRenderer } from '@svg-editor/core';
import type { EditorState } from '@svg-editor/core';
import type { NodeId } from '@svg-editor/core';
import type { Point } from '@svg-editor/core';
import type { BoundingBox } from '@svg-editor/core';
import { serializeSvg } from '@svg-editor/core';

export class SvgDomRenderer implements IRenderer {
  private container: HTMLElement | null = null;
  private wrapper: HTMLDivElement | null = null;
  private contentLayer: SVGSVGElement | null = null;
  private overlayLayer: SVGSVGElement | null = null;

  mount(container: HTMLElement): void {
    this.container = container;

    this.wrapper = document.createElement('div');
    this.wrapper.style.cssText = 'position:relative;width:100%;height:100%;overflow:hidden;';

    this.contentLayer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.contentLayer.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;';
    this.contentLayer.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    this.overlayLayer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.overlayLayer.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;';
    this.overlayLayer.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    this.wrapper.appendChild(this.contentLayer);
    this.wrapper.appendChild(this.overlayLayer);
    container.appendChild(this.wrapper);
  }

  unmount(): void {
    this.wrapper?.remove();
    this.wrapper = null;
    this.contentLayer = null;
    this.overlayLayer = null;
    this.container = null;
  }

  render(state: EditorState): void {
    if (!this.contentLayer || !this.overlayLayer || !this.wrapper) return;

    const { document: doc, viewTransform } = state;
    const [a, b, c, d, e, f] = viewTransform.matrix;
    this.wrapper.style.transform = `matrix(${a},${b},${c},${d},${e},${f})`;

    // Render content: parse generated SVG and inject into content layer
    const svgString = serializeSvg(doc);
    const parser = new DOMParser();
    const parsed = parser.parseFromString(svgString, 'image/svg+xml');
    const svgEl = parsed.documentElement;

    // Replace content layer children with parsed SVG children
    while (this.contentLayer.firstChild) {
      this.contentLayer.firstChild.remove();
    }
    // Copy viewBox and dimensions
    const vb = svgEl.getAttribute('viewBox');
    if (vb) this.contentLayer.setAttribute('viewBox', vb);
    const w = svgEl.getAttribute('width');
    const h = svgEl.getAttribute('height');
    if (w) this.contentLayer.setAttribute('width', w);
    if (h) this.contentLayer.setAttribute('height', h);

    for (const child of [...svgEl.children]) {
      this.contentLayer.appendChild(document.importNode(child, true));
    }

    // Render selection overlay
    this.renderOverlay(state);
  }

  hitTest(point: Point, state: EditorState): NodeId | null {
    if (!this.contentLayer) return null;

    const svgPoint = this.contentLayer.createSVGPoint();
    svgPoint.x = point.x;
    svgPoint.y = point.y;

    // Walk in reverse z-order to get topmost element
    const children = [...this.contentLayer.children];
    for (let i = children.length - 1; i >= 0; i--) {
      const el = children[i];
      if (!el || !(el instanceof SVGGraphicsElement)) continue;
      if (el.tagName === 'defs') continue;
      const id = el.getAttribute('data-id') ?? el.getAttribute('id');
      if (!id) continue;
      if ((el as SVGGeometryElement).isPointInFill?.(svgPoint) || (el as SVGGeometryElement).isPointInStroke?.(svgPoint)) {
        return id as NodeId;
      }
    }
    return null;
  }

  hitTestMarquee(box: BoundingBox, state: EditorState): NodeId[] {
    if (!this.contentLayer) return [];
    const { x, y, width, height } = box;
    const result: NodeId[] = [];

    for (const el of this.contentLayer.children) {
      if (!(el instanceof SVGGraphicsElement) || el.tagName === 'defs') continue;
      const id = el.getAttribute('data-id') ?? el.getAttribute('id');
      if (!id) continue;
      const bbox = el.getBBox();
      if (
        bbox.x >= x && bbox.y >= y &&
        bbox.x + bbox.width <= x + width &&
        bbox.y + bbox.height <= y + height
      ) {
        result.push(id as NodeId);
      }
    }
    return result;
  }

  private renderOverlay(state: EditorState): void {
    if (!this.overlayLayer) return;
    while (this.overlayLayer.firstChild) {
      this.overlayLayer.firstChild.remove();
    }

    if (state.selection.ids.size === 0) return;
    if (!this.contentLayer) return;

    // Draw selection bounding box and resize handles for each selected node
    for (const id of state.selection.ids) {
      const el = this.contentLayer.querySelector(`[data-id="${id}"], [id="${id}"]`);
      if (!(el instanceof SVGGraphicsElement)) continue;

      try {
        const bbox = el.getBBox();
        // Draw dashed selection rect
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', String(bbox.x - 1));
        rect.setAttribute('y', String(bbox.y - 1));
        rect.setAttribute('width', String(bbox.width + 2));
        rect.setAttribute('height', String(bbox.height + 2));
        rect.setAttribute('fill', 'none');
        rect.setAttribute('stroke', '#0066FF');
        rect.setAttribute('stroke-width', '1');
        rect.setAttribute('stroke-dasharray', '4 2');
        this.overlayLayer.appendChild(rect);

        // Draw 8 resize handles
        const handles = [
          [bbox.x - 1, bbox.y - 1],
          [bbox.x + bbox.width / 2, bbox.y - 1],
          [bbox.x + bbox.width + 1, bbox.y - 1],
          [bbox.x - 1, bbox.y + bbox.height / 2],
          [bbox.x + bbox.width + 1, bbox.y + bbox.height / 2],
          [bbox.x - 1, bbox.y + bbox.height + 1],
          [bbox.x + bbox.width / 2, bbox.y + bbox.height + 1],
          [bbox.x + bbox.width + 1, bbox.y + bbox.height + 1],
        ];
        for (const [hx, hy] of handles) {
          if (hx === undefined || hy === undefined) continue;
          const handle = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          handle.setAttribute('x', String(hx - 3));
          handle.setAttribute('y', String(hy - 3));
          handle.setAttribute('width', '6');
          handle.setAttribute('height', '6');
          handle.setAttribute('fill', 'white');
          handle.setAttribute('stroke', '#0066FF');
          handle.setAttribute('stroke-width', '1');
          this.overlayLayer.appendChild(handle);
        }
      } catch {
        // getBBox can throw if element is not rendered
      }
    }
  }
}
