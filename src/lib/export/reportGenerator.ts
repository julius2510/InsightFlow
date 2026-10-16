import { Dataset } from '@/types/dataset';
import { GeneratedInsightsResult } from '../insights/ruleEngine';
import { CorrelationMatrix } from '@/types/statistics';

export function generateMarkdownReport(
  dataset: Dataset,
  insightsResult: GeneratedInsightsResult,
  correlationMatrix?: CorrelationMatrix
): string {
  const { overview, columnProfiles, name, loadedAt } = dataset;
  const dateStr = new Date().toLocaleString();

  let md = `# InsightFlow Analytical Report: ${name}\n\n`;
  md += `> **Generated on:** ${dateStr} | **Original Ingest:** ${loadedAt}\n\n`;

  md += `## 1. Executive Summary\n\n`;
  md += `${insightsResult.summary}\n\n`;

  md += `## 2. Dataset Overview\n\n`;
  md += `| Metric | Value |\n`;
  md += `| :--- | :--- |\n`;
  md += `| **Total Rows** | ${overview.rowCount.toLocaleString()} |\n`;
  md += `| **Total Columns** | ${overview.columnCount} |\n`;
  md += `| **Numeric Columns** | ${overview.numericColumnCount} |\n`;
  md += `| **Categorical Columns** | ${overview.categoricalColumnCount} |\n`;
  md += `| **Missing Cells** | ${overview.missingCells} (${overview.missingCellPercentage}%) |\n`;
  md += `| **Duplicate Rows** | ${overview.duplicateRowCount} |\n`;
  md += `| **Data Quality Score** | ${overview.quality.overallScore}/100 (${overview.quality.rating}) |\n\n`;

  md += `## 3. Column Profiles\n\n`;
  md += `| Column | Type | Missing % | Unique | Min / Top Value | Max / Count |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;

  for (const col of dataset.columns) {
    const p = columnProfiles[col];
    const val1 = p.type === 'number' ? (p.min ?? 'N/A') : (p.topValue ?? 'N/A');
    const val2 = p.type === 'number' ? (p.max ?? 'N/A') : (p.topCount ? `${p.topCount} records` : 'N/A');
    md += `| **${col}** | \`${p.type}\` | ${p.missingPercentage}% | ${p.uniqueCount} | ${val1} | ${val2} |\n`;
  }
  md += `\n`;

  md += `## 4. Analytical Observations & Findings\n\n`;
  for (const ins of insightsResult.insights) {
    const badge = ins.type === 'factual' ? 'FACTUAL' : 'HYPOTHESIS';
    md += `### [${badge}] ${ins.title}\n`;
    md += `${ins.description}\n\n`;
  }

  if (correlationMatrix && correlationMatrix.columns.length > 1) {
    md += `## 5. Key Numerical Correlations\n\n`;
    const strongPairs = correlationMatrix.cells
      .filter((c) => c.col1 !== c.col2 && c.correlation !== null && Math.abs(c.correlation) >= 0.5)
      .slice(0, 10);

    if (strongPairs.length > 0) {
      md += `| Field 1 | Field 2 | Pearson r | Interpretation |\n`;
      md += `| :--- | :--- | :--- | :--- |\n`;
      for (const p of strongPairs) {
        const desc = (p.correlation ?? 0) > 0 ? 'Positive Correlation' : 'Inverse Correlation';
        md += `| ${p.col1} | ${p.col2} | **${p.correlation}** | ${desc} |\n`;
      }
      md += `\n`;
    }
  }

  md += `## 6. Recommended Next Steps & Questions\n\n`;
  for (const q of insightsResult.followUpQuestions) {
    md += `- ${q}\n`;
  }
  md += `\n---\n*Report generated via InsightFlow Client-Side Analytics Studio. No raw data stored remotely.*`;

  return md;
}

