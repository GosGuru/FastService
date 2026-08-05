# Code health and dependency security cleanup

## Problem and outcome

The repository-wide lint gate reports 13 errors and 15 warnings, while
`npm audit` reports seven vulnerable dependency packages. The project should
have clean static checks and a lockfile resolved to patched dependency versions
without changing product behavior.

## Goals

- Remove every current ESLint error and warning by deleting dead code and using
  safe `unknown`-based type narrowing instead of `any`.
- Upgrade dependencies only within compatible, non-forced ranges required to
  resolve the current audit findings.
- Preserve the public content fallback and all existing application behavior.

## Non-goals

- Refactoring the admin translation workflow beyond type safety.
- Adding new features, deploying, or changing production configuration.
- Using `npm audit fix --force` or accepting a breaking major upgrade.

## Current-state evidence

- `npm run lint`: 13 errors and 15 warnings.
- `npm audit`: 7 affected packages (1 low, 6 high), including the direct Next.js
  dependency and transitive build/runtime packages.
- `npm audit fix --dry-run` proposes compatible updates, including Next.js
  16.3.0, without a forced major-version change.

## Requirements and acceptance criteria

- `npm run lint` exits successfully with zero warnings and zero errors.
- `npm audit` reports zero known vulnerabilities.
- `npm run build` succeeds.
- Representative public catalog routes continue rendering expected content.
- Dependency changes are limited to `package.json`/lockfile resolution and do
  not use forced upgrades.

## Test strategy

- Run lint, audit, and production build.
- Run a local production-server smoke test for collection and detail routes.
- Review the complete diff and lockfile/package changes.

## Rollout and rollback

- A normal application deployment is required after review; none is performed
  by this change.
- Revert the code and dependency lockfile changes together to roll back.

## Decision log

- Prefer explicit runtime narrowing over disabling ESLint rules.
- Use the package manager's compatible audit fix; never use `--force`.

## Verification evidence

- `npm run lint`: passed with zero warnings and zero errors.
- `npm audit --audit-level=low`: zero vulnerabilities.
- `npm run build`: passed on Next.js 16.3.0 and generated 193 pages.
- Local production smoke: representative collection, boat, vehicle, and
  water-toy detail routes returned HTTP 200 with their expected content.
