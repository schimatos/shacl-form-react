import React from 'react';
import type { AnyResource } from 'rdf-object-proxy';
import ReactLazyRender from '@jeswr/react-lazy-render';
import { ProxiedNodeShapesMapPromise } from 'shacl-test-as-object';
import type { sh } from '../../lib/types';
import { Form } from '../../lib';
import { Input } from './mock-input';

export function MockForm({ shape }: { shape: AnyResource }) {
  return <Form
    shape={shape as sh.NodeShape}
    onChange={() => {}}
    Input={Input}
  />;
}

export const MockFormLazy = ReactLazyRender(
  async () => {
    const shape = (await ProxiedNodeShapesMapPromise)[
      'http://datashapes.org/sh/tests/core/complex/personexample.test#PersonShape'
    ];
    return <MockForm shape={shape} />;
  },
);
