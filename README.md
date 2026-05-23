# 从零开始学日语

面向 0 基础学习者的日语学习网站。项目现在支持按教材课次学习：五十音和入门认知先行，然后进入《标准日本语（第二版）》初级、中级和高级路线，内容由 `Japanese_Note` Markdown 解析生成的 JSON 驱动。

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
- 中级/高级：由 `Japanese_Note` 解析生成的 JSON 内容驱动。
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
- `textbookBook`：教材册别，支持 `初级上`、`初级下`、`中级上`、`中级下`、`高级上`、`高级下`。
- `textbookLesson`：教材课次编号，例如第 3 课就是 `3`。适合批量筛选和后续维护。

推荐三者都写。这样以后只往 data 文件补内容，不需要改组件逻辑。

## Japanese_Note Markdown 导入

本项目现在以 Python 解析器作为主内容入口：从 `Japanese_Note` Markdown 生成 JSON，前端再通过 `src/data/contentRepository.ts` 统一消费这些 JSON。第三方教材笔记不会硬编码进组件。

CI 默认读取仓库内的快照目录：

```bash
content/sources/japanese-note/
```

如果你已经把仓库 clone 到项目根目录的 `Japanese_Note/`，可以同步 Markdown 到快照目录：

```bash
mkdir -p content/sources/japanese-note
cp Japanese_Note/*.md content/sources/japanese-note/
```

一键解析、校验并生成报告：

```bash
npm run content:all:japanese-note
```

只运行 Python 解析器：

```bash
npm run content:parse:japanese-note
```

Python 解析器测试：

```bash
npm run test:python
```

主要输出：

- `content/intermediate/japanese-note/parsed.raw.json`
- `content/intermediate/japanese-note/imported.raw.json`
- `content/generated/vocabulary.json`
- `content/generated/grammar.json`
- `content/generated/sentences.json`
- `content/generated/expressions.json`
- `content/generated/quizzes.json`
- `reports/validation-report.md`
- `reports/review-queue.md`
- `reports/japanese-note-import-report.md`

源文件用途由 `content/source-manifest/japanese-note.ts` 声明；Python 解析器也会按标准教材文件名识别初级、中级、高级的词汇表和语法总结。下册源文件如果使用“第1课～第24课”的相对编号，会映射到对应全局课次，例如初级下映射到第 25-48 课。

低置信度条目会保留在中间 JSON 和 `reports/review-queue.md`，但带有 `importStatus: "needs_review"`，前端默认不会展示。

## GitHub Actions

`.github/workflows/ci.yml` 会在 push 和 pull request 中执行：

```bash
npm ci
npm run test:python
npm run content:all:japanese-note
git diff --exit-code content/generated content/intermediate/japanese-note reports
npm test
npm run build
```

如果你修改了 `Japanese_Note` 源文件、Python 解析器或内容 schema，需要本地运行 `npm run content:all:japanese-note` 并提交生成后的 JSON 与报告。

## 教材模式和自由模式

- 教材模式：默认模式。首页推荐严格按 `curriculum.ts` 顺序推进，练习和闪卡默认只显示当前或已解锁内容。
- 自由学习模式：可以浏览全部课程和 N3 内容，但页面仍显示难度、进阶标签和建议顺序。

学习模式保存在 `localStorage.learningMode` 对应的进度对象字段中。

## 版权说明

本项目只预留适配《标准日本语（第二版）》初级、中级、高级的课次结构和字段，不完整复制教材课文、例句或练习。仓库中的教材课次内容用于说明如何关联 `unitId`、词汇、语法、句子和练习。请根据你手头教材自行补充，并避免大段复刻教材原文。

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

公开部署前还需要生成公开内容快照，避免 `private_only` JSON 条目进入静态构建产物：

```bash
npm run content:prepare-public
VITE_CONTENT_MODE=public npm run build
```

`content:prepare-public` 会就地过滤 `content/generated/*.json`。如果你本地还要继续用完整私有内容开发，重新运行 `npm run content:all:japanese-note` 即可恢复完整生成结果。

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

仓库已提供 `.github/workflows/deploy-pages.yml`，push 到 `main` 或手动运行 `Deploy GitHub Pages` workflow 后会自动部署 `dist`。

第一次使用时，在 GitHub 仓库 `Settings -> Pages` 中把发布源设置为 `GitHub Actions`。workflow 会执行测试、重新生成内容、校验生成文件是否已提交、过滤公开 JSON、再用 GitHub Pages 官方 artifact 部署动作发布静态页面。

Pages 构建会设置：

```bash
GITHUB_PAGES=true
VITE_CONTENT_MODE=public
```

`GITHUB_PAGES=true` 会让 Vite 自动使用仓库名作为 `base`，例如本仓库发布到 `/japanese_learning_web/`。如果以后配置自定义域名或需要覆盖路径，可以在 workflow 的 build step 中设置 `VITE_BASE_PATH=/`。

项目使用 Hash 路由，例如 `#/home`、`#/kana`、`#/lessons`，刷新页面不依赖服务器 fallback 配置。
