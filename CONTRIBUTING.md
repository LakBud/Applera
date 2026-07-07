# Contributing to Applera

Thank you for helping improve Applera! This repository is a pnpm monorepo with a React frontend, Express backend, and shared TypeScript schema package.

## Get started

1. Fork the repository or clone the main repo.
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Start development locally:
   ```bash
   pnpm dev
   ```

## Repo structure

- `apps/client/` — React frontend application
- `apps/server/` — Express backend API
- `packages/schemas/` — shared TypeScript schemas and types

## Branches and workflow

- Use feature branches for changes: `feature/<description>` or `fix/<description>`.
- Keep commits small and focused.
- Rebase or squash before opening a pull request when appropriate.

## Code style

This repository uses:

- `oxfmt` for formatting
- `oxlint` for linting
- TypeScript for type safety

Run formatting and lint checks before committing:

```bash
pnpm format
pnpm lint
pnpm typecheck
```

## Testing

Run tests with:

```bash
pnpm test
```

You can also target specific workspaces:

```bash
pnpm test:client
pnpm test:server
pnpm test:unit
pnpm test:integration
```

## CI/CD & Code Quality

The project uses automated checks to maintain code quality and prevent regressions before changes are merged.

### Continuous Integration

Every pull request is validated through automated workflows that run:

- **Type checking** — Ensures type safety across the monorepo
- **Linting** — Enforces consistent code quality and style rules
- **Testing** — Verifies application behavior
- **Dependency and code analysis** — Detects potential issues before deployment

### Pull Request Reviews

- **CodeRabbit** is used for automated pull request reviews, providing AI-assisted feedback on:
  - Code quality improvements
  - Potential bugs
  - Maintainability issues
  - Best practice recommendations

## Commit hooks

Husky is enabled via the `prepare` script and lint-staged runs on staged files.

## Pull requests

- Open a PR against `main`.
- Describe your changes clearly.
- Reference relevant issues when applicable.
- Include test coverage or steps to reproduce.

## Contributions

Feel free to contribute bug fixes, documentation improvements, or new features.
If you're adding a new endpoint, update the server and any frontend integration points.
If you're changing shared types, keep `packages/schemas/` in sync with both apps.
