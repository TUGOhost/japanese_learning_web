export type JapaneseNoteContentKind =
  | "vocabulary"
  | "grammar"
  | "mixed"
  | "kana"
  | "supplement"
  | "unknown";

export type JapaneseNoteSourceFile = {
  id: string;
  fileName: string;
  relativePath: string;
  contentKind: JapaneseNoteContentKind;
  textbookSeries?: "标准日本语第二版";
  textbookLevel?: "初级" | "中级" | "高级";
  textbookBook?:
    | "初级上"
    | "初级下"
    | "中级上"
    | "中级下"
    | "高级上"
    | "高级下";
  lessonStart?: number;
  lessonEnd?: number;
  lessonNumberingMode?: "absolute" | "relative";
  globalLessonOffset?: number;
  publicImportPolicy:
    | "private_only"
    | "needs_review"
    | "safe_original_notes_only";
  notes?: string;
};

const supplement = (
  id: string,
  fileName: string,
  notes?: string
): JapaneseNoteSourceFile => ({
  id,
  fileName,
  relativePath: fileName,
  contentKind: "supplement",
  publicImportPolicy: "needs_review",
  notes
});

export const japaneseNoteSourceManifest: JapaneseNoteSourceFile[] = [
  {
    id: "jnote-vocab-shokyu-jou",
    fileName: "新版标准日本语初级词汇表_上册.md",
    relativePath: "新版标准日本语初级词汇表_上册.md",
    contentKind: "vocabulary",
    textbookSeries: "标准日本语第二版",
    textbookLevel: "初级",
    textbookBook: "初级上",
    lessonStart: 1,
    lessonEnd: 24,
    lessonNumberingMode: "absolute",
    globalLessonOffset: 0,
    publicImportPolicy: "private_only"
  },
  {
    id: "jnote-vocab-shokyu-ge",
    fileName: "新版标准日本语初级词汇表_下册.md",
    relativePath: "新版标准日本语初级词汇表_下册.md",
    contentKind: "vocabulary",
    textbookSeries: "标准日本语第二版",
    textbookLevel: "初级",
    textbookBook: "初级下",
    lessonStart: 25,
    lessonEnd: 48,
    lessonNumberingMode: "absolute",
    globalLessonOffset: 24,
    publicImportPolicy: "private_only",
    notes: "如果源文件改为第1-24课相对编号，可将 lessonNumberingMode 调整为 relative。"
  },
  {
    id: "jnote-grammar-shokyu-jou",
    fileName: "新版标准日本语初级语法总结_上册.md",
    relativePath: "新版标准日本语初级语法总结_上册.md",
    contentKind: "grammar",
    textbookSeries: "标准日本语第二版",
    textbookLevel: "初级",
    textbookBook: "初级上",
    lessonStart: 1,
    lessonEnd: 24,
    lessonNumberingMode: "absolute",
    globalLessonOffset: 0,
    publicImportPolicy: "private_only"
  },
  {
    id: "jnote-grammar-shokyu-ge",
    fileName: "新版标准日本语初级语法总结_下册.md",
    relativePath: "新版标准日本语初级语法总结_下册.md",
    contentKind: "grammar",
    textbookSeries: "标准日本语第二版",
    textbookLevel: "初级",
    textbookBook: "初级下",
    lessonStart: 25,
    lessonEnd: 48,
    lessonNumberingMode: "absolute",
    globalLessonOffset: 24,
    publicImportPolicy: "private_only",
    notes: "如果源文件改为第1-24课相对编号，可将 lessonNumberingMode 调整为 relative。"
  },
  {
    id: "jnote-kana",
    fileName: "日语五十音图.md",
    relativePath: "日语五十音图.md",
    contentKind: "kana",
    publicImportPolicy: "private_only"
  },
  {
    id: "jnote-vocab-chukyu-jou",
    fileName: "新版标准日本语中级词汇表_上册.md",
    relativePath: "新版标准日本语中级词汇表_上册.md",
    contentKind: "vocabulary",
    textbookSeries: "标准日本语第二版",
    textbookLevel: "中级",
    textbookBook: "中级上",
    lessonStart: 1,
    lessonEnd: 16,
    lessonNumberingMode: "absolute",
    globalLessonOffset: 0,
    publicImportPolicy: "private_only"
  },
  {
    id: "jnote-vocab-chukyu-ge",
    fileName: "新版标准日本语中级词汇表_下册.md",
    relativePath: "新版标准日本语中级词汇表_下册.md",
    contentKind: "vocabulary",
    textbookSeries: "标准日本语第二版",
    textbookLevel: "中级",
    textbookBook: "中级下",
    lessonStart: 17,
    lessonEnd: 32,
    lessonNumberingMode: "absolute",
    globalLessonOffset: 16,
    publicImportPolicy: "private_only"
  },
  {
    id: "jnote-grammar-chukyu-jou",
    fileName: "新版标准日本语中级语法总结_上册.md",
    relativePath: "新版标准日本语中级语法总结_上册.md",
    contentKind: "grammar",
    textbookSeries: "标准日本语第二版",
    textbookLevel: "中级",
    textbookBook: "中级上",
    lessonStart: 1,
    lessonEnd: 16,
    lessonNumberingMode: "absolute",
    globalLessonOffset: 0,
    publicImportPolicy: "private_only"
  },
  {
    id: "jnote-grammar-chukyu-ge",
    fileName: "新版标准日本语中级语法总结_下册.md",
    relativePath: "新版标准日本语中级语法总结_下册.md",
    contentKind: "grammar",
    textbookSeries: "标准日本语第二版",
    textbookLevel: "中级",
    textbookBook: "中级下",
    lessonStart: 17,
    lessonEnd: 32,
    lessonNumberingMode: "absolute",
    globalLessonOffset: 16,
    publicImportPolicy: "private_only"
  },
  {
    id: "jnote-vocab-koukyu-jou",
    fileName: "新版标准日本语高级词汇表_上册.md",
    relativePath: "新版标准日本语高级词汇表_上册.md",
    contentKind: "vocabulary",
    textbookSeries: "标准日本语第二版",
    textbookLevel: "高级",
    textbookBook: "高级上",
    lessonStart: 1,
    lessonEnd: 12,
    lessonNumberingMode: "absolute",
    globalLessonOffset: 0,
    publicImportPolicy: "private_only"
  },
  {
    id: "jnote-vocab-koukyu-ge",
    fileName: "新版标准日本语高级词汇表_下册.md",
    relativePath: "新版标准日本语高级词汇表_下册.md",
    contentKind: "vocabulary",
    textbookSeries: "标准日本语第二版",
    textbookLevel: "高级",
    textbookBook: "高级下",
    lessonStart: 13,
    lessonEnd: 24,
    lessonNumberingMode: "absolute",
    globalLessonOffset: 12,
    publicImportPolicy: "private_only"
  },
  {
    id: "jnote-grammar-koukyu-jou",
    fileName: "新版标准日本语高级语法总结_上册.md",
    relativePath: "新版标准日本语高级语法总结_上册.md",
    contentKind: "grammar",
    textbookSeries: "标准日本语第二版",
    textbookLevel: "高级",
    textbookBook: "高级上",
    lessonStart: 1,
    lessonEnd: 12,
    lessonNumberingMode: "absolute",
    globalLessonOffset: 0,
    publicImportPolicy: "private_only"
  },
  {
    id: "jnote-grammar-koukyu-ge",
    fileName: "新版标准日本语高级语法总结_下册.md",
    relativePath: "新版标准日本语高级语法总结_下册.md",
    contentKind: "grammar",
    textbookSeries: "标准日本语第二版",
    textbookLevel: "高级",
    textbookBook: "高级下",
    lessonStart: 13,
    lessonEnd: 24,
    lessonNumberingMode: "absolute",
    globalLessonOffset: 12,
    publicImportPolicy: "private_only"
  },
  supplement("jnote-vocab-extra-1", "新版标准日本语词汇补充一.md"),
  supplement("jnote-vocab-extra-2", "新版标准日本语词汇补充二.md"),
  supplement("jnote-word-notes-1", "日语单词积累笔记一.md"),
  supplement("jnote-word-notes-2", "日语单词积累笔记二.md"),
  supplement("jnote-word-notes-3", "日语单词积累笔记三.md"),
  supplement("jnote-word-notes-4", "日语单词积累笔记四.md"),
  supplement("jnote-study-notes", "日语学习笔记.md")
];

export const japaneseNoteSourceManifestByPath = new Map(
  japaneseNoteSourceManifest.map((sourceFile) => [
    sourceFile.relativePath,
    sourceFile
  ])
);
