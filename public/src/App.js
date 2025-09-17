import { h, Fragment } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import htm from 'htm';
import WeekNavigator from './components/WeekNavigator.js';
import RefreshButton from './components/RefreshButton.js';
import ThemeToggle from './components/ThemeToggle.js';
import WeekendToggle from './components/WeekendToggle.js';
import { ReconciliationTable, PlaceholderReconciliationTable } from './components/ReconciliationTable.js';
import { parseDateLocal, getWeekStart, getWeekDates, formatDate, buildReconciliationModel, isWeekendColumn } from './utils.js';
import { normalizeHarvestEntries, normalizeJiraWorklogs } from './integrations.js'

const html = htm.bind(h);

export default function App() {
  const [week, setWeek] = useState(() => {
    const url = new URLSearchParams(location.search);
    const param = url.get('week');
    const parsedDate = param ? parseDateLocal(param) : new Date();
    const monday = getWeekStart(parsedDate);
    return formatDate(monday);
  });

  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [hideWeekends, setHideWeekends] = useState(() => {
    return localStorage.getItem('hideWeekends') === 'true';
  });
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('week', week);
    window.history.replaceState({}, '', newUrl);
  }, [week]);

  useEffect(() => {
    localStorage.setItem('hideWeekends', hideWeekends.toString());
  }, [hideWeekends]);

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  useEffect(() => {
    const tooltipTriggerList = [...document.querySelectorAll('[data-bs-toggle="tooltip"]')];
    tooltipTriggerList.forEach(el => new bootstrap.Tooltip(el));
  }, []);

  useEffect(() => {
    if (!week) return;

    const cached = localStorage.getItem(`results_${week}`);
    if (cached) {
      try {
        setModel(JSON.parse(cached));
        return;
      } catch {
        localStorage.removeItem(`results_${week}`);
      }
    }

    const load = async () => {
      setLoading(true);
      const fromDate = week;
      const toDate = formatDate(new Date(new Date(week).getTime() + 6 * 86400000));
      const weekDates = getWeekDates(parseDateLocal(week));
      try {
        const res = await fetch(`/api/entries?fromDate=${fromDate}&toDate=${toDate}`);
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        const entries = [
          ...normalizeHarvestEntries(data.harvest),
          ...normalizeJiraWorklogs(data.jira)
        ];
        const model = buildReconciliationModel(entries, weekDates);
        localStorage.setItem(`results_${week}`, JSON.stringify(model));
        setModel(model);
      } catch (err) {
        console.error("Error loading data:", err);
        alert("Failed to load reconciliation data.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [week, refreshTrigger]);

  return html`
    <${Fragment}>
      <header class="app-header text-bg-primary p-3 mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div class="d-flex align-items-center gap-2">
          <img src="/icon.svg" alt="Reck’n Time" style="height: 50px;" />
          <h1 class="h4 mb-0">Reck’n Time</h1>
        </div>
        <div class="d-flex flex-wrap align-items-center gap-3 mb-0">
          <${WeekNavigator}
            selected=${week}
            onChange=${setWeek}
          />
          <${RefreshButton}
            week=${week}
            setRefreshTrigger=${setRefreshTrigger}
            loading=${loading}
          />
          <a
            class="btn btn-light"
            href="https://${window.AppConfig?.harvestDomain}/time" 
            target="_blank"
          >
            Harvest
          </a>
          <div class="btn-group" role="group" aria-label="View options">
            <${WeekendToggle}
              hideWeekends=${hideWeekends}
              setHideWeekends=${setHideWeekends}
            />
            <${ThemeToggle}
              theme=${theme}
              setTheme=${setTheme}
            />
          </div>
        </div>
      </header>
      <div class="container-fluid" style="padding-top: 82px;">
        <div id="results" class=${loading ? 'loading' : ''}>
          ${model
            ? html`<${ReconciliationTable} model=${model} hideWeekends=${hideWeekends} jiraDomain=${window.AppConfig?.jiraDomain} projectAliases=${window.AppConfig?.projectAliases || {}} />`
            : html`<${PlaceholderReconciliationTable} headers=${getWeekDates(parseDateLocal(week)).map(date => ({ date }))} hideWeekends=${hideWeekends} />`
          }
        </div>
      </div>
    <//>
  `;
}
