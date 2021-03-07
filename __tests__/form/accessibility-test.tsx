import React from 'react';
import { render } from '@testing-library/react';
import { InferencedProxiedNodeShapes } from 'shacl-test-as-object';
import { axe, toHaveNoViolations } from 'jest-axe';
import { MockForm, MockFormLDfields } from '../mocks';
import { unsupportedShapes } from '../data';

expect.extend(toHaveNoViolations);

describe('Testing the accesibility of generated forms', () => {
  it('Should have no violations when rendering any form', async () => {
    const NodeShapes = await InferencedProxiedNodeShapes;
    for (const shape of NodeShapes) {
      if (!unsupportedShapes.includes(`${shape}`)) {
        // console.log(`${shape}`);
        const { container } = render(<MockForm shape={shape} />);
        /* eslint-disable no-await-in-loop */
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    }
  }, 30000);
});

describe('Testing the accesibility of generated with LDfields plugin', () => {
  it('Should have no violations when rendering any form', async () => {
    const NodeShapes = await InferencedProxiedNodeShapes;
    for (const shape of NodeShapes) {
      if (!unsupportedShapes.includes(`${shape}`)) {
        // console.log(`${shape}`);
        const { container } = render(<MockFormLDfields shape={shape} />);
        /* eslint-disable no-await-in-loop */
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    }
  }, 30000);
});
