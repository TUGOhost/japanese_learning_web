import type { LearningSentence as BaseLearningSentence } from "../types/learning";
import { generatedSentencesFromJson } from "./contentRepository";
import { filterVisibleContent } from "../lib/contentVisibility";

export type LearningSentence = BaseLearningSentence;

const baseLearningSentences: LearningSentence[] = [
  {
    id: "sentence-pre-greetings-001",
    japanese: "こんにちは。",
    reading: "こんにちは",
    chinese: "你好。",
    level: "预备",
    unitId: "unit-pre-greetings",
    tags: ["寒暄"],
    vocabularyIds: ["basic-020"],
    source: "原创"
  },
  {
    id: "sentence-pre-greetings-002",
    japanese: "ありがとうございます。",
    reading: "ありがとうございます",
    chinese: "谢谢您。",
    level: "预备",
    unitId: "unit-pre-greetings",
    tags: ["寒暄"],
    vocabularyIds: ["basic-019"],
    source: "原创"
  },
  {
    id: "sentence-sbj2-01-001",
    japanese: "私は学生です。",
    reading: "わたしはがくせいです",
    chinese: "我是学生。",
    level: "N5",
    unitId: "unit-sbj2-shokyu-1",
    textbookBook: "初级上",
    textbookLesson: 1,
    tags: ["第1课", "判断句"],
    grammarIds: ["grammar-sbj2-01-001"],
    vocabularyIds: ["vocab-sbj2-01-001"],
    note: "原创示例句，用于演示第 1 课的数据关联方式。",
    source: "标准日本语第二版初级"
  },
  {
    id: "sentence-sbj2-01-002",
    japanese: "兄は会社員です。",
    reading: "あにはかいしゃいんです",
    chinese: "哥哥是公司职员。",
    level: "N5",
    unitId: "unit-sbj2-shokyu-1",
    textbookBook: "初级上",
    textbookLesson: 1,
    tags: ["第1课", "判断句"],
    grammarIds: ["grammar-sbj2-01-001"],
    vocabularyIds: ["vocab-sbj2-01-002"],
    note: "原创示例句，后续可继续补充你自己的教材句子。",
    source: "标准日本语第二版初级"
  }
];

const mergedLearningSentences: LearningSentence[] = [
  ...baseLearningSentences,
  ...generatedSentencesFromJson
];

export const learningSentences: LearningSentence[] = filterVisibleContent(
  mergedLearningSentences
);
