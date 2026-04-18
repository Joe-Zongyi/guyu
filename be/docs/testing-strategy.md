# Testing Strategy

## Overview

The backend uses a two-tier testing approach to balance **speed / stability** (development) with **real-world validation** (production readiness).

| Suite | Location | Provider | Trigger | Purpose |
|-------|----------|----------|---------|---------|
| Integration tests | `test/e2e/` | Fake | `npm test` | Fast, deterministic, zero-cost |
| Real-API E2E tests | `test/real-api/` | Real cloud | Manual only | Validate provider config & contracts |

---

## 1. Integration Tests (`test/e2e/`)

### Why Fake Providers?

- **Speed**: 65 tests finish in ~2 seconds vs. 60+ seconds with cloud APIs.
- **Determinism**: `FakeVisionProvider` returns predictable results based on `file_id` keywords (`blurry`, `noplant`, `wilt`, etc.).
- **Zero cost**: No API quota consumption, no surprise bills.
- **No network flakiness**: Tests pass offline.

### How It Works

`test/test-setup.ts` is loaded by Jest before any test file. It forces:

```ts
process.env.PLANT_AGENT_VISION_PROVIDER = 'fake';
process.env.PLANT_AGENT_IMAGE_GENERATION_PROVIDER = 'fake';
```

This overrides whatever is in `.env.development`, ensuring the test suite always uses fake providers regardless of local environment configuration.

### Running

```bash
npm test
# or explicitly
NODE_OPTIONS=--experimental-vm-modules npx jest --config jest.config.cjs test/e2e/
```

---

## 2. Real-API End-to-End Tests (`test/real-api/`)

### When to Run

- After rotating API keys.
- After changing provider config (model, base URL, etc.).
- Before a demo or release, to verify the full pipeline.
- When debugging provider-specific issues.

### How It Works

`jest.real-api.config.cjs` does **not** load `test/test-setup.ts`, so the environment variables from `.env.development` / `.env` are respected.

Tests use **public image URLs** (Unsplash) so the vision provider can actually download and analyze images.

### Running

```bash
# Ensure .env.development has valid API keys
NODE_OPTIONS=--experimental-vm-modules npx jest \
  --config jest.real-api.config.cjs \
  --runInBand
```

> `--runInBand` is recommended because real APIs often have concurrent rate limits.

### Rate Limit Handling

Real-API tests are written defensively:

```ts
if (response.body.status === 'failed') {
  console.warn('Real API failed:', response.body);
}
// assertions only run when the call succeeded
```

If you hit rate limits (e.g. OpenRouter free tier), the test logs the error but does not crash.

---

## 3. Environment Configuration Summary

| File | Purpose |
|------|---------|
| `.env.development` | Local dev server + real-API E2E tests |
| `test/test-setup.ts` | Forces fake providers for `jest.config.cjs` |
| `jest.config.cjs` | Integration test config (loads setup file) |
| `jest.real-api.config.cjs` | Real-API test config (no setup override) |

---

## 4. Checklist

### Before committing code
- [ ] `npm test` passes (all 65 integration tests).
- [ ] `npm run lint` passes.

### Before a demo / release
- [ ] `npm test` passes.
- [ ] Real-API E2E tests pass (run manually with `jest.real-api.config.cjs`).
- [ ] Verify `.env.development` points to the correct provider.

### Troubleshooting

### Test Coverage

| Endpoint | Provider Type | Test File |
|----------|--------------|-----------|
| `POST /v1/plants/profile/analyze` | Vision (real) | `real-provider.e2e.spec.ts` |
| `POST /v1/plants/state/assess` | Vision (real) | `real-provider.e2e.spec.ts` |
| `POST /v1/plants/daily-advice/generate` | Text-only (no vision) | `real-provider.e2e.spec.ts` |
| `POST /v1/plants/pixel-art/generate` | **Image generation (real)** | `real-provider.e2e.spec.ts` |

### Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| `PROVIDER_UNAVAILABLE` in integration tests | `test-setup.ts` not loaded | Check `jest.config.cjs` has `setupFiles` pointing to `test/test-setup.ts` |
| `PROVIDER_UNAVAILABLE` in real-API tests | Invalid / expired API key | Verify key in `.env.development` |
| `429 Rate limit exceeded` | Free tier quota exhausted | Wait for quota reset, upgrade plan, or switch provider |
| Tests timeout (120s+) | Slow cloud API | Normal for real providers; increase `--testTimeout` if needed |
