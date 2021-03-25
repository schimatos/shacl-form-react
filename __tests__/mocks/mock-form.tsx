import React from 'react';
import type { AnyResource } from 'rdf-object-proxy';
import ReactLazyRender from '@jeswr/react-lazy-render';
// import { JsonLdParser } from 'jsonld-streaming-parser';
import type { Quad } from 'rdf-js';
import { RdfObjectProxy } from 'rdf-object-proxy';
import { RdfObjectLoader } from 'rdf-object';
import { Parser } from 'n3';
import type { sh } from '../../lib/types';
import { Form } from '../../lib';
import { Input } from './mock-input';
import PersonShape from '../data/person-shape';

export function MockForm({ shape }: { shape: AnyResource }) {
  return <Form
    shape={shape as sh.NodeShape}
    onChange={() => {}}
    Input={Input}
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
    const loader = new RdfObjectLoader();
    const parser = new Parser();
    await loader.importArray(parser.parse(PersonShape));
    const shape: any = RdfObjectProxy(loader.resources[
      'http://datashapes.org/sh/tests/core/complex/personexample.test#PersonShape'
    ]);
    return <MockForm shape={shape} />;
  },
);
