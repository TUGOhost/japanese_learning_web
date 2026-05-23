# Repository Guidelines

## Project Structure & Module Organization

This is a React + Vite + TypeScript static app for Japanese learning. Core entry points are `src/main.tsx` and `src/App.tsx`, which handle the app shell and hash-based routing. Page-level screens live in `src/pages`, reusable UI in `src/components`, stateful learning hooks in `src/hooks`, shared logic and storage helpers in `src/lib`, curriculum helpers in `src/utils`, typed models in `src/types`, and lesson content in `src/data`. Test setup is in `src/test/setup.ts`. Tailwind styles start in `src/index.css`; production output goes to `dist` and should not be edited directly.

## Build, Test, and Development Commands

- `npm install`: install dependencies from `package-lock.json`.
- `npm run dev`: start the local Vite development server.
- `npm run build`: run TypeScript project checks, then build the static site into `dist`.
- `npm run preview`: serve the production build locally for verification.
- `npm test`: run the Vitest suite once.

## Coding Style & Naming Conventions

Use TypeScript, React function components, 2-space indentation, double quotes, and semicolons, matching the existing source. Prefer named exports for components, hooks, utilities, and data. Name components and pages in `PascalCase` such as `LessonDetailPage.tsx`; hooks use `useSomething.ts`; tests use `*.test.ts`. Keep pure calculations in `src/lib` or `src/utils`, and keep large learning datasets in `src/data` rather than embedding them in components.

## Testing Guidelines

Tests use Vitest with the `jsdom` environment and `@testing-library/jest-dom` configured through `src/test/setup.ts`. Existing tests are colocated with the logic they cover, for example `src/lib/quizEngine.test.ts` and `src/utils/curriculum.test.ts`. Add focused tests for new quiz, progress, storage, filtering, or curriculum behavior. Run `npm test` before submitting changes; run `npm run build` when TypeScript types or app wiring change.

## Commit & Pull Request Guidelines

This checkout does not include a `.git` directory, so local commit history is unavailable for convention discovery. Use short, imperative commit subjects such as `Add lesson progress filters` or `Fix quiz accuracy calculation`. Pull requests should include a brief summary, test results, linked issues when applicable, and screenshots or screen recordings for UI changes. Call out changes to `localStorage` keys, curriculum ordering, or lesson data schemas.

## Security & Configuration Tips

The app stores learning progress in browser `localStorage` and has no backend. Do not commit `.env`, `.env.local`, generated `dist` files, or copied textbook content beyond short original examples.
