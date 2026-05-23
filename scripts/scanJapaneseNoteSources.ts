import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  japaneseNoteSourceManifest,
  japaneseNoteSourceManifestByPath,
  type JapaneseNoteSourceFile
} from "../content/source-manifest/japanese-note";
import {
  ensureDir,
  getGlobalLessonNumber,
  japaneseNoteSourceDir,
  normalizeReportPath,
  reportsDir,
  writeJsonFile
} from "./lib/japaneseNoteUtils";

type DetectedHeading = {
  rawLessonNumber: number;
  globalLessonNumber: number;
  text: string;
  line: number;
};

type SourceInventoryEntry = {
  fileName: string;
  relativePath: string;
  filePath: string;
  lineCount: number;
  charCount: number;
  contentKind: JapaneseNoteSourceFile["contentKind"];
  textbookBook?: JapaneseNoteSourceFile["textbookBook"];
  lessonStart?: number;
  lessonEnd?: number;
  detectedLessonHeadings: DetectedHeading[];
  missingLessons: number[];
  duplicateLessons: number[];
  publicImportPolicy: JapaneseNoteSourceFile["publicImportPolicy"];
};

const headingPattern =
  /^(?:(?:#{1,6})\s*)?第\s*0?(\d+)\s*课(?:\s|$|[：:、.-])/;

const detectHeadings = (
  lines: string[],
  sourceFile: JapaneseNoteSourceFile
): DetectedHeading[] =>
  lines.flatMap((line, index) => {
    const match = line.trim().match(headingPattern);

    if (!match) {
      return [];
    }

    const rawLessonNumber = Number(match[1]);

    return [
      {
        rawLessonNumber,
        globalLessonNumber: getGlobalLessonNumber(rawLessonNumber, sourceFile),
        text: line.trim().replace(/^#{1,6}\s*/, ""),
        line: index + 1
      }
    ];
  });

const getDuplicateLessons = (headings: DetectedHeading[]): number[] => {
  const counts = new Map<number, number>();

  for (const heading of headings) {
    counts.set(heading.globalLessonNumber, (counts.get(heading.globalLessonNumber) ?? 0) + 1);
  }

  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([lesson]) => lesson);
};

const getMissingLessons = (
  sourceFile: JapaneseNoteSourceFile,
  headings: DetectedHeading[]
): number[] => {
  if (!sourceFile.lessonStart || !sourceFile.lessonEnd) {
    return [];
  }

  const detected = new Set(headings.map((heading) => heading.globalLessonNumber));
  const missing: number[] = [];

  for (
    let lesson = sourceFile.lessonStart;
    lesson <= sourceFile.lessonEnd;
    lesson += 1
  ) {
    if (!detected.has(lesson)) {
      missing.push(lesson);
    }
  }

  return missing;
};

const buildInventoryEntry = (relativePath: string): SourceInventoryEntry => {
  const sourceFile =
    japaneseNoteSourceManifestByPath.get(relativePath) ??
    ({
      id: `unknown-${relativePath}`,
      fileName: path.basename(relativePath),
      relativePath,
      contentKind: "unknown",
      publicImportPolicy: "needs_review"
    } satisfies JapaneseNoteSourceFile);
  const absolutePath = path.join(japaneseNoteSourceDir, relativePath);
  const markdown = fs.readFileSync(absolutePath, "utf8");
  const lines = markdown.split(/\r?\n/);
  const headings = detectHeadings(lines, sourceFile);

  return {
    fileName: sourceFile.fileName,
    relativePath,
    filePath: normalizeReportPath(absolutePath),
    lineCount: lines.length,
    charCount: markdown.length,
    contentKind: sourceFile.contentKind,
    textbookBook: sourceFile.textbookBook,
    lessonStart: sourceFile.lessonStart,
    lessonEnd: sourceFile.lessonEnd,
    detectedLessonHeadings: headings,
    missingLessons: getMissingLessons(sourceFile, headings),
    duplicateLessons: getDuplicateLessons(headings),
    publicImportPolicy: sourceFile.publicImportPolicy
  };
};

const renderInventoryMarkdown = (entries: SourceInventoryEntry[]): string => {
  const lines = [
    "# Japanese_Note Source Inventory",
    "",
    "| 文件 | 行数 | 字符数 | 类型 | 册别 | 课次范围 | 检测课次 | 缺失 | 重复 | 发布策略 |",
    "|---|---:|---:|---|---|---|---:|---|---|---|"
  ];

  for (const entry of entries) {
    lines.push(
      [
        entry.fileName,
        entry.lineCount,
        entry.charCount,
        entry.contentKind,
        entry.textbookBook ?? "",
        entry.lessonStart && entry.lessonEnd
          ? `${entry.lessonStart}-${entry.lessonEnd}`
          : "",
        entry.detectedLessonHeadings.length,
        entry.missingLessons.length > 0 ? entry.missingLessons.join(", ") : "",
        entry.duplicateLessons.length > 0 ? entry.duplicateLessons.join(", ") : "",
        entry.publicImportPolicy
      ].join(" | ").replace(/^/, "| ").replace(/$/, " |")
    );
  }

  for (const entry of entries) {
    lines.push("", `## ${entry.fileName}`, "");
    lines.push(
      entry.detectedLessonHeadings.length > 0
        ? entry.detectedLessonHeadings
            .map(
              (heading) =>
                `- line ${heading.line}: ${heading.text} -> lesson ${heading.globalLessonNumber}`
            )
            .join("\n")
        : "- 未检测到课次标题"
    );
  }

  return `${lines.join("\n")}\n`;
};

export const scanJapaneseNoteSources = () => {
  ensureDir(reportsDir);

  const manifestPaths = new Set(
    japaneseNoteSourceManifest.map((sourceFile) => sourceFile.relativePath)
  );
  const filePaths = fs.existsSync(japaneseNoteSourceDir)
    ? fs
        .readdirSync(japaneseNoteSourceDir)
        .filter((fileName) => fileName.endsWith(".md"))
    : [];
  const relativePaths = [...new Set([...manifestPaths, ...filePaths])].filter(
    (relativePath) => fs.existsSync(path.join(japaneseNoteSourceDir, relativePath))
  );
  const entries = relativePaths.sort().map(buildInventoryEntry);
  const markdownPath = path.join(reportsDir, "japanese-note-inventory.md");
  const jsonPath = path.join(reportsDir, "japanese-note-source-structure.json");

  fs.writeFileSync(markdownPath, renderInventoryMarkdown(entries));
  writeJsonFile(jsonPath, entries);

  console.log(
    `Scanned ${entries.length} files. Wrote ${normalizeReportPath(markdownPath)} and ${normalizeReportPath(jsonPath)}.`
  );
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  scanJapaneseNoteSources();
}
