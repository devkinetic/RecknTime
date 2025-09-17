export function normalizeHarvestEntries(rawEntries) {
  if (!Array.isArray(rawEntries)) return [];
  
  return rawEntries.map(entry => ({
    source: 'harvest',
    sourceId: entry.id,
    sourceParentId: entry.task?.id || '',
    issueKey: extractJiraKey(entry.notes),
    date: entry.spent_date,
    summary: entry.notes || '',
    hours: entry.hours || 0,
    project: entry.project?.name || '',
    task: entry.task?.name || ''
  }));
}

function extractJiraKey(text = '') {
  const match = text.match(/[A-Z0-9_]+-\d+/i);
  return match ? match[0].toUpperCase() : null;
}

export function normalizeJiraWorklogs(worklogsByIssue) {
  const entries = [];

  for (const [key, { summary, worklogs }] of Object.entries(worklogsByIssue)) {
    for (const wl of worklogs || []) {
      const date = wl.started?.slice(0, 10);
      const hours = (wl.timeSpentSeconds || 0) / 3600;
      entries.push({
        source: 'jira',
        sourceId: wl.id,
        sourceParentId: wl.issueId,
        issueKey: key.toUpperCase(),
        date,
        summary,
        hours,
        project: '',   // Jira doesn't provide this
        task: ''
      });
    }
  }

  return entries;
}
