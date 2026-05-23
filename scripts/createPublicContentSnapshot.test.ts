import { describe, expect, it } from "vitest";

import {
  createPublicSnapshotItems,
  renderPublicContentSnapshotSummary
} from "./createPublicContentSnapshot";
import type { ImportedSourceSpan } from "../src/types/learning";

const importedSource: ImportedSourceSpan = {
  sourceRepo: "fukangwei/Japanese_Note",
  sourceUrl: "https://github.com/fukangwei/Japanese_Note",
  filePath: "content/sources/japanese-note/example.md",
  sourceFileId: "example",
  headingPath: ["第1课"],
  lineStart: 1,
  lineEnd: 2,
  hash: "source-hash"
};

describe("createPublicContentSnapshot", () => {
  it("keeps only content visible in public mode", () => {
    const items = createPublicSnapshotItems([
      {
        id: "private-imported",
        source: importedSource,
        publishStatus: "private_only" as const,
        importStatus: "imported" as const
      },
      {
        id: "safe-imported",
        source: importedSource,
        publishStatus: "safe_to_publish" as const,
        importStatus: "imported" as const
      },
      {
        id: "needs-review",
        source: importedSource,
        publishStatus: "safe_to_publish" as const,
        importStatus: "needs_review" as const
      },
      {
        id: "original",
        source: "原创" as const,
        publishStatus: "private_only" as const
      }
    ]);

    expect(items.map((item) => item.id)).toEqual(["safe-imported", "original"]);
  });

  it("renders a concise summary for CI logs", () => {
    expect(
      renderPublicContentSnapshotSummary([
        {
          fileName: "vocabulary.json",
          filePath: "/repo/content/generated/vocabulary.json",
          beforeCount: 10,
          afterCount: 2,
          removedCount: 8
        }
      ])
    ).toContain("- vocabulary.json: kept 2/10, removed 8");
  });
});
