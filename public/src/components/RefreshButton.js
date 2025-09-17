import { h } from 'preact';
import htm from 'htm';

const html = htm.bind(h);

export default function RefreshButton({ week, setRefreshTrigger, loading }) {
  const handleClick = () => {
    localStorage.removeItem(`results_${week}`);
    setRefreshTrigger(prev => prev + 1);
  };

  return html`
    <button
      type="button"
      class="btn btn-light"
      onClick=${handleClick}
      disabled=${loading}
      data-bs-toggle="tooltip"
      data-bs-placement="bottom"
      data-bs-title="Refresh data"
      data-bs-delay='{"show":1000,"hide":100}'
    >
      <i class="bi bi-arrow-clockwise"></i>
    </button>
  `;
}