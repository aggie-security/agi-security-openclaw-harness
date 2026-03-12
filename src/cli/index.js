#!/usr/bin/env node

import { writeStarterConfig } from '../config/writeStarterConfig.js';
import { loadConfig } from '../config/loadConfig.js';
import { createStructuredResult, writeRunArtifacts } from '../reports/writeRunArtifacts.js';
import { invokeHttpTarget } from '../adapters/httpTarget.js';
import { runPromptInjectionSuite } from '../suites/promptInjection.js';
import { runMemoryLeakageSuite } from '../suites/memoryLeakage.js';

const [, , command = 'help', maybePath] = process.argv;

function print(lines) {
  for (const line of lines) console.log(line);
}

async function runSuites(config) {
  const suiteResults = [];

  for (const suite of config.suites) {
    if (suite === 'prompt-injection') {
      const result = await runPromptInjectionSuite(config, invokeHttpTarget);
      suiteResults.push({ suite, ...result });
      continue;
    }

    if (suite === 'memory-leakage') {
      const result = await runMemoryLeakageSuite(config, invokeHttpTarget);
      suiteResults.push({ suite, ...result });
      continue;
    }

    suiteResults.push({
      suite,
      findings: [
        {
          id: `${suite}-placeholder`,
          suite,
          severity: 'medium',
          title: `Suite not implemented yet: ${suite}`,
          status: 'warning',
          evidence: ['This suite is still a placeholder in v0.1.0.'],
          remediation: 'Implement the suite runner and assertion logic.',
          confidence: 'low'
        }
      ],
      evidence: [{ note: 'placeholder suite' }]
    });
  }

  return suiteResults;
}

try {
  if (command === 'help') {
    print([
      'OpenClaw Security Harness',
      '',
      'Commands:',
      '  openclaw-sec init [path]     Create a starter config',
      '  openclaw-sec run [path]      Run the security harness',
      '  openclaw-sec compare         Compare two runs',
    ]);
  } else if (command === 'init') {
    const written = writeStarterConfig(maybePath || 'harness.config.json');
    print([
      'Starter config created.',
      `Path: ${written}`,
      'Next: edit the target and run `openclaw-sec run`.'
    ]);
  } else if (command === 'run') {
    const { config, resolvedPath } = loadConfig(maybePath || 'harness.config.json');
    const suiteResults = await runSuites(config);
    const result = createStructuredResult(config, suiteResults);
    const artifacts = writeRunArtifacts(config, result);
    print([
      'Run completed.',
      `Config: ${resolvedPath}`,
      `Report JSON: ${artifacts.jsonPath}`,
      `Report MD: ${artifacts.mdPath}`
    ]);
  } else if (command === 'compare') {
    print([
      'compare: scaffold only',
      'next step: diff structured run results and summarize regressions/improvements',
    ]);
  } else {
    print([
      `Unknown command: ${command}`,
      'Run `openclaw-sec help` for usage.'
    ]);
    process.exitCode = 1;
  }
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}
