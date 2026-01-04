---
description: Deep architectural and security lint review
---

# Deep Lint Workflow

This workflow performs a comprehensive architectural and security review that goes beyond traditional linters.

## What This Lint Checks

Unlike ESLint or Prettier, this deep lint focuses on:
- **Architectural violations** (layer boundaries, responsibility leakage)
- **Security vulnerabilities** (hardcoded credentials, authorization gaps, input validation)
- **Logic flaws** (race conditions, state management issues, error handling)
- **Complexity & maintainability** (cognitive load, testability)
- **Documentation gaps** (missing intent, misleading comments)

## How to Run

Simply invoke:
```
/lint
```

The AI will:
1. Analyze currently open files and related context
2. Identify issues traditional linters cannot catch
3. Generate a detailed report with:
   - Severity ratings (Blocker/High/Medium/Low)
   - Exploit paths for security issues
   - Before/after diffs for fixes
   - Verification steps
   - Lessons learned

## Output

The lint report will be saved to the artifacts directory as `lint_report.md` and includes:
- **Summary** of highest-impact issues
- **Issues checklist** with severity, location, and recommendations
- **Proposed fixes** with unified diffs
- **Verification steps** to validate changes
- **Lessons learned** to prevent future issues

## When to Use

Run `/lint` when:
- Before major deployments
- After implementing authentication/authorization
- When debugging complex state management
- During security reviews
- When onboarding new team members (to document architectural decisions)

## Scope

The lint will analyze:
- Currently open files in your editor
- Related files discovered through imports/references
- API endpoints and middleware
- Authentication and authorization flows
