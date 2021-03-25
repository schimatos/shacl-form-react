import type { AnyResource } from 'rdf-object-proxy/dist';

function writeListPath(path: AnyResource, joiner: string = '/', settings?: { fragment?: boolean }) {
  // @ts-ignore
  const mapped = path.list.map(x => pathToSparql(x, settings));
  if (mapped.length === 0) {
    throw new Error('Invalid path');
  } else if (mapped.length === 1) {
    return mapped[0];
  } else {
    return `(${mapped.join(joiner)})`;
  }
}

export function pathToSparql(path: AnyResource, settings?: { fragment?: boolean }): string {
  if (path.type === 'NamedNode') {
    // TODO - Switch to use of .fragment method
    // TODO - see if angle brackets need to be added
    return settings?.fragment ? `${/[^#/]+$/.exec(path.value)}` : `<${path.value}>`;
  }
  if (path.type !== 'BlankNode') {
    throw new Error('Path should be named node or blank node');
  }
  for (const p of path.alternativePath) {
    return writeListPath(p, '|', settings);
  }
  for (const p of path.zeroOrMorePath) {
    return `${pathToSparql(p, settings)}*`;
  }
  for (const p of path.oneOrMorePath) {
    return `${pathToSparql(p, settings)}+`;
  }
  for (const p of path.zeroOrOnePath) {
    return `${pathToSparql(p, settings)}?`;
  }
  for (const p of path.inversePath) {
    return `^${pathToSparql(p, settings)}`;
  }
  // This is a sequence path
  if (path.list) {
    return writeListPath(path, '/', settings);
  }
  throw new Error('Invalid path');
}
