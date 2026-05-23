import type { GrammarItem } from "../types/learning";
import { generatedGrammarFromJson } from "./contentRepository";
import { filterVisibleContent } from "../lib/contentVisibility";

type GrammarSeed = Omit<GrammarItem, "level"> &
  Partial<Pick<GrammarItem, "level">>;

const withDefaultGrammarMeta = (
  items: GrammarSeed[],
  defaults: Pick<GrammarItem, "level" | "source" | "isCore">
): GrammarItem[] => items.map((item) => ({ ...defaults, ...item }));

const baseGrammar: GrammarItem[] = withDefaultGrammarMeta(
  [
  { id: "grammar-001", title: "A は B です", level: "预备", category: "判断句", structure: "A は B です", meaning: "A 是 B", explanation: "用来说明身份、名称或性质。は 提示话题，读作 wa。", examples: [{ japanese: "私は学生です。", reading: "わたしはがくせいです", chinese: "我是学生。" }], tipsForChineseSpeakers: "先把 は 理解成“说到 A”，不要按中文逐字翻译。" },
  { id: "grammar-002", title: "A は B ではありません", level: "预备", category: "否定", structure: "A は B ではありません", meaning: "A 不是 B", explanation: "です 的礼貌否定形式。口语中也常听到 じゃありません。", examples: [{ japanese: "これは本ではありません。", chinese: "这不是书。" }] },
  { id: "grammar-003", title: "A は B ですか", level: "预备", category: "疑问", structure: "A は B ですか", meaning: "A 是 B 吗？", explanation: "句尾加 か 表示疑问，通常不再加问号也可以。", examples: [{ japanese: "あなたは先生ですか。", chinese: "你是老师吗？" }] },
  { id: "grammar-004", title: "これ / それ / あれ", level: "预备", category: "指示词", structure: "これ・それ・あれ", meaning: "这个 / 那个 / 那个远处的", explanation: "これ 指离说话人近的东西，それ 指离听话人近的东西，あれ 指双方都远的东西。", examples: [{ japanese: "これは水です。", chinese: "这是水。" }] },
  { id: "grammar-005", title: "この / その / あの", level: "N5", category: "连体词", structure: "この + 名词", meaning: "这个……", explanation: "この/その/あの 后面必须接名词，不能单独使用。", examples: [{ japanese: "この本は新しいです。", chinese: "这本书是新的。" }] },
  { id: "grammar-006", title: "の 表示所属", level: "预备", category: "助词", structure: "A の B", meaning: "A 的 B", explanation: "の 可以连接两个名词，表示所属、内容或说明。", examples: [{ japanese: "私の本です。", chinese: "是我的书。" }] },
  { id: "grammar-007", title: "を 表示宾语", level: "N5", category: "助词", structure: "名词 を 动词", meaning: "把某物做某动作", explanation: "を 标记动作直接作用的对象，读作 o。", examples: [{ japanese: "水を飲みます。", chinese: "喝水。" }] },
  { id: "grammar-008", title: "に 表示时间点", level: "N5", category: "助词", structure: "时间 に 动词", meaning: "在某个时间做某事", explanation: "に 可以标记明确时间点，比如 7 点、星期一。", examples: [{ japanese: "七時に起きます。", chinese: "七点起床。" }] },
  { id: "grammar-009", title: "で 表示动作地点", level: "N5", category: "助词", structure: "地点 で 动词", meaning: "在某地做某事", explanation: "で 标记动作发生的地点。", examples: [{ japanese: "学校で日本語を勉強します。", chinese: "在学校学习日语。" }] },
  { id: "grammar-010", title: "へ / に 表示方向", level: "N5", category: "助词", structure: "地点 へ / に 行きます", meaning: "去某地", explanation: "へ 强调方向，に 强调到达点。入门阶段都可以先理解为“去”。", examples: [{ japanese: "日本へ行きます。", chinese: "去日本。" }] },
  { id: "grammar-011", title: "ます形", level: "N5", category: "动词", structure: "动词ます形", meaning: "礼貌地表达动作", explanation: "ます形是初学者最常用的礼貌动词形式。", examples: [{ japanese: "ご飯を食べます。", chinese: "吃饭。" }] },
  { id: "grammar-012", title: "ません", level: "N5", category: "动词", structure: "动词ます形去ます + ません", meaning: "不做某事", explanation: "ません 是 ます 的礼貌否定。", examples: [{ japanese: "今日は行きません。", chinese: "今天不去。" }] },
  { id: "grammar-013", title: "ました", level: "N5", category: "时态", structure: "动词ます形去ます + ました", meaning: "做了某事", explanation: "ました 表示过去发生的动作。", examples: [{ japanese: "昨日、映画を見ました。", chinese: "昨天看了电影。" }] },
  { id: "grammar-014", title: "ませんでした", level: "N5", category: "时态", structure: "动词ます形去ます + ませんでした", meaning: "过去没有做某事", explanation: "表示过去的否定。", examples: [{ japanese: "昨日、学校へ行きませんでした。", chinese: "昨天没有去学校。" }] },
  { id: "grammar-015", title: "形容词基本用法", level: "N5", category: "形容词", structure: "い形容词 + 名词 / な形容词 + な + 名词", meaning: "描述人或事物", explanation: "い形容词可以直接接名词，な形容词接名词时要加 な。", examples: [{ japanese: "大きいかばんです。", chinese: "是大包。" }, { japanese: "静かな町です。", chinese: "是安静的城市。" }], commonMistakes: ["不要说 好き人，要说 好きな人。"] },
  { id: "grammar-sbj2-01-001", title: "A は B です", level: "N5", category: "教材第1课", structure: "A は B です", meaning: "A 是 B", explanation: "这是教材路线第 1 课位置的原创示例语法。は 提示话题，です 放在句末表示礼貌判断。", examples: [{ japanese: "私は学生です。", reading: "わたしはがくせいです", chinese: "我是学生。" }, { japanese: "兄は会社員です。", chinese: "哥哥是公司职员。" }], tipsForChineseSpeakers: "中文可以直接说“我是学生”，日语通常要用 は 提出话题，并在句末加 です。", unitId: "unit-sbj2-shokyu-1", textbookBook: "初级上", textbookLesson: 1, source: "标准日本语第二版初级" }
  ],
  { level: "N5", source: "原创", isCore: true }
);

const mergedGrammar: GrammarItem[] = [
  ...(generatedGrammarFromJson.length > 0
    ? baseGrammar.filter((item) => !item.id.startsWith("grammar-sbj2-"))
    : baseGrammar),
  ...generatedGrammarFromJson
];

export const grammar: GrammarItem[] = filterVisibleContent(mergedGrammar);
