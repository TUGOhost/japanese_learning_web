# Textbook Elementary Content Design

## Goal

Populate the existing Japanese learning app with structured vocabulary and grammar for
`标准日本语第二版初级` lessons 1-48. Content should appear automatically on each existing
lesson detail page through the current `unitId` lookup path.

## Scope

The first implementation covers only elementary textbook units:

- 初级上: lessons 1-24
- 初级下: lessons 25-48
- Vocabulary from `Japanese_Note/新版标准日本语初级词汇表_上册.md`
- Vocabulary from `Japanese_Note/新版标准日本语初级词汇表_下册.md`
- Grammar from `Japanese_Note/新版标准日本语初级语法总结_上册.md`
- Grammar from `Japanese_Note/新版标准日本语初级语法总结_下册.md`

Intermediate, advanced, extra word accumulation notes, quizzes, and sentence pattern
expansion are out of scope for this pass.

## Content Policy

The repository README warns against copying large textbook passages. The implementation
will avoid raw long-form textbook replication:

- Vocabulary entries may use the compact word, reading, part of speech, and meaning data
  already present in local notes.
- Grammar entries will be short structured learning summaries, not full original Markdown
  sections.
- Examples will be limited to short examples needed for the existing card UI.

## Architecture

Add separate data modules instead of expanding the existing seed files directly:

- `src/data/textbookElementaryVocabulary.ts`
- `src/data/textbookElementaryGrammar.ts`

Then update:

- `src/data/vocabulary.ts` to include elementary textbook vocabulary in `allVocabulary`.
- `src/data/grammar.ts` to include elementary textbook grammar in `grammar`.

This keeps the existing page and progress logic unchanged. `LessonDetailPage` already
filters vocabulary and grammar by `unitId`, so any imported entry with
`unit-sbj2-shokyu-N` will appear in the matching lesson.

## Data Shape

Each vocabulary item will include:

- Stable id: `vocab-sbj2-XX-NNN`
- `word`, `kana`, `meaning`, `partOfSpeech`
- `level`: `N5` for earlier elementary content and `N4` where the later elementary
  lesson clearly exceeds N5 basics
- `source`: `标准日本语第二版初级`
- `textbookBook`: `初级上` or `初级下`
- `textbookLesson`: 1-48
- `unitId`: `unit-sbj2-shokyu-N`
- `isCore`: `true`
- `tags`: `["第N课"]`
- Generated example fields when no original short example is appropriate

Each grammar item will include:

- Stable id: `grammar-sbj2-XX-NNN`
- `title`, `category`, `structure`, `meaning`, `explanation`
- At least one short example
- The same textbook metadata fields as vocabulary

## Parsing Strategy

Use a small local parser script during implementation to convert the Markdown notes into
draft TypeScript data. The parser will:

- Split files by `### 第N课` headings.
- Parse vocabulary table rows with two entries per row.
- Normalize inline forms like `` `きょうしつ` (教室) `` into `kana: "きょうしつ"` and
  `word: "教室"`.
- Keep kana-only or katakana-only words as both `word` and `kana` when no kanji form is
  present.
- Convert note word classes such as `名`, `動1`, `形1`, `副`, `疑`, `专` into display labels.
- Extract numbered grammar structures from each lesson and summarize them into the
  current `GrammarItem` fields.

The generated output should still be reviewed for malformed entries before being used.

## Error Handling

No runtime parsing is planned, so malformed content should be caught at test/build time.
The UI should keep using the existing empty-state cards if any lesson remains without
content.

## Testing

Add focused data integrity tests that verify:

- Lessons 1-48 each have at least one vocabulary item.
- Lessons 1-48 each have at least one grammar item.
- Vocabulary ids are unique across `allVocabulary`.
- Grammar ids are unique across `grammar`.
- Elementary textbook entries have matching `unitId`, `textbookLesson`, and
  `textbookBook`.

Run `npm test` and `npm run build` after implementation.

## Open Decisions

The first pass will prioritize complete lesson coverage and correct metadata over richer
examples, quizzes, or sentence-pattern generation. Those can be added after the
structured data is in place.
