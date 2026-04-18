# BE Development Guidelines

## Project Overview

This is the backend API for Guyu, built with NestJS. Before writing any code, review parent project guidelines in `/CLAUDE.md`.

## Tech Stack

- **Framework**: NestJS (TypeScript)
- **Testing**: Jest (built into NestJS)
- **Validation**: class-validator, class-transformer
- **Database**: PostgreSQL (via Prisma)

## Critical: Test-Driven Development (TDD)

**This project follows strict TDD practices.**

Before implementing any feature or fixing any bug, you MUST invoke the `test-driven-development` skill. This skill enforces:

1. **Write tests first** - No production code without a failing test
2. **Watch it fail** - Verify the test fails correctly
3. **Write minimal code** - Implement just enough to pass
4. **Watch it pass** - Verify all tests pass
5. **Refactor** - Clean up while keeping tests green

### When to Apply TDD

After completing each development phase:

- ✅ **After Module Creation**: Write unit tests for the module initialization
- ✅ **After Controller Implementation**: Write tests for each endpoint
- ✅ **After Service Implementation**: Write tests for business logic
- ✅ **After DTO/Entity Definition**: Write validation tests
- ✅ **After Bug Fix**: Write a test reproducing the bug
- ✅ **After Refactoring**: Ensure existing tests still pass

### TDD Workflow

For each new feature:

```bash
# 1. Invoke the TDD skill
/test-driven-development

# 2. Write the failing test
# 3. Run tests and watch it fail
npm test -- <test-file>

# 4. Write minimal code to pass
# 5. Run tests and watch it pass
npm test

# 6. Refactor (if needed)
# 7. Run all tests
npm test
```

### Testing Structure

```
be/
├── src/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   └── auth.spec.ts          # ← Unit tests
│   ├── users/
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.module.ts
│   │   └── users.spec.ts         # ← Unit tests
│   └── e2e/
│       └── auth.e2e-spec.ts      # ← Integration tests
```

### Test Requirements

Every implementation must have:

1. **Unit Tests** - For services and business logic
2. **Controller Tests** - For endpoints and HTTP behavior
3. **Validation Tests** - For DTOs and input validation
4. **E2E Tests** - For critical user flows

## Code Quality

- Run ESLint: `npm run lint`
- Run Prettier: `npm run format`
- Type check: `npm run type-check`
- Full test suite: `npm test`

## Environment

- Development: `.env.development`
- Production: `.env.production`
- Example: `.env.example`

## Development Commands

```bash
# Development server
npm run start:dev

# Build
npm run build

# Production
npm run start:prod

# Tests
npm test
npm run test:watch
npm run test:cov
npm run test:e2e
```

## Architecture Patterns

Follow NestJS best practices:

- Use **Modules** for organizing related code
- Use **Controllers** for HTTP handling
- Use **Services** for business logic
- Use **Guards** for authentication/authorization
- Use **Pipes** for validation
- Use **Interceptors** for cross-cutting concerns

## Remember

**ALWAYS invoke `test-driven-development` before writing implementation code.**

No production code without a failing test first. This is non-negotiable.
