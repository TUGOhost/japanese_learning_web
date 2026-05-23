import { describe, expect, it } from "vitest";

import { isContentVisible } from "./contentVisibility";
import type { ImportedSourceSpan } from "../types/learning";

const importedSource: ImportedSourceSpan = {
  sourceRepo: "fukangwei/Japanese_Note",
  sourceUrl: "https://github.com/fukangwei/Japanese_Note",
  filePath: "content/sources/japanese-note/example.md",
  sourceFileId: "example",
  headingPath: ["第1课"],
  lineStart: 1,
  lineEnd: 3,
  hash: "hash"
};

describe("content visibility", () => {
  it("shows private imported content only in private mode", () => {
    const item = {
      source: importedSource,
      publishStatus: "private_only" as const,
      importStatus: "imported" as const
    };

    expect(isContentVisible(item, "private")).toBe(true);
    expect(isContentVisible(item, "public")).toBe(false);
  });

  it("always hides review and do-not-publish content", () => {
    expect(
      isContentVisible(
        {
          source: importedSource,
          publishStatus: "private_only",
          importStatus: "needs_review"
        },
        "private"
      )
    ).toBe(false);
    expect(
      isContentVisible(
        {
          source: importedSource,
          publishStatus: "do_not_publish",
          importStatus: "imported"
        },
        "private"
      )
    ).toBe(false);
  });

  it("keeps original content visible in public mode", () => {
    expect(
      isContentVisible(
        { source: "原创", publishStatus: "safe_to_publish" },
        "public"
      )
    ).toBe(true);
  });
});
