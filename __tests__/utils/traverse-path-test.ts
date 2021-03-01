import { ProxiedNodeShapes } from 'shacl-test-as-object';
import { pathToSparql } from '../../lib/utils';

describe('Testing that all paths in the SHACL', () => {
  it('Should transform all paths in test suite without error', async () => {
    const NodeShapes = await ProxiedNodeShapes;
    for (const shape of NodeShapes) {
      for (const { path } of shape.sh$property) {
        expect(() => pathToSparql(path)).not.toThrowError();
      }
    }
    expect.hasAssertions();
  });
});