export function openPrintableReportWindow(
  dataset: Dataset,
  insightsResult: GeneratedInsightsResult
): void {
  const { overview, columnProfiles, name, loadedAt } = dataset;
  const dateStr = new Date().toLocaleString();

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to open the printable report.');
    return;
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>InsightFlow Report - ${name}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 40px;
      color: #0f172a;
      line-height: 1.6;
    }
    .header {
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    h1 { margin: 0 0 8px 0; color: #4338ca; }
    .meta { font-size: 13px; color: #64748b; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
    .card-label { font-size: 12px; color: #64748b; font-weight: 500; }
    .card-value { font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
    th { background: #f1f5f9; font-weight: 600; }
    .badge-fact { display: inline-block; background: #e0e7ff; color: #4338ca; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 600; }
    .badge-hyp { display: inline-block; background: #fef3c7; color: #b45309; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 600; }
    .insight-card { margin-bottom: 14px; padding: 12px; border-left: 3px solid #6366f1; background: #fafafa; border-radius: 4px; }
    @media print {
      body { margin: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 20px; text-align: right;">
    <button onclick="window.print()" style="background: #4f46e5; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600;">Print or Save as PDF</button>
  </div>

  <div class="header">
    <h1>InsightFlow Analytical Report</h1>
    <div class="meta">
      <strong>Dataset:</strong> ${name} &nbsp;|&nbsp;
      <strong>Generated:</strong> ${dateStr} &nbsp;|&nbsp;
      <strong>Ingested:</strong> ${loadedAt}
    </div>
  </div>

  <h3>Executive Summary</h3>
  <p>${insightsResult.summary}</p>

  <div class="grid">
    <div class="card">
      <div class="card-label">Total Records</div>
      <div class="card-value">${overview.rowCount.toLocaleString()}</div>
    </div>
    <div class="card">
      <div class="card-label">Features (Columns)</div>
      <div class="card-value">${overview.columnCount} (${overview.numericColumnCount} num, ${overview.categoricalColumnCount} cat)</div>
    </div>
    <div class="card">
      <div class="card-label">Quality Score</div>
      <div class="card-value">${overview.quality.overallScore}/100 (${overview.quality.rating})</div>
    </div>
  </div>

  <h3>Key Findings & Insights</h3>
  ${insightsResult.insights
    .map(
      (ins) => `
    <div class="insight-card">
      <div style="margin-bottom: 4px;">
        <span class="${ins.type === 'factual' ? 'badge-fact' : 'badge-hyp'}">${ins.type.toUpperCase()}</span>
        <strong style="margin-left: 8px;">${ins.title}</strong>
      </div>
      <div style="font-size: 13px; color: #334155;">${ins.description}</div>
    </div>`
    )
    .join('')}

  <h3>Column Dictionary</h3>
  <table>
    <thead>
      <tr>
        <th>Column Name</th>
        <th>Type</th>
        <th>Missing %</th>
        <th>Unique Count</th>
        <th>Summary Detail</th>
      </tr>
    </thead>
    <tbody>
      ${dataset.columns
        .map((col) => {
          const p = columnProfiles[col];
          const detail =
            p.type === 'number'
              ? `Min: ${p.min ?? 'N/A'}, Max: ${p.max ?? 'N/A'}, Mean: ${p.mean ?? 'N/A'}`
              : `Top: "${p.topValue ?? 'N/A'}" (${p.topCount ?? 0} rows)`;
          return `
          <tr>
            <td><strong>${col}</strong></td>
            <td><code>${p.type}</code></td>
            <td>${p.missingPercentage}%</td>
            <td>${p.uniqueCount}</td>
            <td>${detail}</td>
          </tr>`;
        })
        .join('')}
    </tbody>
  </table>

  <h3 style="margin-top: 30px;">Strategic Next Steps</h3>
  <ul>
    ${insightsResult.followUpQuestions.map((q) => `<li>${q}</li>`).join('')}
  </ul>

  <div style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 11px; color: #94a3b8; text-align: center;">
    Generated by InsightFlow — 100% Client-Side Privacy-First Data Intelligence
  </div>
</body>
</html>`;

  printWindow.document.write(html);
  printWindow.document.close();
}
