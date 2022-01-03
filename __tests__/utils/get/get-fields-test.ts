import {
  InferencedProxiedNodeShapes,
  InferencedProxiedNodeShapesMapPromise,
  InferencedNodeShapesMapPromise,
} from 'shacl-test-as-object';
import { RdfObjectProxy } from 'rdf-object-proxy';
import * as utils from '../../../lib/utils';
import type { sh, FieldType } from '../../../lib/types';
import 'jest-extended';
import { unsupportedShapes } from '../../data';

const PersonShape = 'http://datashapes.org/sh/tests/core/complex/personexample.test#PersonShape';

describe('Testing with the SHACL test suite', () => {
  it('Should *run* on every shape in the shacl test suite', async () => {
    const shapes = await InferencedProxiedNodeShapes;
    for (const shape of shapes) {
      if (!unsupportedShapes.includes(`${shape}`)) {
        // console.log(`${shape}`);
        expect(() => utils.getFields(shape as sh.NodeShape)).not.toThrowError();
      }
    }
    expect.hasAssertions();
  }, 30000);
  it('Should correctly extract fields for PersonShape', async () => {
    const ProxiedNodeShapesMap = await InferencedProxiedNodeShapesMapPromise;
    const NodeShapesMap = await InferencedNodeShapesMapPromise;
    const shape = ProxiedNodeShapesMap[PersonShape] as sh.NodeShape;
    const fields = utils.getFields(shape);
    expect(fields).toBeInstanceOf(Array);
    expect(fields).toHaveLength(3);

    const values = NodeShapesMap[PersonShape].properties['http://www.w3.org/ns/shacl#property'];
    expect(values).toHaveLength(3);

    const result: FieldType[] = [
      {
        type: 'property',
        parent: shape,
        value: RdfObjectProxy(values[0]) as sh.PropertyShape,
      },
      {
        type: 'property',
        parent: shape,
        value: RdfObjectProxy(values[1]) as sh.PropertyShape,
      },
      {
        type: 'property',
        parent: shape,
        value: RdfObjectProxy(values[2]) as sh.PropertyShape,
      },
    ];

    function clean(fields: FieldType[]) {
      return fields.map(
        (field) => ({ ...field, value: field.value.toString(), parent: field.value.toString() }),
      );
    }

    expect(clean(fields)).toEqual(clean(result));

    for (const field of fields) {
      expect(field.parent.toString()).not.toEqual(field.value.toString());
    }
  });
});
