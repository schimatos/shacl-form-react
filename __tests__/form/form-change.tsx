import React from 'react';
import renderer from 'react-test-renderer';
import { ProxiedNodeShapesMapPromise, InferencedProxiedNodeShapes } from 'shacl-test-as-object';
import { unsupportedShapes } from '../data';
import { MockForm } from '../mocks';

const PersonShape = 'http://datashapes.org/sh/tests/core/complex/personexample.test#PersonShape';

// describe('Testing consistency rendering of forms', () => {
//   it('Correctly renders a basic form', async () => {
//     const tree = renderer.create(
//       <MockForm
//         shape={(await ProxiedNodeShapesMapPromise)[PersonShape]}
//       />,
//     ).toJSON();
//     expect(tree).toMatchSnapshot();
//   });
//   it('Correctly renders all supported forms in the test suite', async () => {
//     for (const shape of await InferencedProxiedNodeShapes) {
//       if (!unsupportedShapes.includes(`${shape}`)) {
//         const tree = renderer.create(
//           <MockForm
//             shape={shape}
//           />,
//         ).toJSON();
//         expect(tree).toMatchSnapshot();
//       }
//     }
//   }, 30000);
// });
