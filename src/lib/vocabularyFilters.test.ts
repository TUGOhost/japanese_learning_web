import { describe, expect, it } from "vitest";

import type { VocabularyItem, VocabularyProgressMap } from "../types/vocabulary";
import { filterVocabulary, getPartOfSpeechOptions } from "./vocabularyFilters";

const vocabulary: VocabularyItem[] = [
  {
    id: "n3-001",
    word: "相談",
    kana: "そうだん",
    meaning: "商量，咨询",
    partOfSpeech: "名词",
    example: "先生に相談します。",
    exampleMeaning: "我向老师咨询。",
    level: "N3"
  },
  {
    id: "n3-002",
    word: "選ぶ",
    kana: "えらぶ",
    meaning: "选择",
    partOfSpeech: "动词",
    example: "好きな色を選んでください。",
    exampleMeaning: "请选择喜欢的颜色。",
    level: "N3"
  },
  {
    id: "n3-003",
    word: "アルバイト",
    kana: "アルバイト",
    meaning: "打工，兼职",
    partOfSpeech: "片假名词",
    example: "週末にアルバイトをしています。",
    exampleMeaning: "我周末在打工。",
    level: "N3"
  }
];

const progress: VocabularyProgressMap = {
  "n3-001": { mastered: true, favorite: false },
  "n3-002": { mastered: false, favorite: true }
};

describe("vocabularyFilters", () => {
  it("searches by Japanese word, kana, and Chinese meaning", () => {
    expect(
      filterVocabulary(vocabulary, progress, {
        searchTerm: "そう",
        statusFilter: "all",
        partOfSpeechFilter: "all"
      }).map((item) => item.id)
    ).toEqual(["n3-001"]);

    expect(
      filterVocabulary(vocabulary, progress, {
        searchTerm: "选择",
        statusFilter: "all",
        partOfSpeechFilter: "all"
      }).map((item) => item.id)
    ).toEqual(["n3-002"]);
  });

  it("combines status and part-of-speech filters", () => {
    expect(
      filterVocabulary(vocabulary, progress, {
        searchTerm: "",
        statusFilter: "favorite",
        partOfSpeechFilter: "动词"
      }).map((item) => item.id)
    ).toEqual(["n3-002"]);

    expect(
      filterVocabulary(vocabulary, progress, {
        searchTerm: "",
        statusFilter: "unmastered",
        partOfSpeechFilter: "片假名词"
      }).map((item) => item.id)
    ).toEqual(["n3-003"]);
  });

  it("returns sorted unique part-of-speech options with all first", () => {
    expect(getPartOfSpeechOptions(vocabulary)).toEqual([
      "all",
      "动词",
      "名词",
      "片假名词"
    ]);
  });
});
