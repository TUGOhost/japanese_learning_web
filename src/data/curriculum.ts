import type { CurriculumStageLevel, TextbookBook } from "../types/learning";

export type CurriculumStage = {
  id: string;
  title: string;
  description: string;
  order: number;
  level: CurriculumStageLevel;
  units: CurriculumUnit[];
};

export type CurriculumUnit = {
  id: string;
  title: string;
  subtitle?: string;
  order: number;
  source?:
    | "原创入门"
    | "标准日本语第二版初级"
    | "标准日本语第二版中级"
    | "标准日本语第二版高级"
    | "N5巩固"
    | "N4巩固"
    | "N3进阶";
  textbookBook?: TextbookBook;
  textbookLesson?: number;
  description: string;
  objectives: string[];
  lessonIds: string[];
  vocabularyIds: string[];
  grammarIds: string[];
  sentencePatternIds: string[];
  quizIds: string[];
  prerequisites?: string[];
  estimatedMinutes: number;
};

const preUnits: CurriculumUnit[] = [
  {
    id: "unit-pre-writing-system",
    title: "认识日语文字系统",
    subtitle: "先知道平假名、片假名、汉字各自做什么",
    order: 1,
    source: "原创入门",
    description:
      "建立日语文字系统的基本认知，明确为什么 0 基础要先从假名开始。",
    objectives: [
      "认识平假名、片假名、汉字的基本用途",
      "知道罗马音只是入门辅助",
      "理解后续学习路线的顺序"
    ],
    lessonIds: ["lesson-001"],
    vocabularyIds: ["basic-001", "basic-005"],
    grammarIds: [],
    sentencePatternIds: [],
    quizIds: [],
    estimatedMinutes: 8
  },
  {
    id: "unit-pre-kana-hiragana",
    title: "平假名清音",
    subtitle: "五十音第一步",
    order: 2,
    source: "原创入门",
    description: "按行、段认识平假名清音，先能读，再进入词汇和句子。",
    objectives: [
      "理解あ行、か行等行段概念",
      "能读出常见平假名清音",
      "减少对罗马音的依赖"
    ],
    lessonIds: ["lesson-002"],
    vocabularyIds: [],
    grammarIds: [],
    sentencePatternIds: [],
    quizIds: ["quiz-001", "quiz-002", "quiz-003", "quiz-004"],
    prerequisites: ["unit-pre-writing-system"],
    estimatedMinutes: 15
  },
  {
    id: "unit-pre-kana-katakana",
    title: "片假名清音",
    subtitle: "外来语和片假名词基础",
    order: 3,
    source: "原创入门",
    description: "认识片假名清音，先掌握常见形状和读法。",
    objectives: [
      "理解片假名的主要用途",
      "能区分常见片假名",
      "认识简单外来语读音"
    ],
    lessonIds: ["lesson-003"],
    vocabularyIds: ["vocab-pre-katakana-001"],
    grammarIds: [],
    sentencePatternIds: [],
    quizIds: ["quiz-005", "quiz-006"],
    prerequisites: ["unit-pre-kana-hiragana"],
    estimatedMinutes: 15
  },
  {
    id: "unit-pre-kana-voiced",
    title: "浊音、半浊音、拗音",
    subtitle: "占位课次，后续可继续补充",
    order: 4,
    source: "原创入门",
    description:
      "预留给浊音、半浊音、拗音、长音和促音等发音基础内容。",
    objectives: [
      "认识浊音和半浊音的标记",
      "知道拗音由小假名组合",
      "为后续单词读音打基础"
    ],
    lessonIds: [],
    vocabularyIds: [],
    grammarIds: [],
    sentencePatternIds: [],
    quizIds: [],
    prerequisites: ["unit-pre-kana-katakana"],
    estimatedMinutes: 12
  },
  {
    id: "unit-pre-greetings",
    title: "基础寒暄",
    subtitle: "先整体记住高频表达",
    order: 5,
    source: "原创入门",
    description: "学习见面、感谢等基础寒暄，为进入教材课次做准备。",
    objectives: [
      "会读常见寒暄表达",
      "理解礼貌表达更适合初学者",
      "能听懂简单问候句"
    ],
    lessonIds: ["lesson-010"],
    vocabularyIds: ["basic-019", "basic-020"],
    grammarIds: [],
    sentencePatternIds: [],
    quizIds: ["quiz-018", "quiz-019", "quiz-020"],
    prerequisites: ["unit-pre-kana-voiced"],
    estimatedMinutes: 10
  }
];

