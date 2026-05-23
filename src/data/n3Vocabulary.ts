import type { VocabularyItem } from "../types/vocabulary";

type N3VocabularySeed = Omit<
  VocabularyItem,
  "level" | "source" | "unitId" | "isCore"
>;

export const n3Vocabulary: VocabularyItem[] = ([
  {
    id: "n3-001",
    word: "相談",
    kana: "そうだん",
    meaning: "商量，咨询",
    partOfSpeech: "名词",
    example: "困ったときは先生に相談してください。",
    exampleMeaning: "遇到困难时请和老师商量。",
    tags: ["生活", "沟通"]
  },
  {
    id: "n3-002",
    word: "準備",
    kana: "じゅんび",
    meaning: "准备",
    partOfSpeech: "名词",
    example: "旅行の準備はもう終わりましたか。",
    exampleMeaning: "旅行的准备已经完成了吗？",
    tags: ["生活"]
  },
  {
    id: "n3-003",
    word: "連絡",
    kana: "れんらく",
    meaning: "联系，通知",
    partOfSpeech: "名词",
    example: "駅に着いたら連絡します。",
    exampleMeaning: "到车站后我会联系你。",
    tags: ["沟通"]
  },
  {
    id: "n3-004",
    word: "約束",
    kana: "やくそく",
    meaning: "约定，承诺",
    partOfSpeech: "名词",
    example: "友だちとの約束を忘れてしまいました。",
    exampleMeaning: "我忘记了和朋友的约定。",
    tags: ["生活", "沟通"]
  },
  {
    id: "n3-005",
    word: "都合",
    kana: "つごう",
    meaning: "方便，情况，安排",
    partOfSpeech: "名词",
    example: "明日は都合が悪いです。",
    exampleMeaning: "明天不太方便。",
    tags: ["生活"]
  },
  {
    id: "n3-006",
    word: "必要",
    kana: "ひつよう",
    meaning: "必要，需要",
    partOfSpeech: "な形容词",
    example: "申し込みにはパスポートが必要です。",
    exampleMeaning: "报名需要护照。",
    tags: ["学习", "生活"]
  },
  {
    id: "n3-007",
    word: "残念",
    kana: "ざんねん",
    meaning: "遗憾，可惜",
    partOfSpeech: "な形容词",
    example: "試合が中止になって残念です。",
    exampleMeaning: "比赛取消了，真遗憾。",
    tags: ["感受"]
  },
  {
    id: "n3-008",
    word: "安全",
    kana: "あんぜん",
    meaning: "安全",
    partOfSpeech: "な形容词",
    example: "この道は夜でも安全です。",
    exampleMeaning: "这条路即使晚上也很安全。",
    tags: ["生活"]
  },
  {
    id: "n3-009",
    word: "危険",
    kana: "きけん",
    meaning: "危险",
    partOfSpeech: "な形容词",
    example: "ここで泳ぐのは危険です。",
    exampleMeaning: "在这里游泳很危险。",
    tags: ["生活"]
  },
  {
    id: "n3-010",
    word: "確認",
    kana: "かくにん",
    meaning: "确认",
    partOfSpeech: "名词",
    example: "出発時間を確認してください。",
    exampleMeaning: "请确认出发时间。",
    tags: ["工作", "学习"]
  },
  {
    id: "n3-011",
    word: "説明",
    kana: "せつめい",
    meaning: "说明，解释",
    partOfSpeech: "名词",
    example: "使い方をもう一度説明します。",
    exampleMeaning: "我再说明一次使用方法。",
    tags: ["学习", "沟通"]
  },
  {
    id: "n3-012",
    word: "返事",
    kana: "へんじ",
    meaning: "回复，回答",
    partOfSpeech: "名词",
    example: "メールの返事を待っています。",
    exampleMeaning: "我正在等邮件回复。",
    tags: ["沟通"]
  },
  {
    id: "n3-013",
    word: "選ぶ",
    kana: "えらぶ",
    meaning: "选择",
    partOfSpeech: "动词",
    example: "好きな席を選んでください。",
    exampleMeaning: "请选择喜欢的座位。",
    tags: ["生活"]
  },
  {
    id: "n3-014",
    word: "比べる",
    kana: "くらべる",
    meaning: "比较",
    partOfSpeech: "动词",
    example: "二つの商品を比べてから買います。",
    exampleMeaning: "比较两个商品后再买。",
    tags: ["生活", "学习"]
  },
  {
    id: "n3-015",
    word: "増える",
    kana: "ふえる",
    meaning: "增加",
    partOfSpeech: "动词",
    example: "最近、外国人観光客が増えています。",
    exampleMeaning: "最近外国游客正在增加。",
    tags: ["社会"]
  },
  {
    id: "n3-016",
    word: "減る",
    kana: "へる",
    meaning: "减少",
    partOfSpeech: "动词",
    example: "運動するとストレスが減ります。",
    exampleMeaning: "运动的话压力会减少。",
    tags: ["生活"]
  },
  {
    id: "n3-017",
    word: "必ず",
    kana: "かならず",
    meaning: "一定，必定",
    partOfSpeech: "副词",
    example: "明日までに必ず提出してください。",
    exampleMeaning: "请务必在明天之前提交。",
    tags: ["学习", "工作"]
  },
  {
    id: "n3-018",
    word: "たぶん",
    kana: "たぶん",
    meaning: "大概，也许",
    partOfSpeech: "副词",
    example: "たぶん午後から雨が降ります。",
    exampleMeaning: "下午大概会下雨。",
    tags: ["生活"]
  },
  {
    id: "n3-019",
    word: "はっきり",
    kana: "はっきり",
    meaning: "清楚地，明确地",
    partOfSpeech: "副词",
    example: "名前をはっきり書いてください。",
    exampleMeaning: "请把名字写清楚。",
    tags: ["学习", "沟通"]
  },
  {
    id: "n3-020",
    word: "アルバイト",
    kana: "アルバイト",
    meaning: "打工，兼职",
    partOfSpeech: "片假名词",
    example: "週末にカフェでアルバイトをしています。",
    exampleMeaning: "我周末在咖啡店打工。",
    tags: ["工作", "生活"]
  }
] satisfies N3VocabularySeed[]).map((item) => ({
  ...item,
  level: "N3",
  source: "原创",
  unitId: "unit-n3-vocabulary",
  isCore: true,
  tags: [...(item.tags ?? []), "进阶词汇"]
}));
