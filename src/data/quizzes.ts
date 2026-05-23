import type { QuizQuestion } from "../types/learning";
import { generatedQuizzesFromJson } from "./contentRepository";
import { filterVisibleContent } from "../lib/contentVisibility";

type QuizSeed = Omit<QuizQuestion, "level" | "difficulty"> &
  Partial<Pick<QuizQuestion, "level" | "difficulty">>;

const withDefaultQuizMeta = (
  items: QuizSeed[],
  defaults: Pick<QuizQuestion, "level" | "difficulty">
): QuizQuestion[] => items.map((item) => ({ ...defaults, ...item }));

const baseQuizzes: QuizQuestion[] = withDefaultQuizMeta(
  [
    { id: "quiz-001", type: "kana", unitId: "unit-pre-kana-hiragana", question: "あ 的罗马音是？", options: ["a", "i", "u", "e"], answer: "a", explanation: "あ 读作 a，接近中文“啊”的短音。", relatedLessonId: "lesson-002" },
    { id: "quiz-002", type: "kana", unitId: "unit-pre-kana-hiragana", question: "き 的罗马音是？", options: ["ka", "ki", "ku", "ke"], answer: "ki", explanation: "き 属于か行い段，读作 ki。", relatedLessonId: "lesson-002" },
    { id: "quiz-003", type: "kana", unitId: "unit-pre-kana-hiragana", question: "し 的读音更接近哪一个？", options: ["si", "shi", "su", "sa"], answer: "shi", explanation: "し 不是 si，更接近 shi。", relatedLessonId: "lesson-002" },
    { id: "quiz-004", type: "kana", unitId: "unit-pre-kana-hiragana", question: "つ 的罗马音是？", options: ["tu", "tsu", "chi", "to"], answer: "tsu", explanation: "つ 读作 tsu，是初学者容易读错的音。", relatedLessonId: "lesson-002" },
    { id: "quiz-005", type: "kana", unitId: "unit-pre-kana-katakana", question: "ア 对应的平假名是？", options: ["あ", "い", "う", "え"], answer: "あ", explanation: "ア 是片假名，平假名对应 あ。", relatedLessonId: "lesson-003" },
    { id: "quiz-006", type: "kana", unitId: "unit-pre-kana-katakana", question: "ン 的罗马音是？", options: ["so", "n", "shi", "tsu"], answer: "n", explanation: "ン 是片假名的鼻音 n。", relatedLessonId: "lesson-003" },
    { id: "quiz-007", type: "vocabulary", unitId: "unit-sbj2-shokyu-1", level: "N5", question: "私 的中文意思是？", options: ["你", "我", "老师", "学生"], answer: "我", explanation: "私（わたし）表示“我”。" },
    { id: "quiz-008", type: "vocabulary", unitId: "unit-sbj2-shokyu-1", level: "N5", question: "学校 的中文意思是？", options: ["车站", "学校", "公司", "房间"], answer: "学校", explanation: "学校（がっこう）就是学校。" },
    { id: "quiz-009", type: "vocabulary", unitId: "unit-review-verb-forms", level: "N5", question: "飲む 的中文意思是？", options: ["吃", "看", "喝", "去"], answer: "喝", explanation: "飲む（のむ）表示喝。" },
    { id: "quiz-010", type: "vocabulary", unitId: "unit-pre-greetings", question: "こんにちは 通常表示？", options: ["再见", "你好", "晚安", "对不起"], answer: "你好", explanation: "こんにちは 是常见问候语，可理解为你好/下午好。" },
    { id: "quiz-011", type: "vocabulary", unitId: "unit-n3-vocabulary", level: "N3", difficulty: "普通", question: "アルバイト 的中文意思是？", options: ["打工，兼职", "车站", "学校", "确认"], answer: "打工，兼职", explanation: "アルバイト 是片假名词，表示打工或兼职。", relatedLessonId: "lesson-003" },
    { id: "quiz-012", type: "grammar", unitId: "unit-review-particles", level: "N5", question: "“喝水”中标记“水”的助词常用哪一个？", options: ["は", "を", "で", "に"], answer: "を", explanation: "水を飲みます。を 标记动作对象。", relatedLessonId: "lesson-004" },
    { id: "quiz-013", type: "grammar", unitId: "unit-sbj2-shokyu-1", level: "N5", question: "私は学生です 中 は 的读音是？", options: ["ha", "wa", "ga", "o"], answer: "wa", explanation: "は 作助词时读 wa。", relatedLessonId: "lesson-005" },
    { id: "quiz-014", type: "grammar", unitId: "unit-review-particles", level: "N5", question: "日本語___好きです。空格最自然的是？", options: ["を", "が", "で", "へ"], answer: "が", explanation: "喜欢的对象常用 が 标记：日本語が好きです。", relatedLessonId: "lesson-005" },
    { id: "quiz-015", type: "grammar", unitId: "unit-sbj2-shokyu-1", level: "N5", question: "これは本___。表示“这是书”。", options: ["です", "ます", "でした", "ません"], answer: "です", explanation: "名词判断句用 です。", relatedLessonId: "lesson-006" },
    { id: "quiz-016", type: "grammar", unitId: "unit-sbj2-shokyu-2", level: "N5", question: "离说话人近的“这个”是？", options: ["これ", "それ", "あれ", "どれ"], answer: "これ", explanation: "これ 表示离说话人近的这个。", relatedLessonId: "lesson-007" },
    { id: "quiz-017", type: "grammar", unitId: "unit-sbj2-shokyu-2", level: "N5", question: "この 后面通常要接什么？", options: ["名词", "句号", "动词ます形", "助词を"], answer: "名词", explanation: "この 是连体词，后面必须接名词。", relatedLessonId: "lesson-007" },
    { id: "quiz-018", type: "sentence", unitId: "unit-pre-greetings", question: "ありがとうございます。最合适的中文是？", options: ["谢谢您", "早上好", "对不起", "再见"], answer: "谢谢您", explanation: "ありがとうございます 是礼貌的感谢。", relatedLessonId: "lesson-010" },
    { id: "quiz-019", type: "sentence", unitId: "unit-pre-greetings", question: "こんにちは、田中さん。意思是？", options: ["田中先生，你好。", "田中先生，再见。", "田中先生，晚安。", "田中先生，对不起。"], answer: "田中先生，你好。", explanation: "こんにちは 是你好。", relatedLessonId: "lesson-010" },
    { id: "quiz-020", type: "sentence", unitId: "unit-pre-greetings", question: "私は中国人です。意思是？", options: ["我是中国人。", "我是日本人。", "你是中国人。", "这是中国。"], answer: "我是中国人。", explanation: "私は...です 表示“我是……”。", relatedLessonId: "lesson-010" },
    { id: "quiz-021", type: "sentence", unitId: "unit-review-particles", level: "N5", question: "水を飲みます。意思是？", options: ["喝水。", "吃饭。", "去学校。", "看书。"], answer: "喝水。", explanation: "水是水，飲みます 是喝。", relatedLessonId: "lesson-004" },
    { id: "quiz-022", type: "sentence", unitId: "unit-review-reading", level: "N5", question: "学校に行きます。意思是？", options: ["去学校。", "在学校学习。", "学校很大。", "学校有书。"], answer: "去学校。", explanation: "に 标记目的地，行きます 表示去。" },
    { id: "quiz-023", type: "sentence", unitId: "unit-review-reading", level: "N5", question: "机の上に本があります。意思是？", options: ["桌子上有书。", "我看书。", "书很新。", "这是书。"], answer: "桌子上有书。", explanation: "あります 表示有无生命物。" },
    { id: "quiz-024", type: "grammar", unitId: "unit-review-particles", level: "N5", question: "动作发生地点常用哪个助词？", options: ["で", "を", "は", "の"], answer: "で", explanation: "学校で勉強します。で 表示动作发生地点。" },
    { id: "quiz-025", type: "conjugation", unitId: "unit-review-verb-forms", level: "N5", question: "行く 的 ます形是？", options: ["行きます", "行います", "行くます", "行ました"], answer: "行きます", explanation: "行く 是一类动词，ます形为 行きます。", relatedLessonId: "lesson-006" },
    { id: "quiz-026", type: "conjugation", unitId: "unit-review-verb-forms", level: "N5", question: "食べる 的 ます形是？", options: ["食べます", "食べります", "食ます", "食べています"], answer: "食べます", explanation: "食べる 是二类动词，去る加ます。", relatedLessonId: "lesson-008" },
    { id: "quiz-027", type: "conjugation", unitId: "unit-review-verb-forms", level: "N5", question: "飲む 的过去礼貌形是？", options: ["飲みました", "飲みます", "飲みません", "飲んで"], answer: "飲みました", explanation: "飲む 的 ました 形是 飲みました。", relatedLessonId: "lesson-008" },
    { id: "quiz-028", type: "conjugation", unitId: "unit-review-verb-forms", level: "N5", question: "する 的 ません 形是？", options: ["しません", "すりません", "しませんでした", "します"], answer: "しません", explanation: "する 是三类动词，否定礼貌形是 しません。", relatedLessonId: "lesson-008" },
    { id: "quiz-029", type: "conjugation", unitId: "unit-review-verb-forms", level: "N5", question: "見る 的过去礼貌形是？", options: ["見ました", "見ます", "見ません", "見て"], answer: "見ました", explanation: "見る 的 ました 形是 見ました。", relatedLessonId: "lesson-009" },
    { id: "quiz-030", type: "conjugation", unitId: "unit-review-verb-forms", level: "N5", question: "来る 的 ませんでした 形是？", options: ["来ませんでした", "来ました", "来ません", "来て"], answer: "来ませんでした", explanation: "来る 的过去否定礼貌形是 来ませんでした。", relatedLessonId: "lesson-009" },
    { id: "quiz-sbj2-01-001", type: "grammar", unitId: "unit-sbj2-shokyu-1", textbookLesson: 1, level: "N5", question: "「我是学生」最自然的日语结构是？", options: ["私は学生です。", "私を学生です。", "私は学生ます。", "学生は私です。"], answer: "私は学生です。", explanation: "A は B です 用来表达“A 是 B”。这是原创演示题，后续可以替换或补充教材配套练习。" }
  ],
  { level: "预备", difficulty: "简单" }
);

export const quizzes: QuizQuestion[] = filterVisibleContent([
  ...baseQuizzes,
  ...generatedQuizzesFromJson
]);
