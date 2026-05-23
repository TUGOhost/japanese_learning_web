import {
  cleanMarkdownInline,
  createImportedSource,
  getLevelForLesson,
  hasJapaneseText,
  stableHash,
  stripMarkdownCode
} from "../lib/japaneseNoteUtils";
import type { ImportedGrammarItem, LessonSegment } from "../types";

type GrammarBlock = {
  rawHeading: string;
  lineStart: number;
  lineEnd: number;
  lines: string[];
};

const grammarHeadingPattern =
  /^(?:\s|&emsp;)*(?:\d+[.、]|[（(]\d+[）)])\s*(.+?)[：:]\s*(.*)$/;

const parseGrammarBlocks = (segment: LessonSegment): GrammarBlock[] => {
  const lines = segment.rawMarkdown.split(/\r?\n/);
  const blocks: GrammarBlock[] = [];
  let currentBlock: GrammarBlock | undefined;

  for (const [lineIndex, line] of lines.entries()) {
    const match = line.match(grammarHeadingPattern);
    const hasStructure = match && /`[^`]+`/.test(match[1]);

    if (match && hasStructure) {
      if (currentBlock) {
        currentBlock.lineEnd = segment.lineStart + lineIndex - 1;
        blocks.push(currentBlock);
      }

      currentBlock = {
        rawHeading: line,
        lineStart: segment.lineStart + lineIndex,
        lineEnd: segment.lineStart + lineIndex,
        lines: []
      };
      continue;
    }

    if (currentBlock) {
      currentBlock.lines.push(line);
    }
  }

  if (currentBlock) {
    currentBlock.lineEnd = segment.lineEnd;
    blocks.push(currentBlock);
  }

  return blocks;
};

const splitHeading = (rawHeading: string) => {
  const match = rawHeading.match(grammarHeadingPattern);
  const rawTitle = match?.[1] ?? rawHeading;
  const explanation = cleanMarkdownInline(match?.[2] ?? "");
  const codeTerms = [...rawTitle.matchAll(/`([^`]+)`/g)]
    .map((codeMatch) => cleanMarkdownInline(codeMatch[1]))
    .filter(Boolean);
  const structure = codeTerms[0] ?? stripMarkdownCode(rawTitle);
  const title = stripMarkdownCode(rawTitle);

  return {
    title,
    structure,
    explanation
  };
};

