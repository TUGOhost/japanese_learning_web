import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  filterVisibleContent,
  type VisibilityControlledContent
} from "../src/lib/contentVisibility";
import {
  generatedContentDir,
  readJsonFile,
  writeJsonFile
} from "./lib/japaneseNoteUtils";

export const generatedContentFileNames = [
  "vocabulary.json",
  "grammar.json",
  "sentences.json",
  "expressions.json",
  "quizzes.json"
];

type PublicSnapshotItem = VisibilityControlledContent & {
  id: string;
  [key: string]: unknown;
};

export type PublicContentSnapshotResult = {
  fileName: string;
  filePath: string;
  beforeCount: number;
  afterCount: number;
  removedCount: number;
};

const readGeneratedItems = (filePath: string): PublicSnapshotItem[] => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing generated content file: ${filePath}`);
  }

  const items = readJsonFile<unknown>(filePath, []);

  if (!Array.isArray(items)) {
    throw new Error(`Generated content file must contain an array: ${filePath}`);
  }

  return items as PublicSnapshotItem[];
};

export const createPublicSnapshotItems = <T extends PublicSnapshotItem>(
  items: T[]
): T[] => filterVisibleContent(items, "public");

export const createPublicContentSnapshot = (
  contentDir = generatedContentDir,
  fileNames = generatedContentFileNames
): PublicContentSnapshotResult[] =>
  fileNames.map((fileName) => {
    const filePath = path.join(contentDir, fileName);
    const items = readGeneratedItems(filePath);
    const publicItems = createPublicSnapshotItems(items);

    writeJsonFile(filePath, publicItems);

    return {
      fileName,
      filePath,
      beforeCount: items.length,
      afterCount: publicItems.length,
      removedCount: items.length - publicItems.length
    };
  });

export const renderPublicContentSnapshotSummary = (
  results: PublicContentSnapshotResult[]
): string =>
  [
    "Public content snapshot created:",
    ...results.map(
      (result) =>
        `- ${result.fileName}: kept ${result.afterCount}/${result.beforeCount}, removed ${result.removedCount}`
    )
  ].join("\n");

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log(renderPublicContentSnapshotSummary(createPublicContentSnapshot()));
}
