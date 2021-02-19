import type { AnyResource } from 'rdf-object-proxy/dist';

function writeListPath(path: AnyResource, joiner: string = '/') {
  // @ts-ignore
  const mapped = path.list.map(pathToSparql);
  if (mapped.length === 0) {
    throw new Error('Invalid path');
  } else if (mapped.length === 1) {
    return mapped[0];
  } else {
    return `(${mapped.join(joiner)})`;
  }
}

export function pathToSparql(path: AnyResource): string {
  if (path.type === 'NamedNode') {
    return `<${path}>`;
  }
  if (path.type !== 'BlankNode') {
    throw new Error('Path should be named node or blank node');
  }
  for (const p of path.alternativePath) {
    return writeListPath(p, '|');
  }
  for (const p of path.zeroOrMorePath) {
    return `${pathToSparql(p)}*`;
  }
  for (const p of path.oneOrMorePath) {
    return `${pathToSparql(p)}+`;
  }
  for (const p of path.zeroOrOnePath) {
    return `${pathToSparql(p)}?`;
  }
  for (const p of path.inversePath) {
    return `^${pathToSparql(p)}`;
  }
  // This is a sequence path
  if (path.list) {
    return writeListPath(path, '/');
  }
  throw new Error('Invalid path');
}
