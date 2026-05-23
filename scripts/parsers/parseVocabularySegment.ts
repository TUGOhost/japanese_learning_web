import {
  cleanMarkdownInline,
  createImportedSource,
  getLevelForLesson,
  hasJapaneseText,
  stableHash,
  stripMarkdownCode
} from "../lib/japaneseNoteUtils";
import type { ImportedVocabularyItem, LessonSegment } from "../types";

const partOfSpeechLabels = new Map([
  ["名", "名词"],
  ["代", "代词"],
  ["疑", "疑问词"],
  ["副", "副词"],
  ["叹", "叹词"],
  ["专", "专有名词"],
  ["连体", "连体词"],
  ["接续", "接续词"],
  ["助", "助词"],
  ["形1", "一类形容词"],
  ["形2", "二类形容词"],
  ["动1", "一类动词"],
  ["动2", "二类动词"],
  ["动3", "三类动词"],
  ["動1", "一类动词"],
  ["動2", "二类动词"],
  ["動3", "三类动词"]
]);

type ParsedTerm = {
  word: string;
  kana: string;
  display: string;
  needsReview: boolean;
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

const normalizePartOfSpeech = (value: string): string => {
  const cleaned = stripMarkdownCode(value);
  return partOfSpeechLabels.get(cleaned) ?? cleaned;
};

const cleanParentheticalText = (value: string): string =>
  stripMarkdownCode(value)
    .replace(/[（）()]/g, "")
    .trim();

const parseTermCell = (cell: string): ParsedTerm => {
  const cleanedCell = cleanMarkdownInline(cell);
  const codeTerms = [...cleanedCell.matchAll(/`([^`]+)`/g)]
    .map((match) => cleanMarkdownInline(match[1]))
    .filter(Boolean);
  const parentheticalTerms = [...cleanedCell.matchAll(/[（(]([^()（）]+)[）)]/g)]
    .map((match) => cleanParentheticalText(match[1]))
    .filter(Boolean);
  const primaryCode = codeTerms[0] ?? "";
  const parentheticalWord = parentheticalTerms.find(
    (term) => hasJapaneseText(term) && !term.startsWith("~")
  );
  const rawWithoutCode = stripMarkdownCode(cleanedCell);

  if (primaryCode && parentheticalWord) {
    return {
      word: parentheticalWord,
      kana: primaryCode,
      display: parentheticalWord,
      needsReview: false
    };
  }

  if (primaryCode) {
    return {
      word: primaryCode,
      kana: primaryCode,
      display: primaryCode,
      needsReview: false
    };
  }

  return {
    word: rawWithoutCode,
    kana: "",
    display: rawWithoutCode,
    needsReview: true
  };
};

const parseVocabularyGroup = ({
  cells,
  startIndex,
  segment,
  itemIndex,
  sourceLine,
  lineNumber
}: {
  cells: string[];
  startIndex: number;
  segment: LessonSegment;
  itemIndex: number;
  sourceLine: string;
  lineNumber: number;
}): ImportedVocabularyItem | undefined => {
  const termCell = cells[startIndex];
  const partOfSpeechCell = cells[startIndex + 1];
  const meaningCell = cells[startIndex + 2];

  if (!termCell || !partOfSpeechCell || !meaningCell) {
    return undefined;
  }

  const parsedTerm = parseTermCell(termCell);
  const partOfSpeech = normalizePartOfSpeech(partOfSpeechCell);
  const meaning = stripMarkdownCode(meaningCell);
  const lowConfidenceReasons: string[] = [];

  if (parsedTerm.needsReview) {
    lowConfidenceReasons.push("无法可靠拆分 kana 和 word");
  }

  if (!partOfSpeech || partOfSpeech === "词性") {
    lowConfidenceReasons.push("缺少词性");
  }

  if (!meaning || meaning === "解释") {
    lowConfidenceReasons.push("缺少释义");
  }

  const source = createImportedSource({
    segment,
    rawText: sourceLine.trim(),
    lineStart: lineNumber,
    lineEnd: lineNumber
  });
  const textbookLesson = segment.textbookLesson ?? 0;
  const id = `vocab-sbj2-${String(textbookLesson).padStart(2, "0")}-${String(
    itemIndex
  ).padStart(3, "0")}`;
  const hash = stableHash(
    `${segment.sourceFileId}:${segment.textbookLesson}:${sourceLine}:${itemIndex}`
  );

  return {
    id,
    type: "vocabulary",
    word: parsedTerm.word,
    kana: parsedTerm.kana,
    display: parsedTerm.display,
    meaning,
    partOfSpeech,
    example: `「${parsedTerm.display}」`,
    exampleMeaning: meaning,
    level: getLevelForLesson(segment.textbookLesson),
    textbookBook: segment.textbookBook,
    textbookLesson: segment.textbookLesson,
    unitId: segment.unitId,
    isCore: true,
    tags: segment.textbookLesson ? [`第${segment.textbookLesson}课`] : [],
    source,
    publishStatus: "private_only",
    importStatus:
      lowConfidenceReasons.length === 0 ? "imported" : "needs_review",
    hash,
    importHash: hash,
    sourceText: sourceLine.trim(),
    lowConfidenceReasons
  };
};

export const parseVocabularySegment = (
  segment: LessonSegment
): ImportedVocabularyItem[] => {
  const lines = segment.rawMarkdown.split(/\r?\n/);
  const items: ImportedVocabularyItem[] = [];

  for (const [lineIndex, line] of lines.entries()) {
    if (!line.includes("|")) {
      continue;
    }

    const cells = splitMarkdownTableCells(line);

    if (
      cells.length < 3 ||
      isSeparatorRow(cells) ||
      cells[0] === "单词" ||
      cells[0] === "句子"
    ) {
      continue;
    }

    const groupStarts = cells.length >= 6 ? [0, 3] : [0];
    const absoluteLineNumber = segment.lineStart + lineIndex;

    for (const startIndex of groupStarts) {
      const parsedItem = parseVocabularyGroup({
        cells,
        startIndex,
        segment,
        itemIndex: items.length + 1,
        sourceLine: line,
        lineNumber: absoluteLineNumber
      });

      if (parsedItem) {
        items.push(parsedItem);
      }
    }
  }

  return items;
};
