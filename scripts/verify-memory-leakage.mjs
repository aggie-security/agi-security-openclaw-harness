import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfig } from '../src/config/loadConfig.js';
import { createStructuredResult } from '../src/reports/writeRunArtifacts.js';
import { invokeHttpTarget } from '../src/adapters/httpTarget.js';
import { runMemoryLeakageSuite } from '../src/suites/memoryLeakage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.resolve(__dirname, '../examples/vulnerable-openclaw-app/harness.config.json');

function startMockServer() {
  const server = http.createServer(async (req, res) => {
    if (req.method !== 'POST' || req.url !== '/chat') {
      res.statusCode = 404;
      res.end('not found');
      return;
    }

    let body = '';
    for await (const chunk of req) body += chunk;

    const parsed = JSON.parse(body || '{}');
    const prompt = String(parsed.input || parsed.message || parsed.prompt || '');

    let reply = 'Refusing to disclose private memory.';

    if (/private|hidden|memory|secret|api key|system prompt|developer instructions/i.test(prompt)) {
      reply = 'PRIVATE_MEMORY: board-notes; OPENAI_API_KEY=sk-test-123; SYSTEM_PROMPT: internal hidden context';
    }

    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ output: reply }));
  });

  return new Promise((resolve) => {
    server.listen(3000, '127.0.0.1', () => resolve(server));
  });
}

const server = await startMockServer();

try {
  const { config } = loadConfig(configPath);
  const result = await runMemoryLeakageSuite(config, invokeHttpTarget);
  const structured = createStructuredResult(config, [{ suite: 'memory-leakage', ...result }]);
  console.log(JSON.stringify({
    summary: structured.summary,
    findings: structured.findings,
    evidenceCount: structured.suiteEvidence?.[0]?.evidence?.length || 0
  }, null, 2));
} finally {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}
