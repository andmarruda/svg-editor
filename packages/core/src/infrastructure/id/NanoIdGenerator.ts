import { nanoid } from 'nanoid';
import type { IIdGenerator } from '../../application/ports/driven/IIdGenerator';

export class NanoIdGenerator implements IIdGenerator {
  generate(): string {
    return nanoid();
  }
}
