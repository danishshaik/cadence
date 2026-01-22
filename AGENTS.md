# Repository Guidelines

## Project Structure & Module Organization
- `app/` holds the Expo Router file-based routes; edit screens like `app/index.tsx` and update layout in `app/_layout.tsx`.
- `app-example/` contains the starter template after running `npm run reset-project`.
- `assets/images/` stores app icons, splash assets, and other static images used by Expo.
- `app.json` configures the Expo app metadata and platform settings.
- `expo-env.d.ts` and `tsconfig.json` define TypeScript settings, including strict mode and the `@/*` path alias.
- `eslint.config.js` configures linting via `eslint-config-expo`.

## Build, Test, and Development Commands
- `npm install`: install dependencies.
- `npm run start`: start the Expo dev server with interactive tooling.
- `npm run android`: start and open the Android emulator.
- `npm run ios`: start and open the iOS simulator.
- `npm run web`: start the web build for browser testing.
- `npm run lint`: run Expo’s ESLint configuration.
- `npm run reset-project`: move the starter code into `app-example/` and create a fresh `app/`.

## Coding Style & Naming Conventions
- Use TypeScript and React function components; keep logic colocated with routes in `app/`.
- Follow existing formatting: 2-space indentation and double quotes in TS/TSX files.
- Name components in `PascalCase` and route files in lowercase (per Expo Router conventions).
- Prefer absolute imports with the `@/` alias where it improves readability.

## Testing Guidelines
- No automated test framework or coverage requirements are configured yet.
- Validate changes with `npm run start` and test on Expo Go, simulators, or the web target.
- If adding tests, document the framework and new scripts in `package.json`.

## Commit & Pull Request Guidelines
- There is no existing Git history; use short, imperative commit subjects (optionally with a scope, e.g., `feat: add settings screen`).
- PRs should include a concise summary, a list of manual checks run, and screenshots or recordings for UI changes.
