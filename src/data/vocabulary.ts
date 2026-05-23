import type { VocabularyItem } from "../types/vocabulary";
import { generatedVocabularyFromJson } from "./contentRepository";
import { filterVisibleContent } from "../lib/contentVisibility";
import { n3Vocabulary } from "./n3Vocabulary";

type VocabularySeed = Omit<VocabularyItem, "level"> &
  Partial<Pick<VocabularyItem, "level">>;

const withDefaultVocabularyMeta = (
  items: VocabularySeed[],
  defaults: Pick<VocabularyItem, "level" | "source" | "isCore">
): VocabularyItem[] => items.map((item) => ({ ...defaults, ...item }));

export const beginnerVocabulary: VocabularyItem[] = withDefaultVocabularyMeta(
  [
    { id: "basic-001", word: "私", kana: "わたし", meaning: "我", partOfSpeech: "代词", example: "私は中国人です。", exampleMeaning: "我是中国人。", unitId: "unit-pre-writing-system", tags: ["入门"] },
    { id: "basic-002", word: "あなた", kana: "あなた", meaning: "你", partOfSpeech: "代词", example: "あなたは学生ですか。", exampleMeaning: "你是学生吗？", tags: ["入门"] },
    { id: "basic-003", word: "学生", kana: "がくせい", meaning: "学生", partOfSpeech: "名词", example: "私は学生です。", exampleMeaning: "我是学生。", tags: ["身份"] },
    { id: "basic-004", word: "先生", kana: "せんせい", meaning: "老师", partOfSpeech: "名词", example: "田中さんは先生です。", exampleMeaning: "田中先生是老师。", tags: ["身份"] },
    { id: "basic-005", word: "本", kana: "ほん", meaning: "书", partOfSpeech: "名词", example: "これは本です。", exampleMeaning: "这是书。", unitId: "unit-pre-writing-system", tags: ["物品"] },
    { id: "basic-006", word: "水", kana: "みず", meaning: "水", partOfSpeech: "名词", example: "水を飲みます。", exampleMeaning: "喝水。", tags: ["生活"] },
    { id: "basic-007", word: "ご飯", kana: "ごはん", meaning: "饭，米饭", partOfSpeech: "名词", example: "ご飯を食べます。", exampleMeaning: "吃饭。", tags: ["生活"] },
    { id: "basic-008", word: "学校", kana: "がっこう", meaning: "学校", partOfSpeech: "名词", example: "学校に行きます。", exampleMeaning: "去学校。", tags: ["地点"] },
    { id: "basic-009", word: "駅", kana: "えき", meaning: "车站", partOfSpeech: "名词", example: "駅で友だちに会います。", exampleMeaning: "在车站见朋友。", tags: ["地点"] },
    { id: "basic-010", word: "今日", kana: "きょう", meaning: "今天", partOfSpeech: "名词", example: "今日は暑いです。", exampleMeaning: "今天很热。", tags: ["时间"] },
    { id: "basic-011", word: "明日", kana: "あした", meaning: "明天", partOfSpeech: "名词", example: "明日、学校に行きます。", exampleMeaning: "明天去学校。", tags: ["时间"] },
    { id: "basic-012", word: "行く", kana: "いく", meaning: "去", partOfSpeech: "动词", example: "日本に行きます。", exampleMeaning: "去日本。", unitId: "unit-review-verb-forms", level: "N5", tags: ["动作"] },
    { id: "basic-013", word: "食べる", kana: "たべる", meaning: "吃", partOfSpeech: "动词", example: "パンを食べます。", exampleMeaning: "吃面包。", unitId: "unit-review-verb-forms", level: "N5", tags: ["动作"] },
    { id: "basic-014", word: "飲む", kana: "のむ", meaning: "喝", partOfSpeech: "动词", example: "お茶を飲みます。", exampleMeaning: "喝茶。", unitId: "unit-review-verb-forms", level: "N5", tags: ["动作"] },
    { id: "basic-015", word: "見る", kana: "みる", meaning: "看", partOfSpeech: "动词", example: "映画を見ます。", exampleMeaning: "看电影。", unitId: "unit-review-verb-forms", level: "N5", tags: ["动作"] },
    { id: "basic-016", word: "好き", kana: "すき", meaning: "喜欢", partOfSpeech: "な形容词", example: "日本語が好きです。", exampleMeaning: "我喜欢日语。", unitId: "unit-review-adjectives", level: "N5", tags: ["表达"] },
    { id: "basic-017", word: "大きい", kana: "おおきい", meaning: "大的", partOfSpeech: "い形容词", example: "大きいかばんです。", exampleMeaning: "是一个大包。", unitId: "unit-review-adjectives", level: "N5", tags: ["形容"] },
    { id: "basic-018", word: "小さい", kana: "ちいさい", meaning: "小的", partOfSpeech: "い形容词", example: "小さい猫です。", exampleMeaning: "是小猫。", unitId: "unit-review-adjectives", level: "N5", tags: ["形容"] },
    { id: "basic-019", word: "ありがとう", kana: "ありがとう", meaning: "谢谢", partOfSpeech: "常用表达", example: "ありがとうございます。", exampleMeaning: "谢谢您。", unitId: "unit-pre-greetings", tags: ["寒暄"] },
    { id: "basic-020", word: "こんにちは", kana: "こんにちは", meaning: "你好，下午好", partOfSpeech: "常用表达", example: "こんにちは、田中さん。", exampleMeaning: "你好，田中先生。", unitId: "unit-pre-greetings", tags: ["寒暄"] },
    { id: "vocab-pre-katakana-001", word: "コーヒー", kana: "コーヒー", meaning: "咖啡", partOfSpeech: "片假名词", example: "コーヒーをください。", exampleMeaning: "请给我咖啡。", unitId: "unit-pre-kana-katakana", tags: ["片假名"] }
  ],
  { level: "预备", source: "原创", isCore: true }
);

export const textbookDemoVocabulary: VocabularyItem[] = withDefaultVocabularyMeta(
  [
    { id: "vocab-sbj2-01-001", word: "学生", kana: "がくせい", meaning: "学生", partOfSpeech: "名词", example: "私は学生です。", exampleMeaning: "我是学生。", unitId: "unit-sbj2-shokyu-1", textbookBook: "初级上", textbookLesson: 1, tags: ["第1课", "身份"] },
    { id: "vocab-sbj2-01-002", word: "会社員", kana: "かいしゃいん", meaning: "公司职员", partOfSpeech: "名词", example: "兄は会社員です。", exampleMeaning: "哥哥是公司职员。", unitId: "unit-sbj2-shokyu-1", textbookBook: "初级上", textbookLesson: 1, tags: ["第1课", "身份"] },
    { id: "vocab-sbj2-01-003", word: "中国", kana: "ちゅうごく", meaning: "中国", partOfSpeech: "名词", example: "中国から来ました。", exampleMeaning: "我从中国来。", unitId: "unit-sbj2-shokyu-1", textbookBook: "初级上", textbookLesson: 1, tags: ["第1课", "国家"] }
  ],
  { level: "N5", source: "标准日本语第二版初级", isCore: true }
);

const mergedVocabulary: VocabularyItem[] = [
  ...beginnerVocabulary,
  ...(generatedVocabularyFromJson.length > 0
    ? generatedVocabularyFromJson
    : textbookDemoVocabulary),
  ...n3Vocabulary
];

export const allVocabulary: VocabularyItem[] =
  filterVisibleContent(mergedVocabulary);
