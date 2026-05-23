import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  japaneseNoteSourceManifest,
  type JapaneseNoteSourceFile
} from "../content/source-manifest/japanese-note";
import {
  ensureDir,
  getGlobalLessonNumber,
  isLessonInRange,
  japaneseNoteIntermediateDir,
  japaneseNoteSourceDir,
  normalizeReportPath,
  parseLessonRange,
  stableHash,
  writeJsonFile
} from "./lib/japaneseNoteUtils";
import type { LessonRange, LessonSegment } from "./types";

type LessonHeading = {
  rawLessonNumber: number;
  globalLessonNumber: number;
  headingText: string;
  headingLevel: number;
  lineNumber: number;
  lineIndex: number;
};

const lessonHeadingPattern =
  /^(?:(#{1,6})\s*)?第\s*0?(\d+)\s*课(?:\s|$|[：:、.-])/;

const findLessonHeadings = (
  lines: string[],
  sourceFile: JapaneseNoteSourceFile
): LessonHeading[] =>
  lines.flatMap((line, lineIndex) => {
    const match = line.trim().match(lessonHeadingPattern);

    if (!match) {
      return [];
    }

    const rawLessonNumber = Number(match[2]);
    const globalLessonNumber = getGlobalLessonNumber(rawLessonNumber, sourceFile);

    return [
      {
        rawLessonNumber,
        globalLessonNumber,
        headingText: line.trim().replace(/^#{1,6}\s*/, ""),
        headingLevel: match[1]?.length ?? 0,
        lineNumber: lineIndex + 1,
        lineIndex
      }
    ];
  });

export const createLessonSegmentsFromMarkdown = ({
  sourceFile,
  sourceFilePath,
  markdown,
  lessonRange
}: {
  sourceFile: JapaneseNoteSourceFile;
  sourceFilePath: string;
  markdown: string;
  lessonRange?: LessonRange;
}): LessonSegment[] => {
  const lines = markdown.split(/\r?\n/);
  const headings = findLessonHeadings(lines, sourceFile);

  return headings.flatMap((heading, index) => {
    if (!isLessonInRange(heading.globalLessonNumber, lessonRange)) {
      return [];
    }

    const nextHeading = headings[index + 1];
    const lineStart = heading.lineNumber;
    const lineEnd = nextHeading ? nextHeading.lineNumber - 1 : lines.length;
    const rawMarkdown = lines.slice(lineStart - 1, lineEnd).join("\n");
    const textbookLesson = heading.globalLessonNumber;

    return [
      {
        id: `${sourceFile.id}-lesson-${textbookLesson}`,
        sourceFileId: sourceFile.id,
        sourceFilePath,
        contentKind: sourceFile.contentKind,
        textbookBook:
          sourceFile.textbookBook === "初级上" ||
          sourceFile.textbookBook === "初级下"
            ? sourceFile.textbookBook
            : undefined,
        textbookLesson,
        unitId: `unit-sbj2-shokyu-${textbookLesson}`,
        headingText: heading.headingText,
        headingLevel: heading.headingLevel,
        lineStart,
        lineEnd,
        rawMarkdown,
        hash: stableHash(rawMarkdown)
      }
    ];
  });
};

export const splitJapaneseNoteBookFiles = (lessonRange = parseLessonRange()) => {
  ensureDir(japaneseNoteIntermediateDir);

  const segments = japaneseNoteSourceManifest.flatMap((sourceFile) => {
    if (!["vocabulary", "grammar", "mixed"].includes(sourceFile.contentKind)) {
      return [];
    }

    if (sourceFile.textbookLevel && sourceFile.textbookLevel !== "初级") {
      return [];
    }

    const sourcePath = path.join(japaneseNoteSourceDir, sourceFile.relativePath);

    if (!fs.existsSync(sourcePath)) {
      return [];
    }

    const markdown = fs.readFileSync(sourcePath, "utf8");

    return createLessonSegmentsFromMarkdown({
      sourceFile,
      sourceFilePath: normalizeReportPath(sourcePath),
      markdown,
      lessonRange
    });
  });

  const outputPath = path.join(
    japaneseNoteIntermediateDir,
    "lesson-segments.json"
  );
  writeJsonFile(outputPath, segments);

  console.log(
    `Wrote ${segments.length} lesson segments to ${normalizeReportPath(outputPath)}.`
  );
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  splitJapaneseNoteBookFiles();
}
