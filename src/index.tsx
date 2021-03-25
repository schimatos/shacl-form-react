import React from 'react';
import ReactDOM from 'react-dom';
import { MockFormLazy } from '../__tests__/mocks';

ReactDOM.render(
  <div id="app">
    <MockFormLazy />
  </div>,
  document.getElementById('app'),
);
