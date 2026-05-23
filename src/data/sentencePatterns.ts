import type { SentencePattern } from "../types/learning";
import { generatedSentencePatternsFromJson } from "./contentRepository";
import { filterVisibleContent } from "../lib/contentVisibility";

type SentencePatternSeed = Omit<SentencePattern, "level"> &
  Partial<Pick<SentencePattern, "level">>;

const withDefaultPatternMeta = (
  items: SentencePatternSeed[],
  defaults: Pick<SentencePattern, "level" | "source" | "isCore">
): SentencePattern[] => items.map((item) => ({ ...defaults, ...item }));

const baseSentencePatterns: SentencePattern[] = withDefaultPatternMeta(
  [
  { id: "pattern-001", pattern: "～は～です", meaning: "……是……", explanation: "最基础的判断句。", level: "预备", examples: [{ japanese: "私は学生です。", chinese: "我是学生。" }] },
  { id: "pattern-002", pattern: "～は～ですか", meaning: "……是……吗？", explanation: "句尾 か 表示疑问。", level: "预备", examples: [{ japanese: "これは本ですか。", chinese: "这是书吗？" }] },
  { id: "pattern-003", pattern: "～をください", meaning: "请给我……", explanation: "点餐、购物常用。", level: "N5", examples: [{ japanese: "水をください。", chinese: "请给我水。" }] },
  { id: "pattern-004", pattern: "～があります", meaning: "有……（无生命）", explanation: "用于物品、植物、事情等。", level: "N5", examples: [{ japanese: "机の上に本があります。", chinese: "桌子上有书。" }] },
  { id: "pattern-005", pattern: "～がいます", meaning: "有……（人或动物）", explanation: "用于人和动物。", level: "N5", examples: [{ japanese: "部屋に猫がいます。", chinese: "房间里有猫。" }] },
  { id: "pattern-006", pattern: "～に行きます", meaning: "去……", explanation: "表示移动目的地。", level: "N5", examples: [{ japanese: "学校に行きます。", chinese: "去学校。" }] },
  { id: "pattern-007", pattern: "～を食べます", meaning: "吃……", explanation: "を 标记吃的对象。", level: "预备", examples: [{ japanese: "ご飯を食べます。", chinese: "吃饭。" }] },
  { id: "pattern-008", pattern: "～を飲みます", meaning: "喝……", explanation: "を 标记喝的对象。", level: "预备", examples: [{ japanese: "お茶を飲みます。", chinese: "喝茶。" }] },
  { id: "pattern-009", pattern: "～が好きです", meaning: "喜欢……", explanation: "日语中喜欢的对象用 が。", level: "N5", examples: [{ japanese: "日本語が好きです。", chinese: "喜欢日语。" }] },
  { id: "pattern-010", pattern: "～ができます", meaning: "会…… / 能……", explanation: "表示能力或可能。", level: "N5", examples: [{ japanese: "料理ができます。", chinese: "会做饭。" }] },
  { id: "pattern-011", pattern: "～たいです", meaning: "想……", explanation: "接动词ます形去ます。", level: "N5", examples: [{ japanese: "日本へ行きたいです。", chinese: "想去日本。" }] },
  { id: "pattern-012", pattern: "～てもいいですか", meaning: "可以……吗？", explanation: "请求许可。", level: "N5", examples: [{ japanese: "写真を撮ってもいいですか。", chinese: "可以拍照吗？" }] },
  { id: "pattern-013", pattern: "～てください", meaning: "请……", explanation: "提出请求。", level: "N5", examples: [{ japanese: "名前を書いてください。", chinese: "请写名字。" }] },
  { id: "pattern-014", pattern: "～ないでください", meaning: "请不要……", explanation: "提醒对方不要做某事。", level: "N5", examples: [{ japanese: "ここで写真を撮らないでください。", chinese: "请不要在这里拍照。" }] },
  { id: "pattern-015", pattern: "～と思います", meaning: "我认为……", explanation: "表达自己的想法。", level: "N4", examples: [{ japanese: "明日は雨だと思います。", chinese: "我觉得明天会下雨。" }] },
  { id: "pattern-sbj2-01-001", pattern: "～は～です", meaning: "……是……", explanation: "教材路线第 1 课位置的原创示例句型，用来表达身份、职业、国籍等。", level: "N5", examples: [{ japanese: "私は学生です。", chinese: "我是学生。" }, { japanese: "兄は会社員です。", chinese: "哥哥是公司职员。" }], unitId: "unit-sbj2-shokyu-1", textbookBook: "初级上", textbookLesson: 1, source: "标准日本语第二版初级" }
  ],
  { level: "N5", source: "原创", isCore: true }
);

const mergedSentencePatterns: SentencePattern[] = [
  ...baseSentencePatterns,
  ...generatedSentencePatternsFromJson
];

export const sentencePatterns: SentencePattern[] = filterVisibleContent(
  mergedSentencePatterns
);