type TextbookUnitConfig = {
  firstLesson: number;
  lastLesson: number;
  book: TextbookBook;
  slug: "shokyu" | "chukyu" | "koukyu";
  source:
    | "标准日本语第二版初级"
    | "标准日本语第二版中级"
    | "标准日本语第二版高级";
  firstPrerequisite: string;
};

const getTextbookUnitTitle = (
  lessonNumber: number,
  book: TextbookBook,
  source: TextbookUnitConfig["source"]
) => {
  if (source !== "标准日本语第二版初级") {
    return `${book}教材 JSON 内容`;
  }

  if (lessonNumber === 1) {
    return "身份、国籍和基础判断句";
  }

  if (lessonNumber === 2) {
    return "指示词和身边物品";
  }

  if (lessonNumber === 3) {
    return "地点和场所表达";
  }

  return `${book}教材 JSON 内容`;
};

const createTextbookUnit = ({
  lessonNumber,
  book,
  previousUnitId,
  slug,
  source
}: {
  lessonNumber: number;
  book: TextbookBook;
  previousUnitId: string;
  slug: TextbookUnitConfig["slug"];
  source: TextbookUnitConfig["source"];
}): CurriculumUnit => {
  const paddedLesson = String(lessonNumber).padStart(2, "0");
  const unitId = `unit-sbj2-${slug}-${lessonNumber}`;
  const hasDemoContent = source === "标准日本语第二版初级" && lessonNumber === 1;

  return {
    id: unitId,
    title: `标日${book} 第 ${lessonNumber} 课`,
    subtitle: getTextbookUnitTitle(lessonNumber, book, source),
    order: lessonNumber,
    source,
    textbookBook: book,
    textbookLesson: lessonNumber,
    description: hasDemoContent
      ? "按教材第 1 课的学习位置设计，当前仅放入少量原创示例，后续可继续补充。"
      : "本课由 Japanese_Note 解析生成的 JSON 内容自动关联到课程详情页。",
    objectives: hasDemoContent
      ? [
          "理解 A は B です 的基础判断句",
          "掌握少量身份和国籍表达",
          "能完成本课原创示例练习"
        ]
      : [
          "学习本课核心单词",
          "学习本课核心语法",
          "结合表达、句子和练习巩固"
        ],
    lessonIds: [],
    vocabularyIds: hasDemoContent
      ? ["vocab-sbj2-01-001", "vocab-sbj2-01-002", "vocab-sbj2-01-003"]
      : [],
    grammarIds: hasDemoContent ? ["grammar-sbj2-01-001"] : [],
    sentencePatternIds: hasDemoContent ? ["pattern-sbj2-01-001"] : [],
    quizIds: hasDemoContent ? [`quiz-sbj2-${paddedLesson}-001`] : [],
    prerequisites: [previousUnitId],
    estimatedMinutes: hasDemoContent ? 20 : 18
  };
};

const createTextbookUnits = (
  config: TextbookUnitConfig
): CurriculumUnit[] => {
  const units: CurriculumUnit[] = [];

  for (
    let lessonNumber = config.firstLesson;
    lessonNumber <= config.lastLesson;
    lessonNumber += 1
  ) {
    const previousUnitId =
      lessonNumber === config.firstLesson
        ? config.firstPrerequisite
        : `unit-sbj2-${config.slug}-${lessonNumber - 1}`;
    units.push(
      createTextbookUnit({
        lessonNumber,
        book: config.book,
        previousUnitId,
        slug: config.slug,
        source: config.source
      })
    );
  }

  return units;
};

