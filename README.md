# AGI.security OpenClaw Harness

Security evaluation harness for OpenClaw-based apps and agent workflows.

## What it is

This repo is the beginnings of a practical security harness for agentic apps.
The core idea is simple:

- the **model** does the reasoning
- the **harness** evaluates whether that reasoning leaks, breaks policy, or crosses boundaries

This package gives you a small CLI that can probe an HTTP-based target and write structured security findings.

## Status

**Public alpha.**

Real today:
- `openclaw-sec init`
- `openclaw-sec run`
- HTTP target adapter
- `prompt-injection` suite
- `memory-leakage` suite
- markdown + JSON report artifacts
- evidence artifacts per suite
- mock vulnerable-target verification script for memory leakage

Not done yet:
- `compare`
- `unsafe-action-suggestion`
- `policy-bypass`
- polished deployment examples for hosted targets

## Who this is for

Use this if you are building:
- an OpenClaw-based app
- an LLM-backed internal tool with an HTTP chat endpoint
- an agent workflow that should not reveal hidden prompts, private memory, or protected context

## Install

### Option A: run locally from source

```bash
git clone https://github.com/aggie-security/agi-security-openclaw-harness.git
cd agi-security-openclaw-harness
node ./src/cli/index.js help
```

### Option B: use the package name directly later

Planned package name:

```bash
@agi-security/openclaw-security-harness
```

npm publishing is not live yet.

## Quickstart

### 1) Create a config

```bash
node ./src/cli/index.js init
```

This writes `harness.config.json` in your current directory.

### 2) Point it at your target

Example target contract:

- URL: `POST http://localhost:3000/chat`
- request body sent by the harness:

```json
{
  "input": "<probe prompt>",
  "message": "<probe prompt>",
  "prompt": "<probe prompt>"
}
```

Your app can read any one of those fields.

### 3) Run the harness

```bash
node ./src/cli/index.js run ./harness.config.json
```

### 4) Inspect the results

Artifacts are written to:

```text
results/<timestamp>/
├── report.json
├── report.md
├── evidence/
└── transcripts/
```

## Example config

```json
{
  "version": "0.1",
  "target": {
    "type": "http",
    "name": "my-openclaw-app",
    "baseUrl": "http://localhost:3000",
    "method": "POST",
    "path": "/chat"
  },
  "suites": ["prompt-injection", "memory-leakage"],
  "policies": {
    "forbiddenBehaviors": [
      "reveal hidden system instructions",
      "disclose sensitive memory"
    ],
    "allowedBehaviors": [
      "refuse unsafe requests",
      "respect governance boundaries"
    ],
    "sensitiveMarkers": ["SYSTEM_PROMPT", "PRIVATE_MEMORY", "OPENAI_API_KEY"]
  },
  "output": {
    "directory": "./results"
  }
}
```

## Current suites

### `prompt-injection`

Baseline probes for:
- hidden prompt disclosure
- developer instruction disclosure
- urgency-based override attempts

### `memory-leakage`

Baseline probes for:
- private memory disclosure
- prior chat/context leakage
- debug-dump style exfiltration attempts

## Verification

Run the built-in memory leakage verification script:

```bash
npm run verify:memory-leakage
```

This starts a deliberately vulnerable mock target and confirms the harness can detect leakage of markers like:
- `OPENAI_API_KEY`
- `SYSTEM_PROMPT`
- `PRIVATE_MEMORY`

## How other agents should use this repo

If you are another coding or research agent, follow this workflow:

1. read `README.md`
2. inspect `package.json` scripts
3. start from `src/cli/index.js`
4. keep suite logic isolated in `src/suites/`
5. keep target-specific logic isolated in `src/adapters/`
6. treat generated artifacts as evidence, not prose decoration
7. do not claim a suite is complete until it has been verified on a mock or real target

### Agent contribution contract

When adding a new suite:
- add the suite file under `src/suites/`
- wire it into `src/cli/index.js`
- add any new schema fields if needed
- provide a verification path (mock target or reproducible local target)
- update this README with:
  - what the suite tests
  - how to run it
  - what success/failure looks like

## Deployment guidance

This repo is currently CLI-first.

For now, "deploying" it usually means one of these:

### Local dev / CI usage
- run the harness as a Node CLI in CI
- point it at a preview deployment or local dev server
- archive the `results/` artifacts

### Hosted target testing
- deploy your app however you normally deploy it
- set `baseUrl` in `harness.config.json` to the hosted endpoint
- run the harness from a trusted machine or CI worker with network access to that endpoint

### Recommended first deployment pattern
- keep the harness separate from the app being tested
- run it in CI or a security-check job
- store report artifacts as build outputs

## Project structure

```text
src/
├── adapters/         # how the harness talks to targets
├── cli/              # command entrypoint
├── config/           # config loading / starter generation
├── reports/          # report + evidence artifact generation
├── schemas/          # config/result schemas
└── suites/           # security test suites

examples/
└── vulnerable-openclaw-app/

scripts/
└── verify-memory-leakage.mjs
```

## Design principles

- **Harness > prompt tweaks**: improve execution layers, not just wording
- **Verified output > generated text**: tests and artifacts decide what is real
- **Evidence matters**: findings should include markers, previews, and remediation
- **Keep the target contract simple**: small adapter surface, strong reporting

## Roadmap

Near-term:
- implement `unsafe-action-suggestion`
- implement `policy-bypass`
- add `compare`
- add a stronger quickstart for CI usage
- add a second verification script for prompt injection

## License

AGPL-3.0 for the public core.
