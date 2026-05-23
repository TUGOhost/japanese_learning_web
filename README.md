# 从零开始学日语

面向 0 基础学习者的日语学习网站。项目现在支持按教材课次学习：五十音和入门认知先行，然后进入《标准日本语（第二版）初级》初级上第 1-24 课、初级下第 25-48 课，之后再做 N5/N4 巩固和 N3 进阶。

技术栈：React + Vite + TypeScript + Tailwind CSS。所有学习记录保存在当前浏览器的 `localStorage`，不需要后端。

## 运行

```bash
npm install
npm run dev
```

常用命令：

```bash
npm run dev      # 本地开发
npm run build    # 类型检查并构建到 dist
npm run preview  # 本地预览生产构建
npm test         # 运行测试
npm run typecheck # 只运行 TypeScript 检查
```

## 课程路线

完整路线定义在 `src/data/curriculum.ts`。

- 预备入门：文字系统、平假名、片假名、浊音/拗音占位、基础寒暄。
- 初级上：`unit-sbj2-shokyu-1` 到 `unit-sbj2-shokyu-24`。
- 初级下：`unit-sbj2-shokyu-25` 到 `unit-sbj2-shokyu-48`。
- N5/N4 巩固：助词、动词变形、形容词、基础阅读。
- N3 进阶：N3 词汇、语法、阅读句子。

首页推荐、课程解锁、练习和闪卡默认都通过 `src/utils/curriculum.ts` 按路线顺序计算，不再直接从 `lessons` 或 `allVocabulary` 随机取内容。

## 添加某一课词汇

词汇数据在 `src/data/vocabulary.ts`。给《标准日本语（第二版）初级上》第 3 课补词汇时，建议使用：

```ts
{
  id: "vocab-sbj2-03-001",
  word: "教室",
  kana: "きょうしつ",
  meaning: "教室",
  partOfSpeech: "名词",
  example: "ここは教室です。",
  exampleMeaning: "这里是教室。",
  level: "N5",
  source: "标准日本语第二版初级",
  textbookBook: "初级上",
  textbookLesson: 3,
  unitId: "unit-sbj2-shokyu-3",
  isCore: true,
  tags: ["第3课"]
}
```

## 添加某一课语法

语法数据在 `src/data/grammar.ts`：

```ts
{
  id: "grammar-sbj2-03-001",
  title: "ここ / そこ / あそこ",
  level: "N5",
  source: "标准日本语第二版初级",
  textbookBook: "初级上",
  textbookLesson: 3,
  unitId: "unit-sbj2-shokyu-3",
  isCore: true,
  category: "指示词",
  structure: "ここ / そこ / あそこ",
  meaning: "这里 / 那里 / 那边",
  explanation: "用来指代场所。先按离说话人、听话人、双方都远来理解。",
  examples: [{ japanese: "ここは教室です。", chinese: "这里是教室。" }]
}
```

句型数据在 `src/data/sentencePatterns.ts`，字段同样支持 `unitId`、`textbookBook`、`textbookLesson`。

## 添加某一课句子

句子数据在 `src/data/sentences.ts`：

```ts
{
  id: "sentence-sbj2-03-001",
  japanese: "ここは教室です。",
  reading: "ここはきょうしつです",
  chinese: "这里是教室。",
  level: "N5",
  unitId: "unit-sbj2-shokyu-3",
  textbookBook: "初级上",
  textbookLesson: 3,
  grammarIds: ["grammar-sbj2-03-001"],
  vocabularyIds: ["vocab-sbj2-03-001"],
  source: "标准日本语第二版初级"
}
```

## 添加某一课练习题

练习数据在 `src/data/quizzes.ts`：

```ts
{
  id: "quiz-sbj2-03-001",
  type: "grammar",
  level: "N5",
  unitId: "unit-sbj2-shokyu-3",
  textbookLesson: 3,
  difficulty: "简单",
  question: "「这里是教室」最自然的日语是？",
  options: ["ここは教室です。", "ここを教室です。", "教室にここです。", "ここは教室ます。"],
  answer: "ここは教室です。",
  explanation: "场所判断句可以用 A は B です。"
}
```

题型支持：`kana`、`vocabulary`、`grammar`、`sentence`、`conjugation`。

## unitId、textbookBook、textbookLesson

- `unitId`：网站内部学习单元 ID，用来把词汇、语法、句子、练习精准挂到某一课。课程详情页优先按它取内容。
- `textbookBook`：教材册别，只能是 `初级上` 或 `初级下`。
- `textbookLesson`：教材课次编号，例如第 3 课就是 `3`。适合批量筛选和后续维护。

