# Textbook Elementary Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add structured vocabulary and grammar for `标准日本语第二版初级` lessons 1-48 so existing lesson detail pages show real lesson content.

**Architecture:** Generate focused TypeScript data modules from the local `Japanese_Note` elementary Markdown files, then merge those modules into the existing vocabulary and grammar exports. Keep UI and progress logic unchanged because lesson pages already resolve content by `unitId`.

**Tech Stack:** React + Vite + TypeScript static app, Vitest for data integrity tests, Node.js script for local Markdown-to-TypeScript generation.

---

### Task 1: Data Integrity Tests

**Files:**
- Create: `src/data/textbookElementaryContent.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";

import { grammar } from "./grammar";
import { allVocabulary } from "./vocabulary";

const elementaryLessons = Array.from({ length: 48 }, (_, index) => index + 1);

const getBookForLesson = (lesson: number) =>
  lesson <= 24 ? "初级上" : "初级下";

describe("textbook elementary content", () => {
  it("provides vocabulary for every elementary textbook lesson", () => {
    for (const lesson of elementaryLessons) {
      const items = allVocabulary.filter(
        (item) =>
          item.source === "标准日本语第二版初级" &&
          item.textbookLesson === lesson &&
          item.unitId === `unit-sbj2-shokyu-${lesson}`
      );

      expect(items.length, `lesson ${lesson}`).toBeGreaterThan(0);
      expect(items.every((item) => item.textbookBook === getBookForLesson(lesson))).toBe(
        true
      );
    }
  });

  it("provides grammar for every elementary textbook lesson", () => {
    for (const lesson of elementaryLessons) {
      const items = grammar.filter(
        (item) =>
          item.source === "标准日本语第二版初级" &&
          item.textbookLesson === lesson &&
          item.unitId === `unit-sbj2-shokyu-${lesson}`
      );

      expect(items.length, `lesson ${lesson}`).toBeGreaterThan(0);
      expect(items.every((item) => item.textbookBook === getBookForLesson(lesson))).toBe(
        true
      );
    }
  });

  it("keeps generated textbook ids unique", () => {
    const vocabularyIds = allVocabulary.map((item) => item.id);
    const grammarIds = grammar.map((item) => item.id);

    expect(new Set(vocabularyIds).size).toBe(vocabularyIds.length);
    expect(new Set(grammarIds).size).toBe(grammarIds.length);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/data/textbookElementaryContent.test.ts`

Expected: FAIL because lessons after the current demo content do not yet have vocabulary or grammar.

### Task 2: Markdown Generator

**Files:**
- Create: `tools/generateTextbookElementaryData.mjs`
- Create by script: `src/data/textbookElementaryVocabulary.ts`
- Create by script: `src/data/textbookElementaryGrammar.ts`

- [ ] **Step 1: Create the generator script**

The script must:

- Read four elementary Markdown source files from `Japanese_Note`.
- Split content by `### 第N课`.
- Parse six-column vocabulary tables.
- Parse top-level grammar bullets that start with `&emsp;&emsp;N.`.
- Generate stable ids that do not collide with existing demo ids.
- Write TypeScript modules with named exports:
  - `textbookElementaryVocabulary`
  - `textbookElementaryGrammar`

- [ ] **Step 2: Run the generator**

Run: `node tools/generateTextbookElementaryData.mjs`

Expected: the script writes the two TypeScript data modules and reports nonzero vocabulary and grammar counts.

### Task 3: Wire Data Modules

**Files:**
- Modify: `src/data/vocabulary.ts`
- Modify: `src/data/grammar.ts`

- [ ] **Step 1: Import and merge generated vocabulary**

In `src/data/vocabulary.ts`, import:

```ts
import { textbookElementaryVocabulary } from "./textbookElementaryVocabulary";
```

Then include it in `allVocabulary` before `n3Vocabulary`:

```ts
export const allVocabulary: VocabularyItem[] = [
  ...beginnerVocabulary,
  ...textbookDemoVocabulary,
  ...textbookElementaryVocabulary,
  ...n3Vocabulary
];
```

- [ ] **Step 2: Import and merge generated grammar**

In `src/data/grammar.ts`, import:

```ts
import { textbookElementaryGrammar } from "./textbookElementaryGrammar";
```

Then export:

```ts
export const grammar: GrammarItem[] = [
  ...baseGrammar,
  ...textbookElementaryGrammar
];
```

The existing inline grammar array should be renamed to `baseGrammar` without changing its entries.

### Task 4: Verify Red-Green and Build

**Files:**
- Test: `src/data/textbookElementaryContent.test.ts`

- [ ] **Step 1: Run focused test**

Run: `npm test -- src/data/textbookElementaryContent.test.ts`

Expected: PASS with every elementary lesson covered.

- [ ] **Step 2: Run full test suite**

Run: `npm test`

Expected: PASS with all Vitest suites green.

- [ ] **Step 3: Run production build**

Run: `npm run build`

Expected: TypeScript project checks and Vite build complete successfully.
