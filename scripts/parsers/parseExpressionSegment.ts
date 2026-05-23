import {
  cleanMarkdownInline,
  createImportedSource,
  getLevelForLesson,
  hasJapaneseText,
  stableHash,
  stripMarkdownCode
} from "../lib/japaneseNoteUtils";
import type {
  ImportedExpressionItem,
  ImportedSentenceItem,
  LessonSegment
} from "../types";

type ExpressionCandidate = {
  japanese: string;
  reading?: string;
  meaning: string;
  rawText: string;
  lineNumber: number;
};

const splitMarkdownTableCells = (line: string): string[] => {
  const cells = line.split("|").map((cell) => cell.trim());

  if (cells[0] === "") {
    cells.shift();
  }

  if (cells[cells.length - 1] === "") {
    cells.pop();
  }

  return cells;
};

const isSeparatorRow = (cells: string[]): boolean =>
  cells.every((cell) => /^:?-{2,}:?$/.test(cell.trim()));

const parseJapaneseCell = (value: string) => {
  const codeTerms = [...value.matchAll(/`([^`]+)`/g)]
    .map((match) => cleanMarkdownInline(match[1]))
    .filter(Boolean);
  const parentheticalTerms = [...value.matchAll(/[（(]([^()（）]+)[）)]/g)]
    .map((match) => stripMarkdownCode(match[1]))
    .filter((term) => hasJapaneseText(term));
  const reading = codeTerms[0];
  const expression = parentheticalTerms.find((term) => term !== reading) ?? reading;

  return {
    expression: expression ?? stripMarkdownCode(value),
    reading:
      reading && expression && expression !== reading && hasJapaneseText(expression)
        ? reading
        : undefined
  };
};

const parseTableCandidates = (segment: LessonSegment): ExpressionCandidate[] => {
  const lines = segment.rawMarkdown.split(/\r?\n/);
  const candidates: ExpressionCandidate[] = [];
  let inSentenceTable = false;

  for (const [lineIndex, line] of lines.entries()) {
    if (!line.includes("|")) {
      inSentenceTable = false;
      continue;
    }

    const cells = splitMarkdownTableCells(line);

    if (cells.includes("句子") && cells.includes("解释")) {
      inSentenceTable = true;
      continue;
    }

    if (!inSentenceTable || isSeparatorRow(cells)) {
      continue;
    }

    const pairs = cells.length >= 4 ? [[0, 1], [2, 3]] : [[0, 1]];

    for (const [expressionIndex, meaningIndex] of pairs) {
      const expressionCell = cells[expressionIndex];
      const meaningCell = cells[meaningIndex];

      if (!expressionCell || !meaningCell) {
        continue;
      }

      const parsed = parseJapaneseCell(expressionCell);

      candidates.push({
        japanese: parsed.expression,
        reading: parsed.reading,
        meaning: stripMarkdownCode(meaningCell),
        rawText: line.trim(),
        lineNumber: segment.lineStart + lineIndex
      });
    }
  }

  return candidates;
};

const parseBulletCandidates = (segment: LessonSegment): ExpressionCandidate[] =>
  segment.rawMarkdown.split(/\r?\n/).flatMap((line, lineIndex) => {
    const match = line.match(/^\s*[-*]\s+(.+?)[：:]\s*(.+)$/);

    if (!match) {
      return [];
    }

    const parsed = parseJapaneseCell(match[1]);

    return [
      {
        japanese: parsed.expression,
        reading: parsed.reading,
        meaning: stripMarkdownCode(match[2]),
        rawText: line.trim(),
        lineNumber: segment.lineStart + lineIndex
      }
    ];
  });

const isCompleteSentence = (value: string): boolean =>
  /[。？！?]$/.test(value) ||
  /(です|ます|ません|ました|でした|ください|でしょうか|します|あります|います|か)$/.test(
    value
  );

const getExpressionCategory = (
  expression: string
): ImportedExpressionItem["category"] => {
  if (/こんにちは|すみません|はじめまして|よろしく|ありがとう|こちらこそ/.test(expression)) {
    return "寒暄";
  }

  if (/ください|お願いします|わかりません|どうぞ/.test(expression)) {
    return "固定表达";
  }

  return "短语";
};

export const parseExpressionSegment = (
  segment: LessonSegment
): Array<ImportedExpressionItem | ImportedSentenceItem> => {
  const candidates = [
    ...parseTableCandidates(segment),
    ...parseBulletCandidates(segment)
  ].filter((candidate) => candidate.japanese && candidate.meaning);
  const expressionItems: Array<ImportedExpressionItem | ImportedSentenceItem> = [];
  let expressionCount = 0;
  let sentenceCount = 0;

  for (const candidate of candidates) {
    const source = createImportedSource({
      segment,
      rawText: candidate.rawText,
      lineStart: candidate.lineNumber,
      lineEnd: candidate.lineNumber
    });
    const hash = stableHash(
      `${segment.sourceFileId}:${segment.textbookLesson}:${candidate.rawText}:${candidate.japanese}`
    );
    const level = getLevelForLesson(segment.textbookLesson);
    const base = {
      level,
      textbookBook: segment.textbookBook,
      textbookLesson: segment.textbookLesson,
      unitId: segment.unitId,
      source,
      publishStatus: "private_only" as const,
      importStatus: "imported" as const,
      hash,
      importHash: hash,
      sourceText: candidate.rawText
    };

    if (isCompleteSentence(candidate.japanese)) {
      sentenceCount += 1;
      expressionItems.push({
        ...base,
        id: `sentence-jnote-sbj2-${String(segment.textbookLesson ?? 0).padStart(
          2,
          "0"
        )}-${String(sentenceCount).padStart(3, "0")}`,
        type: "sentence",
        japanese: candidate.japanese,
        reading: candidate.reading,
        chinese: candidate.meaning,
        tags: segment.textbookLesson ? [`第${segment.textbookLesson}课`] : []
      });
    } else {
      expressionCount += 1;
      expressionItems.push({
        ...base,
        id: `expression-sbj2-${String(segment.textbookLesson ?? 0).padStart(
          2,
          "0"
        )}-${String(expressionCount).padStart(3, "0")}`,
        type: "expression",
        expression: candidate.japanese,
        reading: candidate.reading,
        meaning: candidate.meaning,
        category: getExpressionCategory(candidate.japanese)
      });
    }
  }

  return expressionItems;
};
