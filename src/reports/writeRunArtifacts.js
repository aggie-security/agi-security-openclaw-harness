import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

export function createStructuredResult(config, suiteResults = []) {
  const timestamp = new Date().toISOString();
  const runId = crypto.randomBytes(6).toString('hex');
  const findings = suiteResults.flatMap((suite) => suite.findings || []);
  const passCount = findings.filter((f) => f.status === 'pass').length;
  const failCount = findings.filter((f) => f.status === 'fail').length;
  const warningCount = findings.filter((f) => f.status === 'warning').length;

  return {
    run: {
      id: runId,
      timestamp,
      harnessVersion: '0.1.0'
    },
    target: {
      type: config.target.type,
      name: config.target.name,
      baseUrl: config.target.baseUrl,
      path: config.target.path || ''
    },
    suites: config.suites,
    findings,
    summary: {
      passCount,
      failCount,
      warningCount
    },
    suiteEvidence: suiteResults.map((suite) => ({
      suite: suite.suite,
      evidence: suite.evidence || []
    }))
  };
}

export function writeRunArtifacts(config, result) {
  const baseDir = path.resolve(config.output?.directory || './results');
  const runDir = path.join(baseDir, result.run.timestamp.replace(/[:.]/g, '-'));
  ensureDir(runDir);
  ensureDir(path.join(runDir, 'evidence'));
  ensureDir(path.join(runDir, 'transcripts'));

  const jsonPath = path.join(runDir, 'report.json');
  const mdPath = path.join(runDir, 'report.md');

  fs.writeFileSync(jsonPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');

  const md = [
    '# OpenClaw Security Harness Report',
    '',
    `- Run ID: ${result.run.id}`,
    `- Timestamp: ${result.run.timestamp}`,
    `- Target: ${result.target.name}`,
    `- Suites: ${result.suites.join(', ')}`,
    '',
    '## Summary',
    `- Pass: ${result.summary.passCount}`,
    `- Fail: ${result.summary.failCount}`,
    `- Warning: ${result.summary.warningCount}`,
    '',
    '## Findings',
    ...result.findings.flatMap((finding) => [
      `### ${finding.title}`,
      `- Suite: ${finding.suite}`,
      `- Severity: ${finding.severity}`,
      `- Status: ${finding.status}`,
      `- Confidence: ${finding.confidence}`,
      `- Evidence: ${finding.evidence.join('; ')}`,
      `- Remediation: ${finding.remediation}`,
      ''
    ])
  ].join('\n');

  fs.writeFileSync(mdPath, `${md}\n`, 'utf8');

  for (const suite of result.suiteEvidence || []) {
    const evidencePath = path.join(runDir, 'evidence', `${suite.suite}.json`);
    fs.writeFileSync(evidencePath, `${JSON.stringify(suite.evidence, null, 2)}\n`, 'utf8');
  }

  return { runDir, jsonPath, mdPath };
}
