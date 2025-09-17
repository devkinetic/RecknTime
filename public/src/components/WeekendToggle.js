import { h, Fragment } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import tooltipToggle from '../hooks/tooltipToggle.js';
import htm from 'htm';

const html = htm.bind(h);

export default function WeekendToggle({ hideWeekends, setHideWeekends }) {
  const labelRef = useRef(null);
  
  tooltipToggle(labelRef, hideWeekends ? 'Show weekends' : 'Hide weekends');
  
  return html`
    <${Fragment}>
      <input
        type="checkbox"
        class="btn-check"
        id="toggleWeekends"
        autocomplete="off"
        checked=${hideWeekends}
        onChange=${e => setHideWeekends(e.target.checked)}
      />
      <label
        ref=${labelRef}
        class="btn btn-light"
        for="toggleWeekends"
        data-bs-toggle="tooltip"
        data-bs-placement="bottom"
        data-bs-delay='{"show":1000,"hide":100}'
      >
        <i class=${hideWeekends ? 'bi bi-calendar-week-fill' : 'bi bi-calendar-week'}></i>
      </label>
    <//>
  `;
}
