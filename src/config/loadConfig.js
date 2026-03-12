import fs from 'node:fs';
import path from 'node:path';

const REQUIRED_TOP_LEVEL = ['version', 'target', 'suites', 'policies'];

export function loadConfig(configPath) {
  const resolvedPath = path.resolve(configPath || 'harness.config.json');
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Config file not found: ${resolvedPath}`);
  }

  const raw = fs.readFileSync(resolvedPath, 'utf8');
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(`Invalid JSON in config file: ${resolvedPath}`);
  }

  for (const key of REQUIRED_TOP_LEVEL) {
    if (!(key in parsed)) {
      throw new Error(`Missing required config field: ${key}`);
    }
  }

  if (!parsed.target || parsed.target.type !== 'http') {
    throw new Error('V1 currently supports only target.type="http"');
  }

  if (!Array.isArray(parsed.suites) || parsed.suites.length === 0) {
    throw new Error('Config must include at least one suite');
  }

  return {
    resolvedPath,
    config: parsed,
  };
}
