import type { Document } from '../../../domain/aggregates/Document';
import type { ShapePreset } from '../../../domain/services/ShapeFactory';
import type { BoundingBox } from '../../../domain/value-objects/BoundingBox';
import type { NodeId } from '../../../domain/value-objects/NodeId';
import type { HistoryManager } from '../../history/HistoryManager';
import type { IIdGenerator } from '../../ports/driven/IIdGenerator';
import { ShapeFactory } from '../../../domain/services/ShapeFactory';
import { AddPathUseCase } from './AddPathUseCase';
import { AddPolygonUseCase } from './AddPolygonUseCase';

export class AddShapePresetUseCase {
  private readonly addPolygon: AddPolygonUseCase;
  private readonly addPath: AddPathUseCase;

  constructor(history: HistoryManager, idGenerator: IIdGenerator) {
    this.addPolygon = new AddPolygonUseCase(history, idGenerator);
    this.addPath = new AddPathUseCase(history, idGenerator);
  }

  execute(doc: Document, preset: ShapePreset, bounds: BoundingBox): { doc: Document; id: NodeId } {
    const geometry = ShapeFactory.create(preset, bounds);
    const name = presetToName(preset);
    if (geometry.kind === 'polygon') return this.addPolygon.execute(doc, geometry.points, name);
    return this.addPath.execute(doc, geometry.commands, name);
  }
}

function presetToName(preset: ShapePreset): string {
  return preset
    .split('-')
    .map((part) => `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`)
    .join(' ');
}
