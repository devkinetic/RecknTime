import { h, Fragment } from 'preact';
import htm from 'htm';
import { getWeekStart, getWeekDates, formatDate, isSameDay, parseDateLocal } from '../utils.js';

const html = htm.bind(h);

export default function WeekNavigator({ selected, onChange }) {
  const selectedDate = parseDateLocal(selected);
  const weekStart = getWeekStart(selectedDate);
  const currentWeekStart = getWeekStart(new Date());

  const weekDates = getWeekDates(weekStart);
  const start = parseDateLocal(weekDates[0]);
  const end = parseDateLocal(weekDates[6]);

  const isCurrentWeek = isSameDay(weekStart, currentWeekStart);

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const formatRange = () => {
    const opts = { month: 'short', day: 'numeric' };
    return `${start.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(undefined, opts)}`;
  };

  const goBack = () => {
    const prev = new Date(weekStart);
    prev.setDate(prev.getDate() - 7);
    onChange(formatDate(prev));
  };

  const goForward = () => {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + 7);
    onChange(formatDate(next));
  };

  return html`
    <${Fragment}>
      <div class="fw-bold">
        ${isCurrentWeek ? html`<span class="pe-2">This week:</span>` : ''}
        ${formatRange()}
      </div>
      <div class="btn-group" role="group" aria-label="Basic example">
        <button
          type="button"
          class="btn btn-light"
          onClick=${goBack}
          data-bs-toggle="tooltip"
          data-bs-placement="bottom"
          data-bs-title="Previous week"
          data-bs-delay='{"show":1000,"hide":100}'
        >
          <i class="bi bi-chevron-left"></i>
        </button>
        <button
          type="button"
          class="btn btn-light"
          onClick=${goForward}
          data-bs-toggle="tooltip"
          data-bs-placement="bottom"
          data-bs-title="Next week"
          data-bs-delay='{"show":1000,"hide":100}'
        >
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>
    <//>
  `;
}