import { h, render } from 'preact';
import htm from 'htm';
import App from '../src/App.js';

const html = htm.bind(h);
render(html`<${App} />`, document.getElementById('app-root'));