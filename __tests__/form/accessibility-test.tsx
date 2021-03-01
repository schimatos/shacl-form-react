import React from 'react';
import { render } from '@testing-library/react';
import { ProxiedNodeShapes } from 'shacl-test-as-object';
import { axe, toHaveNoViolations } from 'jest-axe';
import { MockForm } from '../mocks';

expect.extend(toHaveNoViolations);

describe('Testing the accesibility of generated forms', () => {
  it('Should have no violations when rendering any form', async () => {
    const NodeShapes = await ProxiedNodeShapes;
    for (const shape of NodeShapes) {
      console.log(`${shape}`);
      const { container } = render(<MockForm shape={shape} />);
      /* eslint-disable no-await-in-loop */
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    }
  });
});