const parseExamples = (lines: string[]) =>
  lines.flatMap((line) => {
    const listMatch = line.match(/^\s*(?:[-*]|\d+[.、])\s+(.+)$/);

    if (!listMatch) {
      return [];
    }

    const examples = [
      ...listMatch[1].matchAll(/`([^`]+)`[（(]([^()（）]+)[）)]/g)
    ].map((match) => ({
      japanese: cleanMarkdownInline(match[1]),
      chinese: cleanMarkdownInline(match[2])
    }));

    if (examples.length > 0) {
      return examples.filter((example) => hasJapaneseText(example.japanese));
    }

    const colonMatch = line.match(/`([^`]+)`\s*[：:]\s*(.+)$/);

    if (colonMatch) {
      return [
        {
          japanese: cleanMarkdownInline(colonMatch[1]),
          chinese: stripMarkdownCode(colonMatch[2])
        }
      ];
    }

    return [];
  });

const isExampleOnlyNumberedLine = (line: string): boolean => {
  const match = line.match(/^\s*\d+[.、]\s+(.+)$/);

  if (!match) {
    return false;
  }

  const remainder = match[1]
    .replace(/[甲乙丙丁]\s*[：:]/g, "")
    .replace(/`([^`]+)`[（(]([^()（）]+)[）)]/g, "")
    .replace(/[（）()、，,。？！!?；;:\s]/g, "");

  return remainder.length === 0;
};

const deriveExplanationFromBody = (lines: string[]): string =>
  lines
    .flatMap((line) => {
      const cleaned = cleanMarkdownInline(line);

      if (!cleaned || /^\s*[-*]\s+/.test(cleaned)) {
        return [];
      }

      const numberedMatch = cleaned.match(/^\d+[.、]\s+(.+)$/);

      if (numberedMatch) {
        return isExampleOnlyNumberedLine(cleaned)
          ? []
          : [stripMarkdownCode(numberedMatch[1])];
      }

      if (/^\|?[: -]+\|/.test(cleaned)) {
        return [];
      }

      return [stripMarkdownCode(cleaned)];
    })
    .slice(0, 3)
    .join(" ")
    .slice(0, 240)
    .trim();

const extractMeaning = (explanation: string, structure: string): string => {
  const patterns = [
    /相当于汉语(?:的)?`?([^`。；，,.]+)`?/,
    /汉语(?:译为|意思是)`?([^`。；，,.]+)`?/,
    /意思是`?([^`。；，,.]+)`?/,
    /表示`?([^`。；，,.]+)`?/
  ];

  for (const pattern of patterns) {
    const match = explanation.match(pattern);

    if (match?.[1]) {
      return stripMarkdownCode(match[1]);
    }
  }

  return `掌握「${structure}」的用法`;
};

const shouldReviewAsSupplement = (
  title: string,
  structure: string,
  explanation: string
) => {
  const compactStructure = `${title}${structure}`.replace(/\s+/g, "");

  return (
    compactStructure.includes("和") ||
    [
      "はじめまして",
      "どうぞ",
      "おやすみなさい",
      "ありがとうございます",
      "お元気で",
      "お気をつけて",
      "お大事に"
    ].some((value) => compactStructure.includes(value)) ||
    /寒暄|文化|外来语|区别|称呼|接尾词|保重|小心/.test(explanation)
  );
};

export const parseGrammarSegment = (
  segment: LessonSegment
): ImportedGrammarItem[] =>
  parseGrammarBlocks(segment).map((block, index) => {
    const heading = splitHeading(block.rawHeading);
    const { title, structure } = heading;
    const explanation =
      heading.explanation || deriveExplanationFromBody(block.lines);
    const examples = parseExamples(block.lines);
    const lowConfidenceReasons: string[] = [];

    if (examples.some((example) => !example.chinese)) {
      lowConfidenceReasons.push("存在未解析中文释义的例句");
    }

    if (!structure) {
      lowConfidenceReasons.push("缺少语法结构");
    }

    if (!explanation) {
      lowConfidenceReasons.push("缺少解释");
    }

    const isSupplement = shouldReviewAsSupplement(title, structure, explanation);

    if (isSupplement) {
      lowConfidenceReasons.push("疑似寒暄、文化说明或词义辨析");
    }

    const sourceText = [block.rawHeading, ...block.lines].join("\n").trim();
    const source = createImportedSource({
      segment,
      rawText: sourceText,
      lineStart: block.lineStart,
      lineEnd: block.lineEnd
    });
    const hash = stableHash(
      `${segment.sourceFileId}:${segment.textbookLesson}:${sourceText}`
    );
    const textbookLesson = segment.textbookLesson ?? 0;

    return {
      id: `grammar-sbj2-${String(textbookLesson).padStart(2, "0")}-${String(
        index + 1
      ).padStart(3, "0")}`,
      type: "grammar",
      title,
      structure,
      meaning: extractMeaning(explanation, structure),
      explanation,
      examples,
      level: getLevelForLesson(segment.textbookLesson),
      textbookBook: segment.textbookBook,
      textbookLesson: segment.textbookLesson,
      unitId: segment.unitId,
      isCore: !isSupplement,
      category: isSupplement
        ? "补充说明"
        : `教材第${segment.textbookLesson ?? "?"}课`,
      source,
      publishStatus: "private_only",
      importStatus:
        lowConfidenceReasons.length === 0 ? "imported" : "needs_review",
      hash,
      importHash: hash,
      sourceText,
      lowConfidenceReasons
    };
  });
