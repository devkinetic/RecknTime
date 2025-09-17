import { useEffect } from 'preact/hooks';

export default function tooltipToggle(ref, title) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    
    el.setAttribute('data-bs-title', title);

    const tooltip = bootstrap.Tooltip.getInstance(el) || new bootstrap.Tooltip(el);

    tooltip._config.title = title;

    if (tooltip.tip && tooltip.tip.querySelector('.tooltip-inner')) {
      tooltip.tip.querySelector('.tooltip-inner').textContent = title;
    }
  }, [ref, title]);
}