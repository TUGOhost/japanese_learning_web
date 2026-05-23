import { beforeEach, describe, expect, it } from "vitest";

import {
  getProgressEntry,
  loadVocabularyProgress,
  saveVocabularyProgress,
  STORAGE_KEY
} from "./progressStorage";

describe("progressStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns an empty progress map when storage is empty or invalid", () => {
    expect(loadVocabularyProgress()).toEqual({});

    window.localStorage.setItem(STORAGE_KEY, "{broken-json");

    expect(loadVocabularyProgress()).toEqual({});
  });

  it("persists only known boolean progress values", () => {
    saveVocabularyProgress({
      "n3-001": { mastered: true, favorite: false },
      "n3-002": { mastered: false, favorite: true }
    });

    expect(loadVocabularyProgress()).toEqual({
      "n3-001": { mastered: true, favorite: false },
      "n3-002": { mastered: false, favorite: true }
    });
  });

  it("provides a default progress entry for words without saved state", () => {
    expect(getProgressEntry({}, "missing-id")).toEqual({
      mastered: false,
      favorite: false
    });
  });
});