const reviewUnits: CurriculumUnit[] = [
  {
    id: "unit-review-particles",
    title: "助词复习",
    subtitle: "N5/N4 巩固",
    order: 1,
    source: "N5巩固",
    description: "集中复习 は、が、を、に、で、へ、の 等基础助词。",
    objectives: ["整理基础助词功能", "通过句子判断助词", "修正中文直译习惯"],
    lessonIds: [],
    vocabularyIds: [],
    grammarIds: ["grammar-006", "grammar-007", "grammar-008", "grammar-009", "grammar-010"],
    sentencePatternIds: [],
    quizIds: ["quiz-024"],
    prerequisites: ["unit-sbj2-shokyu-48"],
    estimatedMinutes: 25
  },
  {
    id: "unit-review-verb-forms",
    title: "动词变形复习",
    subtitle: "N5/N4 巩固",
    order: 2,
    source: "N5巩固",
    description: "复习 ます、ません、ました、ませんでした 等礼貌体基础。",
    objectives: ["整理礼貌体动词变形", "区分现在、过去和否定", "用短句进行输出"],
    lessonIds: [],
    vocabularyIds: ["basic-012", "basic-013", "basic-014", "basic-015"],
    grammarIds: ["grammar-011", "grammar-012", "grammar-013", "grammar-014"],
    sentencePatternIds: ["pattern-006", "pattern-007", "pattern-008"],
    quizIds: ["quiz-025", "quiz-026", "quiz-027", "quiz-028", "quiz-029", "quiz-030"],
    prerequisites: ["unit-review-particles"],
    estimatedMinutes: 30
  },
  {
    id: "unit-review-adjectives",
    title: "形容词复习",
    subtitle: "N5/N4 巩固",
    order: 3,
    source: "N4巩固",
    description: "复习 い形容词、な形容词的基础连接方式。",
    objectives: ["区分 い形容词和 な形容词", "能描述人和事物", "避免中文式省略"],
    lessonIds: [],
    vocabularyIds: ["basic-016", "basic-017", "basic-018"],
    grammarIds: ["grammar-015"],
    sentencePatternIds: [],
    quizIds: [],
    prerequisites: ["unit-review-verb-forms"],
    estimatedMinutes: 20
  },
  {
    id: "unit-review-reading",
    title: "基础阅读训练",
    subtitle: "N5/N4 巩固",
    order: 4,
    source: "N4巩固",
    description: "用短句和短段落整合词汇、助词和基础语法。",
    objectives: ["读懂简单句子", "根据助词判断句子关系", "逐步提高阅读耐心"],
    lessonIds: [],
    vocabularyIds: [],
    grammarIds: [],
    sentencePatternIds: ["pattern-004", "pattern-005", "pattern-010", "pattern-011"],
    quizIds: ["quiz-022", "quiz-023"],
    prerequisites: ["unit-review-adjectives"],
    estimatedMinutes: 30
  }
];

const n3Units: CurriculumUnit[] = [
  {
    id: "unit-n3-vocabulary",
    title: "N3 词汇",
    subtitle: "进阶词汇集中学习",
    order: 1,
    source: "N3进阶",
    description: "进入 N3 后再集中学习更抽象、更长句中常见的词汇。",
    objectives: ["积累 N3 高频词", "结合例句理解用法", "区分近义表达"],
    lessonIds: [],
    vocabularyIds: [
      "n3-001",
      "n3-002",
      "n3-003",
      "n3-004",
      "n3-005",
      "n3-006",
      "n3-007",
      "n3-008",
      "n3-009",
      "n3-010",
      "n3-011",
      "n3-012",
      "n3-013",
      "n3-014",
      "n3-015",
      "n3-016",
      "n3-017",
      "n3-018",
      "n3-019",
      "n3-020"
    ],
    grammarIds: [],
    sentencePatternIds: [],
    quizIds: [],
    prerequisites: ["unit-review-reading"],
    estimatedMinutes: 35
  },
  {
    id: "unit-n3-grammar",
    title: "N3 语法",
    subtitle: "进阶语法占位",
    order: 2,
    source: "N3进阶",
    description: "预留给 N3 语法条目，避免和 0 基础内容混在一起。",
    objectives: ["补充 N3 语法", "用例句理解接续", "比较相近语法差异"],
    lessonIds: [],
    vocabularyIds: [],
    grammarIds: [],
    sentencePatternIds: [],
    quizIds: [],
    prerequisites: ["unit-n3-vocabulary"],
    estimatedMinutes: 30
  },
  {
    id: "unit-n3-reading",
    title: "N3 阅读句子",
    subtitle: "进阶阅读占位",
    order: 3,
    source: "N3进阶",
    description: "预留给 N3 阅读句子和短文训练。",
    objectives: ["补充 N3 阅读句", "练习长句拆解", "积累上下文推断能力"],
    lessonIds: [],
    vocabularyIds: [],
    grammarIds: [],
    sentencePatternIds: [],
    quizIds: [],
    prerequisites: ["unit-n3-grammar"],
    estimatedMinutes: 35
  }
];

