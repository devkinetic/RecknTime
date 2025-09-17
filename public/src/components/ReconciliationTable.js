import { h } from 'preact';
import htm from 'htm';
import { isWeekendColumn } from '../utils.js';

const html = htm.bind(h);

export function ReconciliationTable({ model, jiraDomain, projectAliases = {}, hideWeekends = false }) {
  if (!model || !model.rows || !model.headers) return null;

  const getAliasedProjectName = (name) => projectAliases[name] || name;

  const renderCell = (cell, isLinked) => {
    const h = cell.harvest;
    const j = cell.jira;
    
    const showDiff = isLinked && Math.abs(h - j) > 0.01;
    const cellClass = showDiff ? 'diff-bad' : '';
    const value = showDiff
      ? `${h.toFixed(2)} / ${j.toFixed(2)}`
      : (h > 0 ? h.toFixed(2) : '-');

    return html`
      <td class="${cellClass} ${isWeekendColumn(cell.date) ? 'weekend' : ''}">
        ${value}
      </td>
    `;
  };

  return html`
    <div class="reconciliation-table mt-4 ${hideWeekends ? 'hide-weekends' : ''}">
      <table class="table table-hover table-striped align-middle">
        <thead>
          <tr>
            <th>Issue</th>
            ${model.headers.map((header, i) => html`
              <th class="${isWeekendColumn(model.totals[i].date) ? 'weekend' : ''}" key=${i} dangerouslySetInnerHTML=${{ __html: header }} />
            `)}
          </tr>
        </thead>
        <tbody class="table-group-divider">
          ${model.rows.map(row => html`
            <tr>
              <td class="issue text-wrap" style="min-width: 200px; max-width: 300px;">
                ${row.isLinked
                  ? html`
                    <a class="fw-bold" href="https://${jiraDomain}/browse/${row.jiraIssueKey}" target="_blank">
                      ${(row.project) ? row.label : row.jiraIssueKey + ' - ' + row.label }
                    </a>
                  `
                  : html`<div class="fw-bold">${row.label}</div>`
                }

                ${(row.project || row.task) && html`
                  <div class="text-muted small fst-italic">
                    ${getAliasedProjectName(row.project || '')} — ${row.task || ''}
                  </div>
                `}
              </td>
              
              ${row.cells.map(cell => renderCell(cell, row.isLinked))}
            </tr>
          `)}
        </tbody>
        <tfoot class="fw-bold">
          <tr>
            <th>Totals</th>
            ${model.totals.map(total => {
              return html`
                <th class="${isWeekendColumn(total.date) ? 'weekend' : ''}">
                  ${total.jira.toFixed(2)}<br />${total.harvest.toFixed(2)}
                </th>
              `;
            })}
          </tr>
        </tfoot>
      </table>

      <div class="mt-3 fw-bold text-end">Total Jira Hours: ${model.totals.reduce((s, d) => s + d.jira, 0).toFixed(2)}</div>
      <div class="mt-3 fw-bold text-end">Total Harvest Hours: ${model.totals.reduce((s, d) => s + d.harvest, 0).toFixed(2)}</div>
    </div>
  `;
}

export function PlaceholderReconciliationTable({ headers = [], hideWeekends = false }) {
  const rows = Array(4).fill(null); // number of placeholder rows

  return html`
    <div class="reconciliation-table mt-4 ${hideWeekends ? 'hide-weekends' : ''}">
      <table class="table table-hover table-striped align-middle">
        <thead>
          <tr>
            <th style="min-width: 85px;"><span class="placeholder col-1"></span></th>
            ${headers.map((header, i) => html`
              <th class="${isWeekendColumn(header.date) ? 'weekend' : ''}">
                <span class="placeholder col-4"></span>
                <br />
                <span class="placeholder col-6"></span>
              </th>
            `)}
          </tr>
        </thead>
        <tbody class="table-group-divider">
          ${rows.map(() => html`
            <tr>
              <td class="issue text-wrap">
                <span class="placeholder col-6"></span>
                <div class="text-muted small fst-italic col-4">
                  <span class="placeholder col-6"></span> — <span class="placeholder col-4"></span>
                </div>
              </td>
              ${headers.map((header, i) => html`
                <td class="${isWeekendColumn(header.date) ? 'weekend' : ''}">
                  <span class="placeholder col-4"></span>
                </td>
              `)}
            </tr>
          `)}
        </tbody>
      </table>
    </div>
  `;
}
