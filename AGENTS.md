# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Guyu is an AI-powered plant care assistant with a full-stack architecture. The system analyzes plant images to identify species, assess health status, and provide personalized daily care recommendations based on weather, species data, and care history.

## Architecture

The codebase follows a hexagonal architecture with clear separation of concerns:

- **`agent-layer/`** - Core domain logic and AI agent implementation as a standalone TypeScript package. Contains schemas for all domain models (PlantProfile, DailyAdvice, PlantStateAssessment), capability implementations for the three core services, vision API providers, and the PlantAgent orchestrator.
- **`web/`** - Next.js 15 frontend application with App Router, TypeScript, and Tailwind CSS.
- **`be/`** - Backend API and server code (currently minimal implementation).
- **`docs/`** - Project documentation including PRDs, frontend plans, and research notes.
- **`experiments/hunyuan-3d/`** - Independent Hunyuan 3D research console, assets, and sample data.

### Core Domain Services

The system implements three domain modules as defined in `agent-layer/docs/docs/design/overall-blueprint.md`:

1. **Plant Profile Service** (`agent-layer/src/capabilities/analyzeProfile.ts`) - Identifies plants from images and generates structured `PlantProfileDraft` for user confirmation
2. **Daily Advice Service** (`agent-layer/src/capabilities/generateDailyAdvice.ts`) - Generates personalized care recommendations based on plant profile, weather, and care history
3. **Plant State Assessment Service** (`agent-layer/src/capabilities/assessState.ts`) - Analyzes plant images to assess health status

### Key Architectural Principles

- Deterministic workflows, not autonomous agents
- Plant species facts are only produced by the profile service
- Daily advice and state assessment services consume facts but don't redefine species
- Rules take precedence over generation; LLMs handle text only
- All modules are degradable, auditable, replayable, and versioned
- Strong typing with Zod schemas across all domain models

## Development Commands

### Agent Layer

Navigate to `agent-layer/` first:

```bash
cd agent-layer
npm run build          # Compile TypeScript to dist/
npm run typecheck      # Type check without emitting
npm test               # Run all tests with Vitest
npm run test:watch     # Run tests in watch mode
npm run cli            # Run the CLI tool
```

### Frontend (`web/`)

```bash
cd web
npm run dev            # Start development server
npm run build          # Build for production
npm start              # Start production server
npm run lint           # Run ESLint
```

### Next.js Notes

This project uses **Next.js 15 with the App Router**, which has breaking changes from earlier versions. Before writing Next.js code, review the relevant guide in `node_modules/next/dist/docs/` and pay attention to deprecation notices.

## Testing

The agent layer includes a comprehensive test suite using Vitest. Tests are located in `agent-layer/tests/`.

The fake vision provider (`agent-layer/src/providers/fake.ts`) allows local testing without external API calls.

## Data Models

All domain schemas are defined in `agent-layer/src/schemas/`:

- `profile.ts` - PlantProfile, PlantProfileDraft schemas
- `advice.ts` - DailyAdvice schema
- `assessment.ts` - PlantStateAssessment schema
- `inputs.ts` - Input types for capabilities
- `envelopes.ts` - Response envelope types
- `enums.ts` - Shared enumerations
- `primitives.ts` - Primitive type definitions

The taxonomy catalog with species data is in `agent-layer/src/taxonomy/catalog.ts`.

## Tech Stack

| Component | Technology |
|-----------|------------|
| Agent Layer | TypeScript, Zod, Vitest |
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| Vision API | Multi-modal LLM with fake test provider |
| Validation | Zod schemas |
| Testing | Vitest |
