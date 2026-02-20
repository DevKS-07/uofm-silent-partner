# Agent File Placement Guide

This repository uses a feature-first + layered architecture.
When creating or modifying code, place files using the rules below.

## Canonical Structure

```text
.
|- app/                          # Expo Router routes/screens only (thin)
|  |- (auth)/
|  |- (tabs)/
|  `- _layout.tsx
|- src/
|  |- features/                  # Domain features
|  |- services/                  # Shared integrations and clients
|  |- shared/                    # Reusable cross-feature primitives
|  |- providers/                 # App-level providers (theme, auth, query, etc.)
|  |- theme/                     # Tokens + shared style factories
|  `- config/                    # Runtime config, env parsing, feature flags
|- assets/
|- docs/
|- e2e/
`- scripts/
```

## Responsibilities by Folder

- `app/`: Routing and screen composition only. No direct API/Firebase/AI calls here.
- `src/features/<feature>/ui`: Feature-specific components/screens.
- `src/features/<feature>/hooks`: Feature-specific hooks.
- `src/features/<feature>/services`: Feature workflows that orchestrate behavior.
- `src/features/<feature>/types.ts`: Feature domain types.
- `src/features/<feature>/index.ts`: Public exports for the feature.
- `src/services/*`: Shared platform/service clients (Firebase, OpenAI, audio, telemetry).
- `src/shared/*`: Reusable utilities/components with no feature-specific business logic.
- `src/providers/*`: App-level providers and context wiring.
- `src/theme/*`: Design tokens and common style factories.
- `src/config/*`: Env schema validation and config resolution.

## Styling and Theme Rules

- Do not add global CSS files for native screens.
- Use `StyleSheet.create` and shared tokens from `src/theme/tokens.ts`.
- Put reusable layout primitives in `src/theme/common-styles.ts`.
- Access theme values through `src/providers/theme-provider.tsx`.
- Keep one-off screen styles local to the screen component.

## Strict Placement Rules

1. Do not put business logic in `app/` route files.
2. All external I/O must go through `src/services/*`.
3. Features may import from:
   - their own feature folder
   - `src/services/*`
   - `src/shared/*`
   - `src/providers/*`
   - `src/theme/*`
   - `src/config/*`
4. Features must not deep-import another feature's internals.
   Use that feature's `index.ts` public API only.
5. `src/services/*` must not import UI components.
6. Validate boundary inputs with `zod` (env, API payloads, Firestore document parsing).

## Naming Conventions

- Files: `kebab-case.ts` / `kebab-case.tsx`
- Components: `PascalCase`
- Hooks: `use-*.ts` (exported hook name `useXxx`)
- Feature entrypoint: always `index.ts`

## Test Placement

- Unit tests: colocate near source as `*.test.ts` / `*.test.tsx`
- Integration/E2E: `e2e/`

## Quick Decision Map

- "Need a Firestore query client" -> `src/services/firebase/`
- "Need AI websocket session manager" -> `src/services/ai/`
- "Need conversation scoring logic" -> `src/features/conversation/services/`
- "Need a reusable button/card" -> `src/shared/ui/`
- "Need global spacing/colors/text scale" -> `src/theme/`
- "Need onboarding screen route" -> `app/(auth)/`

When unsure, prefer feature module first, then extract to `shared` if reused.
