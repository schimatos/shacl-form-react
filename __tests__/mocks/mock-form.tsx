import React from 'react';
import type { AnyResource } from 'rdf-object-proxy';
import ReactLazyRender from '@jeswr/react-lazy-render';
// import { JsonLdParser } from 'jsonld-streaming-parser';
// import type { Quad } from 'rdf-js';
import { RdfObjectProxy } from 'rdf-object-proxy';
import { RdfObjectLoader } from 'rdf-object';
// eslint-disable import/no-extraneous-dependencies
import { Parser } from 'n3';
import LDfieldInput from '@ldfields/default-react';
// @ts-ignore
import { PathFactory } from 'ldflex';
// @ts-ignore
import ComunicaEngine from '@ldflex/comunica';
import { namedNode } from '@rdfjs/data-model';
import type { sh } from '../../lib/types';
import { Form } from '../../lib';
import { Input } from './mock-input';
import PersonShape from '../data/person-shape';
// @ts-ignore
// @ts-ignore

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

// export function stream() {
//   const parserJsonld = new JsonLdParser();
//   parserJsonld.pause();
//   parserJsonld.write(JSON.stringify(PersonShape));
//   parserJsonld.end();
//   return parserJsonld;
// }

// export function array(): Promise<Quad[]> {
//   return new Promise((resolve, reject) => {
//     const arr: Quad[] = [];
//     const quadStream = stream();
//     quadStream.on('data', (data) => {
//       arr.push(data);
//     });
//     quadStream.on('end', () => {
//       resolve(arr);
//     });
//     quadStream.on('err', (e) => {
//       reject(e);
//     });
//     quadStream.resume();
//   });
// }

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