推荐三者都写。这样以后只往 data 文件补内容，不需要改组件逻辑。

## Japanese_Note Markdown 导入

本项目支持从本地导入 `fukangwei/Japanese_Note` 的 Markdown 笔记，但不会把第三方内容硬编码进组件。导入源放在：

```bash
content/sources/japanese-note/
```

如果你已经把仓库 clone 到项目根目录的 `Japanese_Note/`，可以复制 Markdown：

```bash
mkdir -p content/sources/japanese-note
cp Japanese_Note/*.md content/sources/japanese-note/
```

导入流水线命令：

```bash
npm run content:scan:japanese-note
npm run content:split:japanese-note
npm run content:import:japanese-note
npm run content:generate
npm run content:validate
npm run content:report:japanese-note
```

一键运行：

```bash
LESSON_RANGE=1-3 npm run content:all:japanese-note
```

导入第 1-24 课：

```bash
LESSON_RANGE=1-24 npm run content:all:japanese-note
```

主要输出：

- `reports/japanese-note-inventory.md`
- `reports/japanese-note-source-structure.json`
- `content/intermediate/japanese-note/lesson-segments.json`
- `content/intermediate/japanese-note/imported.raw.json`
- `content/generated/*.generated.ts`
- `reports/validation-report.md`
- `reports/review-queue.md`
- `reports/japanese-note-import-report.md`

源文件用途由 `content/source-manifest/japanese-note.ts` 声明。下册源文件如果使用“第1课～第24课”的相对编号，可以把对应 manifest 项设置为 `lessonNumberingMode: "relative"` 并保留 `globalLessonOffset: 24`，导入时会映射到第 25-48 课。

默认只建议先导入初级上第 1-3 课，确认报告和 review queue 后再扩大范围。

## 教材模式和自由模式

- 教材模式：默认模式。首页推荐严格按 `curriculum.ts` 顺序推进，练习和闪卡默认只显示当前或已解锁内容。
- 自由学习模式：可以浏览全部课程和 N3 内容，但页面仍显示难度、进阶标签和建议顺序。

学习模式保存在 `localStorage.learningMode` 对应的进度对象字段中。

## 版权说明

本项目只预留适配《标准日本语（第二版）初级》的课次结构和字段，不完整复制教材课文、例句或练习。仓库中的教材课次内容是少量原创演示数据，用于说明如何关联 `unitId`、词汇、语法、句子和练习。请根据你手头教材自行补充，并避免大段复刻教材原文。

从 `fukangwei/Japanese_Note` 导入的内容默认带有：

```ts
publishStatus: "private_only"
```

这类内容只适合本地个人学习。公开构建默认不展示 `private_only` 内容；只有确认是原创或已改写并标记为 `safe_to_publish` 的内容，才适合公开发布。课程详情页在本地模式下会提示：

> 该内容来自本地导入源，仅供个人学习使用。

展示模式通过环境变量控制：

```bash
VITE_CONTENT_MODE=private npm run dev  # 默认，显示 private_only + safe_to_publish
VITE_CONTENT_MODE=public npm run build # 只显示 safe_to_publish 和原创内容
```

## localStorage

学习进度 key：`japanese-learning-progress-v2`。

保存字段：

- `learningMode`
- `completedUnitIds`
- `completedLessonIds`
- `masteredVocabularyIds`
- `favoriteVocabularyIds`
- `masteredGrammarIds`
- `favoriteGrammarIds`
- `completedQuizIds`
- `quizStats.totalAnswered`
- `quizStats.correctAnswered`
- `currentUnitId`
- `currentStageId`
- `lastStudiedUnitId`

旧版 `completedPracticeIds`、`quiz.completedCount`、`quiz.correctCount`、`recentLessonId` 和 `n3-vocabulary-progress-v1` 会在读取时自动兼容，不会因为缺字段导致页面报错。

## 静态部署

项目是纯静态网站，构建产物在 `dist`。

### Vercel

1. Framework Preset 选择 `Vite`。
2. Build Command 使用 `npm run build`。
3. Output Directory 使用 `dist`。

### Netlify

1. Build command 使用 `npm run build`。
2. Publish directory 使用 `dist`。

### GitHub Pages

```bash
npm run build
```

将 `dist` 目录作为发布目录即可。项目使用 Hash 路由，例如 `#/home`、`#/kana`、`#/lessons`，刷新页面不依赖服务器 fallback 配置。
