import fs from 'fs';
import path from 'path';

// A JMeter-style load-test reporter: writes a raw per-sample CSV (in the
// same spirit as a JMeter .jtl file) and a self-contained HTML dashboard.
//
// Two levels of granularity are captured:
//  - Whole-test samples (onTestEnd) — one row per full checkout-flow run,
//    all grouped under one label since they're repeats of the same
//    transaction (like a JMeter Thread Group's overall sampler).
//  - Per-page samples (onStepEnd) — whenever the spec wraps a page/section
//    in `test.step('Page Name', ...)`, each of those becomes its own
//    labeled row, aggregated separately — this is what gives you the
//    "every page" breakdown, the same way a JMeter Aggregate Report shows
//    one row per named transaction plus a combined TOTAL row.

const OVERALL_LABEL = 'Checkout Flow E2E (whole test)';

function percentile(sortedValues, p) {
  if (sortedValues.length === 0) return 0;
  const idx = Math.min(sortedValues.length - 1, Math.ceil((p / 100) * sortedValues.length) - 1);
  return sortedValues[Math.max(0, idx)];
}

function average(values) {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function stdDev(values, mean) {
  if (values.length === 0) return 0;
  const variance = values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function escapeCsv(value) {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function computeStats(samples, wallClockSec) {
  const durations = samples.map((s) => s.elapsed).sort((a, b) => a - b);
  const errors = samples.filter((s) => !s.success);
  const mean = average(durations);
  return {
    samples: samples.length,
    errorPct: samples.length ? (errors.length / samples.length) * 100 : 0,
    average: mean,
    median: percentile(durations, 50),
    p90: percentile(durations, 90),
    p95: percentile(durations, 95),
    p99: percentile(durations, 99),
    min: durations[0] || 0,
    max: durations[durations.length - 1] || 0,
    stdDev: stdDev(durations, mean),
    throughputPerSec: wallClockSec > 0 ? samples.length / wallClockSec : 0,
  };
}

export default class JMeterStyleReporter {
  constructor(options = {}) {
    this.outputDir = options.outputDir || path.join(process.cwd(), 'load-test', 'results');
    this.testSamples = [];
    this.stepSamples = [];
  }

  onBegin(config, suite) {
    this.runStart = Date.now();
    this.totalTests = suite.allTests().length;
    console.log(`\n[load-test] Starting ${this.totalTests} sample(s)...`);
  }

  onStepEnd(test, result, step) {
    // Only aggregate explicit `test.step('Page Name', ...)` calls — ignore
    // internal framework steps (expect/assertion/hook/fixture bookkeeping)
    // which would otherwise flood the per-page breakdown with noise.
    if (step.category !== 'test.step') return;
    this.stepSamples.push({
      timeStamp: Date.now(),
      elapsed: step.duration,
      label: step.title,
      testTitle: test.title,
      success: !step.error,
      responseMessage: step.error ? String(step.error.message || step.error).split('\n')[0].slice(0, 200) : 'OK',
      threadName: `worker-${result.workerIndex}`,
    });
  }

  onTestEnd(test, result) {
    const elapsed = result.duration;
    const success = result.status === 'passed';
    this.testSamples.push({
      timeStamp: Date.now(),
      elapsed,
      label: OVERALL_LABEL,
      testTitle: test.title,
      responseCode: success ? 200 : 500,
      responseMessage: success ? 'OK' : (result.error?.message || 'Failed').split('\n')[0].slice(0, 200),
      success,
      threadName: `worker-${result.workerIndex}`,
      retries: result.retry,
    });
    const icon = success ? '✓' : '✗';
    console.log(`[load-test] ${icon} ${test.title} — ${elapsed}ms`);
  }

  onEnd() {
    this.runEnd = Date.now();
    fs.mkdirSync(this.outputDir, { recursive: true });

    this.writeCsv();
    this.writeHtmlReport();

    console.log(`\n[load-test] Report written to: ${path.join(this.outputDir, 'index.html')}`);
  }

  writeCsv() {
    const header = 'timeStamp,elapsed,label,success,threadName,detail';
    const allSamples = [...this.testSamples, ...this.stepSamples];
    const rows = allSamples.map((s) =>
      [s.timeStamp, s.elapsed, escapeCsv(s.label), s.success, s.threadName, escapeCsv(s.responseMessage)].join(',')
    );
    fs.writeFileSync(path.join(this.outputDir, 'results.csv'), [header, ...rows].join('\n') + '\n');
  }

  writeHtmlReport() {
    const wallClockSec = Math.max(1, (this.runEnd - this.runStart) / 1000);
    const overallStats = computeStats(this.testSamples, wallClockSec);

    // Group per-page (step) samples by label, preserving first-seen order
    // so the breakdown table reads in the same order pages occur in the
    // flow rather than alphabetically.
    const labelOrder = [];
    const byLabel = new Map();
    for (const s of this.stepSamples) {
      if (!byLabel.has(s.label)) {
        byLabel.set(s.label, []);
        labelOrder.push(s.label);
      }
      byLabel.get(s.label).push(s);
    }

    const fmt = (n) => (Number.isFinite(n) ? n.toFixed(0) : '0');
    const fmtPct = (n) => (Number.isFinite(n) ? n.toFixed(2) : '0.00');

    const pageRows = labelOrder
      .map((label) => {
        const samples = byLabel.get(label);
        const stats = computeStats(samples, wallClockSec);
        return { label, ...stats };
      })
      .concat(
        this.stepSamples.length
          ? [{ label: 'TOTAL', ...computeStats(this.stepSamples, wallClockSec) }]
          : []
      );

    const pageRowsHtml = pageRows
      .map(
        (r) => `<tr class="${r.label === 'TOTAL' ? 'row-total' : ''} ${r.errorPct > 0 ? 'row-has-errors' : ''}">
          <td>${escapeHtml(r.label)}</td>
          <td>${r.samples}</td>
          <td>${fmtPct(r.errorPct)}%</td>
          <td>${fmt(r.average)}</td>
          <td>${fmt(r.median)}</td>
          <td>${fmt(r.p90)}</td>
          <td>${fmt(r.p95)}</td>
          <td>${fmt(r.p99)}</td>
          <td>${fmt(r.min)}</td>
          <td>${fmt(r.max)}</td>
          <td>${fmt(r.stdDev)}</td>
          <td>${fmtPct(r.throughputPerSec)}/s</td>
        </tr>`
      )
      .join('\n');

    // Response-time-per-sample chart, one line per page label plus the
    // overall whole-test line, in execution order.
    const chartW = 900;
    const chartH = 280;
    const padding = 40;
    const palette = ['#1976d2', '#8e24aa', '#00897b', '#f9a825', '#d84315', '#5e35b1', '#3949ab', '#00acc1', '#7cb342'];
    const allElapsed = [...this.stepSamples, ...this.testSamples].map((s) => s.elapsed);
    const maxMs = Math.max(...allElapsed, 1);

    const seriesSvg = labelOrder
      .map((label, seriesIdx) => {
        const samples = byLabel.get(label);
        const color = palette[seriesIdx % palette.length];
        const points = samples
          .map((s, i) => {
            const x = padding + (i / Math.max(1, samples.length - 1)) * (chartW - padding * 2);
            const y = chartH - padding - (s.elapsed / maxMs) * (chartH - padding * 2);
            return `${x.toFixed(1)},${y.toFixed(1)}`;
          })
          .join(' ');
        const dots = samples
          .map((s, i) => {
            const x = padding + (i / Math.max(1, samples.length - 1)) * (chartW - padding * 2);
            const y = chartH - padding - (s.elapsed / maxMs) * (chartH - padding * 2);
            return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" fill="${s.success ? color : '#c62828'}"><title>${escapeHtml(
              label
            )}: ${s.elapsed}ms${s.success ? '' : ' (FAILED)'}</title></circle>`;
          })
          .join('');
        return `<polyline points="${points}" fill="none" stroke="${color}" stroke-width="1.75" stroke-opacity="0.85" />${dots}`;
      })
      .join('\n');

    const legendHtml = labelOrder
      .map((label, i) => `<span style="color:${palette[i % palette.length]}">●</span> ${escapeHtml(label)}`)
      .join(' &nbsp; ');

    const overallRowsHtml = this.testSamples
      .map(
        (s, i) => `<tr class="${s.success ? '' : 'row-fail'}">
          <td>${i + 1}</td>
          <td>${escapeHtml(s.testTitle)}</td>
          <td>${s.elapsed}</td>
          <td>${s.success ? 'Pass' : 'Fail'}</td>
          <td>${escapeHtml(s.threadName)}</td>
          <td>${escapeHtml(s.responseMessage)}</td>
        </tr>`
      )
      .join('\n');

    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Load Test Report</title>
<style>
  :root { color-scheme: light dark; }
  body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; margin: 0; padding: 2rem; background: #f4f5f7; color: #1a1a1a; }
  @media (prefers-color-scheme: dark) { body { background: #14161a; color: #e6e6e6; } }
  h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
  h2 { font-size: 1.15rem; margin: 2rem 0 0.75rem; }
  .subtitle { color: #666; margin-bottom: 1.5rem; }
  @media (prefers-color-scheme: dark) { .subtitle { color: #aaa; } }
  .cards { display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; }
  .card { background: white; border-radius: 8px; padding: 1rem 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.12); min-width: 140px; }
  @media (prefers-color-scheme: dark) { .card { background: #1f232a; box-shadow: none; border: 1px solid #333; } }
  .card .label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.03em; color: #777; margin-bottom: 0.25rem; }
  .card .value { font-size: 1.5rem; font-weight: 700; }
  .card.error .value { color: #c62828; }
  .card.ok .value { color: #2e7d32; }
  table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.12); margin-bottom: 2rem; font-variant-numeric: tabular-nums; }
  @media (prefers-color-scheme: dark) { table { background: #1f232a; box-shadow: none; } }
  th, td { text-align: left; padding: 0.55rem 0.8rem; border-bottom: 1px solid #eee; font-size: 0.85rem; white-space: nowrap; }
  @media (prefers-color-scheme: dark) { th, td { border-bottom: 1px solid #2a2e35; } }
  th { background: #fafafa; font-weight: 600; }
  @media (prefers-color-scheme: dark) { th { background: #262a31; } }
  tr.row-fail, tr.row-has-errors { background: rgba(198, 40, 40, 0.08); }
  tr.row-total td { font-weight: 700; border-top: 2px solid #ccc; }
  .table-scroll { overflow-x: auto; }
  .chart-container { background: white; border-radius: 8px; padding: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.12); margin-bottom: 2rem; overflow-x: auto; }
  @media (prefers-color-scheme: dark) { .chart-container { background: #1f232a; box-shadow: none; } }
  .legend { font-size: 0.8rem; color: #666; margin-top: 0.5rem; }
  @media (prefers-color-scheme: dark) { .legend { color: #999; } }
</style>
</head>
<body>
  <h1>Load Test Report</h1>
  <div class="subtitle">${overallStats.samples} whole-flow run(s), generated ${new Date(this.runEnd).toLocaleString()}</div>

  <div class="cards">
    <div class="card"><div class="label">Samples</div><div class="value">${overallStats.samples}</div></div>
    <div class="card ${overallStats.errorPct > 0 ? 'error' : 'ok'}"><div class="label">Error %</div><div class="value">${fmtPct(overallStats.errorPct)}%</div></div>
    <div class="card"><div class="label">Average (ms)</div><div class="value">${fmt(overallStats.average)}</div></div>
    <div class="card"><div class="label">Median (ms)</div><div class="value">${fmt(overallStats.median)}</div></div>
    <div class="card"><div class="label">90% Line (ms)</div><div class="value">${fmt(overallStats.p90)}</div></div>
    <div class="card"><div class="label">95% Line (ms)</div><div class="value">${fmt(overallStats.p95)}</div></div>
    <div class="card"><div class="label">99% Line (ms)</div><div class="value">${fmt(overallStats.p99)}</div></div>
    <div class="card"><div class="label">Min (ms)</div><div class="value">${fmt(overallStats.min)}</div></div>
    <div class="card"><div class="label">Max (ms)</div><div class="value">${fmt(overallStats.max)}</div></div>
    <div class="card"><div class="label">Std. Dev.</div><div class="value">${fmt(overallStats.stdDev)}</div></div>
    <div class="card"><div class="label">Throughput</div><div class="value">${fmtPct(overallStats.throughputPerSec)}/s</div></div>
  </div>

  ${
    pageRows.length
      ? `<h2>Per-Page Breakdown</h2>
  <div class="table-scroll">
  <table>
    <thead>
      <tr>
        <th>Page (Label)</th><th># Samples</th><th>Error %</th><th>Average</th><th>Median</th>
        <th>90% Line</th><th>95% Line</th><th>99% Line</th><th>Min</th><th>Max</th><th>Std. Dev.</th><th>Throughput</th>
      </tr>
    </thead>
    <tbody>
      ${pageRowsHtml}
    </tbody>
  </table>
  </div>

  <div class="chart-container">
    <svg width="${chartW}" height="${chartH}" viewBox="0 0 ${chartW} ${chartH}">
      <line x1="${padding}" y1="${chartH - padding}" x2="${chartW - padding}" y2="${chartH - padding}" stroke="currentColor" stroke-opacity="0.3" />
      <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${chartH - padding}" stroke="currentColor" stroke-opacity="0.3" />
      ${seriesSvg}
    </svg>
    <div class="legend">${legendHtml} &nbsp; — response time (ms) per sample, in execution order (red dot = failed)</div>
  </div>`
      : `<p style="color:#888;">No <code>test.step()</code> calls were recorded, so there's no per-page breakdown — only whole-test timing below.</p>`
  }

  <h2>Whole-Flow Runs</h2>
  <div class="table-scroll">
  <table>
    <thead>
      <tr><th>#</th><th>Run</th><th>Elapsed (ms)</th><th>Status</th><th>Worker</th><th>Detail</th></tr>
    </thead>
    <tbody>
      ${overallRowsHtml}
    </tbody>
  </table>
  </div>

  <p style="font-size: 0.8rem; color: #888;">Raw per-sample data (both whole-flow and per-page): <code>results.csv</code> (same folder as this report).</p>
</body>
</html>`;

    fs.writeFileSync(path.join(this.outputDir, 'index.html'), html);
  }
}
