import React from 'react';
import Input from '@ldfields/default-react';
import type { AnyResource } from 'rdf-object-proxy';
import type { sh } from '../../lib/types';
import { Form } from '../../lib';

export function MockForm({ shape }: { shape: AnyResource }) {
  return <Form
    shape={shape as sh.NodeShape}
    onChange={() => {}}
    Input={Input}
  />;
}
