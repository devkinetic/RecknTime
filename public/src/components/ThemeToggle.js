import { h, Fragment } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import tooltipToggle from '../hooks/tooltipToggle.js';
import htm from 'htm';

const html = htm.bind(h);

export default function ThemeToggle({ theme, setTheme }) {
  const isDark = theme === 'dark';
  const labelRef = useRef(null);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };
  
  tooltipToggle(labelRef, isDark ? 'Switch to light mode' : 'Switch to dark mode');
  
  return html`
    <${Fragment}>
      <input
        type="checkbox"
        class="btn-check"
        id="toggleTheme"
        autocomplete="off"
        checked=${isDark}
        onChange=${toggleTheme}
      />
      <label
        ref=${labelRef}
        class="btn btn-light"
        for="toggleTheme"
        data-bs-toggle="tooltip"
        data-bs-placement="bottom"
        data-bs-delay='{"show":1000,"hide":100}'
      >
        <i class=${isDark ? 'bi bi-sun' : 'bi bi-moon'}></i>
      </label>
    <//>
  `;
}


