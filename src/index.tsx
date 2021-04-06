import React from 'react';
import ReactDOM from 'react-dom';
import '../lib/styles.css'
import { MockFormLazy, MockFormLazyLdfield } from '../__tests__/mocks';

ReactDOM.render(
  <div id="app">
    {/* <MockFormLazy />
    <br />
    <br /> */}
    <MockFormLazyLdfield />
  </div>,
  document.getElementById('app'),
);