export const curriculum: CurriculumStage[] = [
  {
    id: "stage-pre",
    title: "阶段 0：预备入门",
    description: "五十音、文字系统和基础寒暄。完成后再进入教材第 1 课。",
    order: 0,
    level: "预备",
    units: preUnits
  },
  {
    id: "stage-shokyu-jou",
    title: "阶段 1：初级上册路线",
    description: "预留《标准日本语（第二版）初级上》第 1 课到第 24 课。",
    order: 1,
    level: "初级上",
    units: createTextbookUnits({
      firstLesson: 1,
      lastLesson: 24,
      book: "初级上",
      slug: "shokyu",
      source: "标准日本语第二版初级",
      firstPrerequisite: "unit-pre-greetings"
    })
  },
  {
    id: "stage-shokyu-ge",
    title: "阶段 2：初级下册路线",
    description: "预留《标准日本语（第二版）初级下》第 25 课到第 48 课。",
    order: 2,
    level: "初级下",
    units: createTextbookUnits({
      firstLesson: 25,
      lastLesson: 48,
      book: "初级下",
      slug: "shokyu",
      source: "标准日本语第二版初级",
      firstPrerequisite: "unit-sbj2-shokyu-24"
    })
  },
  {
    id: "stage-review-n5-n4",
    title: "阶段 3：N5 / N4 巩固",
    description: "在初级教材路线后集中整理助词、动词、形容词和基础阅读。",
    order: 3,
    level: "N4",
    units: reviewUnits
  },
  {
    id: "stage-chukyu-jou",
    title: "阶段 4：中级上册路线",
    description: "由 JSON 内容驱动《标准日本语（第二版）中级上》第 1 课到第 16 课。",
    order: 4,
    level: "中级上",
    units: createTextbookUnits({
      firstLesson: 1,
      lastLesson: 16,
      book: "中级上",
      slug: "chukyu",
      source: "标准日本语第二版中级",
      firstPrerequisite: "unit-review-reading"
    })
  },
  {
    id: "stage-chukyu-ge",
    title: "阶段 5：中级下册路线",
    description: "由 JSON 内容驱动《标准日本语（第二版）中级下》第 17 课到第 32 课。",
    order: 5,
    level: "中级下",
    units: createTextbookUnits({
      firstLesson: 17,
      lastLesson: 32,
      book: "中级下",
      slug: "chukyu",
      source: "标准日本语第二版中级",
      firstPrerequisite: "unit-sbj2-chukyu-16"
    })
  },
  {
    id: "stage-koukyu-jou",
    title: "阶段 6：高级上册路线",
    description: "由 JSON 内容驱动《标准日本语（第二版）高级上》第 1 课到第 12 课。",
    order: 6,
    level: "高级上",
    units: createTextbookUnits({
      firstLesson: 1,
      lastLesson: 12,
      book: "高级上",
      slug: "koukyu",
      source: "标准日本语第二版高级",
      firstPrerequisite: "unit-sbj2-chukyu-32"
    })
  },
  {
    id: "stage-koukyu-ge",
    title: "阶段 7：高级下册路线",
    description: "由 JSON 内容驱动《标准日本语（第二版）高级下》第 13 课到第 24 课。",
    order: 7,
    level: "高级下",
    units: createTextbookUnits({
      firstLesson: 13,
      lastLesson: 24,
      book: "高级下",
      slug: "koukyu",
      source: "标准日本语第二版高级",
      firstPrerequisite: "unit-sbj2-koukyu-12"
    })
  },
  {
    id: "stage-n3",
    title: "阶段 8：N3 进阶",
    description: "N3 词汇、语法和阅读句子默认不混入 0 基础推荐。",
    order: 8,
    level: "N3",
    units: n3Units
  }
];
