import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { ImportedSourceSpan } from "../../src/types/learning";
import type { JapaneseNoteSourceFile } from "../../content/source-manifest/japanese-note";
import type { LessonRange, LessonSegment } from "../types";

export const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);

export const japaneseNoteSourceDir = path.join(
  repoRoot,
  "content/sources/japanese-note"
);

export const japaneseNoteIntermediateDir = path.join(
  repoRoot,
  "content/intermediate/japanese-note"
);

export const generatedContentDir = path.join(repoRoot, "content/generated");

export const reportsDir = path.join(repoRoot, "reports");

export const ensureDir = (dirPath: string) => {
  fs.mkdirSync(dirPath, { recursive: true });
};

export const stableHash = (value: string): string =>
  crypto.createHash("sha256").update(value).digest("hex").slice(0, 16);

export const cleanMarkdownInline = (value: string): string =>
  value
    .replace(/<!--more-->/g, "")
    .replace(/&emsp;/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .trim();

export const stripMarkdownCode = (value: string): string =>
  cleanMarkdownInline(value).replace(/`/g, "").trim();

export const hasJapaneseText = (value: string): boolean =>
  /[\u3040-\u30ff\u3400-\u9fff々〆ヶー]/.test(value);

export const parseLessonRange = (): LessonRange | undefined => {
  const args = process.argv.slice(2);
  const argValue = args
    .find((arg) => arg.startsWith("--lessons="))
    ?.replace("--lessons=", "");
  const rawValue = process.env.LESSON_RANGE ?? argValue;

  if (!rawValue) {
    return undefined;
  }

  const rangeMatch = rawValue.match(/^(\d+)(?:-(\d+))?$/);

  if (!rangeMatch) {
    throw new Error(
      `Invalid lesson range "${rawValue}". Use a number or range like 1-3.`
    );
  }

  const start = Number(rangeMatch[1]);
  const end = Number(rangeMatch[2] ?? rangeMatch[1]);

  if (start > end) {
    throw new Error(`Invalid lesson range "${rawValue}": start is after end.`);
  }

  return { start, end };
};

export const isLessonInRange = (
  lesson: number | undefined,
  lessonRange?: LessonRange
): boolean => {
  if (!lessonRange || lesson === undefined) {
    return true;
  }

  return lesson >= lessonRange.start && lesson <= lessonRange.end;
};

export const getTextbookBookForLesson = (
  lesson: number | undefined
): "初级上" | "初级下" | undefined => {
  if (lesson === undefined) {
    return undefined;
  }

  return lesson <= 24 ? "初级上" : "初级下";
};

export const getLevelForLesson = (lesson: number | undefined) =>
  lesson !== undefined && lesson >= 25 ? "N4" : "N5";

export const createImportedSource = ({
  segment,
  rawText,
  lineStart,
  lineEnd
}: {
  segment: LessonSegment;
  rawText: string;
  lineStart?: number;
  lineEnd?: number;
}): ImportedSourceSpan => ({
  sourceRepo: "fukangwei/Japanese_Note",
  sourceUrl: "https://github.com/fukangwei/Japanese_Note",
  filePath: segment.sourceFilePath,
  sourceFileId: segment.sourceFileId,
  headingPath: [segment.headingText],
  lineStart: lineStart ?? segment.lineStart,
  lineEnd: lineEnd ?? segment.lineEnd,
  hash: stableHash(rawText),
  rawText
});

export const getGlobalLessonNumber = (
  rawLessonNumber: number,
  sourceFile: JapaneseNoteSourceFile
): number => {
  if (sourceFile.lessonNumberingMode === "relative") {
    return rawLessonNumber + (sourceFile.globalLessonOffset ?? 0);
  }

  return rawLessonNumber;
};

export const normalizeReportPath = (absolutePath: string): string =>
  path.relative(repoRoot, absolutePath).replaceAll(path.sep, "/");

export const readJsonFile = <T>(filePath: string, fallback: T): T => {
  if (!fs.existsSync(filePath)) {
    return fallback;
  }

  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
};

export const writeJsonFile = (filePath: string, value: unknown) => {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
};
