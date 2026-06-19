import type { PathCommand } from '../../domain/entities/PathCommand';
import { Point } from '../../domain/value-objects/Point';

export function parsePath(d: string): PathCommand[] {
  const commands: PathCommand[] = [];
  const tokens = tokenize(d);
  let i = 0;
  let lastType = '';

  while (i < tokens.length) {
    const token = tokens[i];
    if (token === undefined) break;

    if (isCommandLetter(token)) {
      lastType = token;
      i++;
    } else if (lastType === '') {
      break;
    }

    const cmd = lastType.toUpperCase();

    switch (cmd) {
      case 'M':
      case 'L':
      case 'T': {
        const nums = readNumbers(tokens, i, 2);
        i = nums.nextIndex;
        commands.push({ type: cmd as 'M' | 'L' | 'T', point: Point.of(nums.values[0] ?? 0, nums.values[1] ?? 0) });
        if (cmd === 'M') lastType = lastType === 'M' ? 'L' : 'l';
        break;
      }
      case 'H': {
        const nums = readNumbers(tokens, i, 1);
        i = nums.nextIndex;
        commands.push({ type: 'H', x: nums.values[0] ?? 0 });
        break;
      }
      case 'V': {
        const nums = readNumbers(tokens, i, 1);
        i = nums.nextIndex;
        commands.push({ type: 'V', y: nums.values[0] ?? 0 });
        break;
      }
      case 'C': {
        const nums = readNumbers(tokens, i, 6);
        i = nums.nextIndex;
        const [x1, y1, x2, y2, x, y] = nums.values;
        commands.push({
          type: 'C',
          cp1: Point.of(x1 ?? 0, y1 ?? 0),
          cp2: Point.of(x2 ?? 0, y2 ?? 0),
          point: Point.of(x ?? 0, y ?? 0),
        });
        break;
      }
      case 'S': {
        const nums = readNumbers(tokens, i, 4);
        i = nums.nextIndex;
        const [x2, y2, x, y] = nums.values;
        commands.push({ type: 'S', cp2: Point.of(x2 ?? 0, y2 ?? 0), point: Point.of(x ?? 0, y ?? 0) });
        break;
      }
      case 'Q': {
        const nums = readNumbers(tokens, i, 4);
        i = nums.nextIndex;
        const [x1, y1, x, y] = nums.values;
        commands.push({ type: 'Q', cp: Point.of(x1 ?? 0, y1 ?? 0), point: Point.of(x ?? 0, y ?? 0) });
        break;
      }
      case 'A': {
        const nums = readNumbers(tokens, i, 7);
        i = nums.nextIndex;
        const [rx, ry, xRot, la, sw, x, y] = nums.values;
        commands.push({
          type: 'A',
          rx: rx ?? 0,
          ry: ry ?? 0,
          xRotation: xRot ?? 0,
          largeArc: (la ?? 0) !== 0,
          sweep: (sw ?? 0) !== 0,
          point: Point.of(x ?? 0, y ?? 0),
        });
        break;
      }
      case 'Z': {
        commands.push({ type: 'Z' });
        lastType = '';
        break;
      }
      default:
        i++;
    }
  }

  return commands;
}

export function serializePath(commands: readonly PathCommand[]): string {
  return commands
    .map((cmd) => {
      switch (cmd.type) {
        case 'M': return `M${fmt(cmd.point.x)},${fmt(cmd.point.y)}`;
        case 'L': return `L${fmt(cmd.point.x)},${fmt(cmd.point.y)}`;
        case 'H': return `H${fmt(cmd.x)}`;
        case 'V': return `V${fmt(cmd.y)}`;
        case 'C': return `C${fmt(cmd.cp1.x)},${fmt(cmd.cp1.y)} ${fmt(cmd.cp2.x)},${fmt(cmd.cp2.y)} ${fmt(cmd.point.x)},${fmt(cmd.point.y)}`;
        case 'S': return `S${fmt(cmd.cp2.x)},${fmt(cmd.cp2.y)} ${fmt(cmd.point.x)},${fmt(cmd.point.y)}`;
        case 'Q': return `Q${fmt(cmd.cp.x)},${fmt(cmd.cp.y)} ${fmt(cmd.point.x)},${fmt(cmd.point.y)}`;
        case 'T': return `T${fmt(cmd.point.x)},${fmt(cmd.point.y)}`;
        case 'A': return `A${fmt(cmd.rx)},${fmt(cmd.ry)} ${fmt(cmd.xRotation)} ${cmd.largeArc ? 1 : 0},${cmd.sweep ? 1 : 0} ${fmt(cmd.point.x)},${fmt(cmd.point.y)}`;
        case 'Z': return 'Z';
      }
    })
    .join(' ');
}

function fmt(n: number): string {
  return parseFloat(n.toFixed(4)).toString();
}

function isCommandLetter(s: string): boolean {
  return /^[MmLlHhVvCcSsQqTtAaZz]$/.test(s);
}

function tokenize(d: string): string[] {
  return d.match(/[MmLlHhVvCcSsQqTtAaZz]|[-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?/g) ?? [];
}

function readNumbers(tokens: string[], startIndex: number, count: number): { values: number[]; nextIndex: number } {
  const values: number[] = [];
  let i = startIndex;
  while (values.length < count && i < tokens.length) {
    const t = tokens[i];
    if (t === undefined || isCommandLetter(t)) break;
    values.push(parseFloat(t));
    i++;
  }
  while (values.length < count) values.push(0);
  return { values, nextIndex: i };
}
