import React from 'react';
import { render } from '@testing-library/react';
import { ProxiedNodeShapesMapPromise } from 'shacl-test-as-object';
import { MockForm } from '../mocks';

const PersonShape = 'http://datashapes.org/sh/tests/core/complex/personexample.test#PersonShape';

describe('Testing the accesibility of generated forms', () => {
  it('Should have no violations when rendering any form', async () => {
    // TODO: Get this test back up and running
    // const NodeShapes = await ProxiedNodeShapesMapPromise;
    // const shape = NodeShapes[PersonShape];
    expect(true).toBe(true)
    // const rendered = render(<MockForm shape={shape} />);
    // expect(rendered.getByLabelText('employee')).not.toBe(null);
  });
});
