import React from 'react';
import renderer from 'react-test-renderer';
import { ProxiedNodeShapesMapPromise } from 'shacl-test-as-object';
import {} from '@testing-library/dom';
import {} from '@testing-library/react';
import { MockForm } from '../mocks';

const PersonShape = 'http://datashapes.org/sh/tests/core/complex/personexample.test#PersonShape';

describe('Testing consistency rendering of forms', () => {
  it('Correctly renders a basic form', async () => {
    const tree = renderer.create(
      <MockForm
        shape={(await ProxiedNodeShapesMapPromise)[PersonShape]}
      />,
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
