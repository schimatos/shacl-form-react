import {
  InferencedProxiedNodeShapes,
} from 'shacl-test-as-object';
import * as utils from '../../../lib/utils';
import type { sh } from '../../../lib/types';
import 'jest-extended';
import { unsupportedShapes } from '../../data';
import { getFields } from '../../../lib/utils';

describe('Testing with the SHACL test suite', () => {
  it('Should *run* on every shape in the shacl test suite', async () => {
    const shapes = await InferencedProxiedNodeShapes;
    for (const shape of shapes) {
      if (!unsupportedShapes.includes(`${shape}`)) {
        // console.log(`${shape}`);
        expect(() => getFields(shape as sh.NodeShape).map(utils.getOrder)).not.toThrowError();
        expect(() => utils.getOrderNode(shape as sh.NodeShape)).not.toThrowError();
      }
    }
    expect.hasAssertions();
  }, 30000);
});

describe('Errors in invalid fields/shapes', () => {
  it('Should throw error in invalid field input into getOrder', async () => {
    expect(() => utils.getOrder({} as any)).toThrowError();
  });
});
