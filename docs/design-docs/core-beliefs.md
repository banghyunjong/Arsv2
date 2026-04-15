# Core Beliefs — ARSV2

## 1. If the agent can't see it, it doesn't exist

All critical knowledge lives in the repository as machine-readable markdown. Slack conversations, verbal agreements, and external docs are invisible to agents and future contributors. Encode or lose it.

## 2. Dependency direction is sacred

`Types → Config → Repo → Service → Runtime → UI` — always downward, never upward. This is mechanically enforced, not culturally expected. Violations break the build.

## 3. Fixes are cheap, waiting is expensive

Ship small, iterate fast. Short PR lifespans enable rapid feedback. Test flakes get follow-up automation, not merge blocks.

## 4. Entropy is a tax, not a crisis

Technical debt accrues daily. Pay it daily. Golden principles encoded in linters catch drift before it compounds. One-minute review refactoring PRs beat quarterly cleanup sprints.

## 5. Boring technology wins

Choose tools with strong API stability and substantial documentation. Custom reimplementation of small utilities beats pulling in large external dependencies with unknown edge cases.

## 6. Structured feedback over manual oversight

Lint errors contain remediation instructions. CI failures explain what to fix. The system teaches agents (and humans) how to correct mistakes, reducing the need for manual code review.

## 7. Design the environment, not the implementation

Human engineers specify intent, set constraints, and provide feedback. Agents handle execution and iteration within those guardrails.
