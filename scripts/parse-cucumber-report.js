const fs = require('fs');
const path = require('path');

const input = path.resolve(process.cwd(), 'reports', 'cucumber.json');
const outJson = path.resolve(process.cwd(), 'reports', 'coverage-summary.json');
const outHtml = path.resolve(process.cwd(), 'reports', 'summary.html');

async function run() {
  try {
    if (!fs.existsSync(input)) {
      console.error('Cucumber JSON report not found at', input);
      process.exitCode = 2;
      return;
    }

    const raw = fs.readFileSync(input, 'utf8');
    const data = JSON.parse(raw);

    // data is an array of feature objects
    let totalScenarios = 0;
    let passed = 0;
    let failed = 0;
    let skipped = 0;
    let undefinedCount = 0;

    for (const feature of data) {
      const elements = feature.elements || [];
      for (const el of elements) {
        // Skip backgrounds
        if (el.type && el.type.toLowerCase() === 'background') continue;
        // Consider scenario and scenario_outline
        if (el.type && (el.type.toLowerCase() === 'scenario' || el.type.toLowerCase() === 'scenario_outline' || el.keyword && el.keyword.toLowerCase().includes('scenario'))) {
          totalScenarios++;
          let scenarioStatus = 'passed';
          const steps = el.steps || [];
          for (const step of steps) {
            const result = (step.result && step.result.status) || 'unknown';
            if (result === 'failed') {
              scenarioStatus = 'failed';
              break;
            }
            if (result === 'undefined') {
              scenarioStatus = 'undefined';
            }
            if (result === 'skipped' && scenarioStatus !== 'undefined') {
              scenarioStatus = 'skipped';
            }
          }

          if (scenarioStatus === 'passed') passed++;
          else if (scenarioStatus === 'failed') failed++;
          else if (scenarioStatus === 'skipped') skipped++;
          else if (scenarioStatus === 'undefined') undefinedCount++;
        }
      }
    }

    const summary = {
      totalScenarios,
      passed,
      failed,
      skipped,
      undefined: undefinedCount,
      passPercentage: totalScenarios ? Math.round((passed / totalScenarios) * 10000) / 100 : 0
    };

    // Ensure reports dir exists
    const reportsDir = path.resolve(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

    fs.writeFileSync(outJson, JSON.stringify(summary, null, 2), 'utf8');

    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Cucumber Coverage Summary</title>
  <style>body{font-family:Arial,Helvetica,sans-serif;padding:20px}table{border-collapse:collapse;width:480px}td,th{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f4f4f4}</style>
</head>
<body>
  <h1>Cucumber Coverage Summary</h1>
  <table>
    <tr><th>Metric</th><th>Value</th></tr>
    <tr><td>Total scenarios</td><td>${summary.totalScenarios}</td></tr>
    <tr><td>Passed</td><td>${summary.passed}</td></tr>
    <tr><td>Failed</td><td>${summary.failed}</td></tr>
    <tr><td>Skipped</td><td>${summary.skipped}</td></tr>
    <tr><td>Undefined</td><td>${summary.undefined}</td></tr>
    <tr><td>Pass %</td><td>${summary.passPercentage}%</td></tr>
  </table>
  <p>Generated at ${new Date().toISOString()}</p>
</body>
</html>`;

    fs.writeFileSync(outHtml, html, 'utf8');

    console.log('Cucumber summary written to', outJson, 'and', outHtml);
  } catch (err) {
    console.error('Error parsing cucumber JSON:', err);
    process.exitCode = 1;
  }
}

run();
