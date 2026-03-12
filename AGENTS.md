# AGENTS.md — AGI.security OpenClaw Harness

This repo should be easy for another agent to pick up and extend without guesswork.

## What this repo is

A CLI-first security harness for OpenClaw-style apps.

Current core loop:
1. load config
2. run suite probes against an HTTP target
3. inspect responses for leakage / unsafe behavior signals
4. write structured artifacts

## Current truth state

DONE:
- `init`
- `run`
- HTTP target adapter
- `prompt-injection` suite
- `memory-leakage` suite
- structured report artifacts
- memory-leakage verification script

NOT DONE:
- `compare`
- `unsafe-action-suggestion`
- `policy-bypass`
- polished CI/deployment helpers

Do not describe placeholder items as complete.

## Where to work

- CLI routing: `src/cli/index.js`
- target invocation: `src/adapters/httpTarget.js`
- suites: `src/suites/*.js`
- config loading: `src/config/*`
- report generation: `src/reports/*`
- examples: `examples/`
- verification scripts: `scripts/`

## Contribution rules

### 1) Keep layers separate
- suite logic belongs in `src/suites/`
- adapter logic belongs in `src/adapters/`
- reporting logic belongs in `src/reports/`
- avoid mixing transport, evaluation, and formatting in one file unless tiny

### 2) Verification is required
A new suite is not done until there is a reproducible verification path.
That can be:
- a mock vulnerable target
- a deterministic local script
- a clearly documented real target flow

### 3) Evidence over vibes
If a suite finds something, capture:
- which probe triggered it
- which marker or phrase matched
- a response preview
- a remediation suggestion

### 4) Preserve a simple target contract
The current HTTP adapter sends:
- `input`
- `message`
- `prompt`

Keep compatibility broad unless there is a strong reason to narrow it.

### 5) Public-alpha bias
Optimize for clarity and credibility over premature complexity.
A smaller real harness is better than a larger fake one.

## Good next tasks
- add `unsafe-action-suggestion`
- add `policy-bypass`
- implement `compare`
- add CI examples
- add prompt-injection verification script
- tighten schema validation

## Release hygiene
Before public claims or pushes:
- make sure README matches reality
- make sure any newly claimed suite has a real verification path
- do not leave placeholder text that sounds finished
