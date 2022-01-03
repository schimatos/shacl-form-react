import ReactLazyRender from '@jeswr/react-lazy-render';
import LDfieldInput from '@ldfields/default-react';
// @ts-ignore
import ComunicaEngine from '@ldflex/comunica';
import { namedNode } from '@rdfjs/data-model';
// @ts-ignore
import { PathFactory } from 'ldflex';
import { Parser } from 'n3';
import { RdfObjectLoader } from 'rdf-object';
import type { AnyResource } from 'rdf-object-proxy';
import { RdfObjectProxy } from 'rdf-object-proxy';
import React from 'react';
import { Form } from '../../lib';
import type { sh } from '../../lib/types';
import PersonShape from '../data/person-shape';
import { Input } from './mock-input';

export function MockForm({ shape }: { shape: AnyResource }) {
  return <Form
    shape={shape as sh.NodeShape}
    onChange={() => {}}
    Input={Input}
  />;
}

export function MockFormLDfield({
  shape,
  data,
  pathFactory,
}: {
  shape: AnyResource,
  data?: any,
  pathFactory: any
}) {
  return <Form
    shape={shape as sh.NodeShape}
    data={data}
    pathFactory={pathFactory}
    onChange={(e) => {
      console.log('on change triggered', e);
    }}
    Input={LDfieldInput}
  />;
}

export const MockFormLazy = ReactLazyRender(
  async () => {
    const loader = new RdfObjectLoader({
      context: {
        '@context': {
          '@vocab': 'http://www.w3.org/ns/shacl#',
          sh$property: 'http://www.w3.org/ns/shacl#property',
        },
      },
    });
    const parser = new Parser();
    const quads = parser.parse(PersonShape);
    await loader.importArray(quads);
    const shape: any = RdfObjectProxy(loader.resources[
      'http://datashapes.org/sh/tests/core/complex/personexample.test#PersonShape'
    ]);
    return <MockForm shape={shape} />;
  },
);

// The JSON-LD context for resolving properties
const context = {
  '@context': {
    '@vocab': 'http://xmlns.com/foaf/0.1/',
    friends: 'knows',
    label: 'http://www.w3.org/2000/01/rdf-schema#label',
  },
};
// The query engine and its source
const queryEngine = new ComunicaEngine('https://ruben.verborgh.org/profile/');
// The object that can create new paths
const pathy = new PathFactory({ context, queryEngine });

export const MockFormLazyLdfield = ReactLazyRender(
  async () => {
    const loader = new RdfObjectLoader({
      context: {
        '@context': {
          '@vocab': 'http://www.w3.org/ns/shacl#',
          sh$property: 'http://www.w3.org/ns/shacl#property',
        },
      },
    });
    const parser = new Parser();
    const quads = parser.parse(PersonShape);
    await loader.importArray(quads);
    const shape: any = RdfObjectProxy(loader.resources[
      'http://datashapes.org/sh/tests/core/complex/personexample.test#PersonShape'
    ]);
    return <MockFormLDfield
        shape={shape}
        pathFactory={pathy}
        data={pathy.create({ subject: namedNode('https://ruben.verborgh.org/profile/#me') })}
      />;
  },
);
