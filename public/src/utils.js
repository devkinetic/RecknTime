export function parseDateLocal(isoString) {
  const [year, month, day] = isoString.split('-').map(Number);
  return new Date(year, month - 1, day); // JS months are 0-indexed
}

// Returns YYYY-MM-DD
export function formatDate(date) {
  return new Date(date).toISOString().slice(0, 10);
}

// Given any date, returns the Monday of that week
export function getWeekStart(dateInput) {
  const date = new Date(dateInput);
  const day = date.getDay();
  const monday = new Date(date);
  monday.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

// Given a Monday date, returns an array of 7 YYYY-MM-DD strings
export function getWeekDates(startDate) {
  const start = new Date(startDate);
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(formatDate(d));
  }
  return dates;
}

// Checks if a given YYYY-MM-DD is a weekend
export function isWeekendColumn(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function isSameDay(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

// Builds the full model used by the table renderer
export function buildReconciliationModel(allEntries, weekDates) {
  const reconciliation = {}; // keyed by issueKey
  const unlinked = {};       // keyed by project+task+summary
  const totalsMap = Object.fromEntries(weekDates.map(d => [d, { date: d, harvest: 0, jira: 0 }]));

  // handle no data
  if (!allEntries || allEntries.length === 0) {
    return {
      headers: weekDates.map(d => {
        const [y, m, day] = d.split('-').map(Number);
        const localDate = new Date(y, m - 1, day);
        const dayName = localDate.toLocaleDateString('en-US', { weekday: 'short' });
        return `${dayName}<br>${d.slice(5)}`;
      }),
      rows: [],
      totals: weekDates.map(date => ({
        date,
        harvest: 0,
        jira: 0,
      })),
    };
  }

  for (const entry of allEntries) {
    const { issueKey, date, hours, source, summary, project, task } = entry;

    if (!date || !hours || !source) continue;

    if (issueKey) {
      reconciliation[issueKey] ??= {
        summary: '',
        project: '',
        task: '',
        perDay: Object.fromEntries(weekDates.map(d => [d, { harvest: 0, jira: 0 }]))
      };

      const rec = reconciliation[issueKey];

      // Fill in summary/project/task if not yet set
      if (!rec.summary && summary) rec.summary = summary;
      if (!rec.project && project) rec.project = project;
      if (!rec.task && task) rec.task = task;

      // Add hours
      rec.perDay[date][source] += hours;
      totalsMap[date][source] += hours;
    } else {
      // Unlinked Harvest entry
      const groupKey = `${summary}||${project}||${task}`;
      unlinked[groupKey] ??= {
        summary: summary.length > 70 ? summary.slice(0, 70) + '…' : summary,
        project,
        task,
        perDay: Object.fromEntries(weekDates.map(d => [d, { harvest: 0, jira: 0 }]))
      };

      unlinked[groupKey].perDay[date].harvest += hours;
      totalsMap[date].harvest += hours;
    }
  }

  // --- Convert to rows ---
  const rows = [];

  for (const [issueKey, rec] of Object.entries(reconciliation)) {
    rows.push({
      isLinked: true,
      jiraIssueKey: issueKey,
      summary: rec.summary,
      project: rec.project,
      task: rec.task,
      label: rec.summary,
      cells: weekDates.map(date => ({
        date,
        harvest: rec.perDay[date].harvest,
        jira: rec.perDay[date].jira
      }))
    });
  }

  for (const group of Object.values(unlinked)) {
    rows.push({
      isLinked: false,
      label: group.summary,
      project: group.project,
      task: group.task,
      cells: weekDates.map(date => ({
        date,
        harvest: group.perDay[date].harvest,
        jira: 0
      }))
    });
  }

  return {
    headers: weekDates.map(d => {
      const [y, m, day] = d.split('-').map(Number);
      const localDate = new Date(y, m - 1, day);
      const dayName = localDate.toLocaleDateString('en-US', { weekday: 'short' });
      return `${dayName}<br>${d.slice(5)}`;
    }),
    rows,
    totals: weekDates.map(date => totalsMap[date])
  };
}
