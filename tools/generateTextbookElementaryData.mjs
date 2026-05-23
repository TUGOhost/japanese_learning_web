import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const SOURCE = "标准日本语第二版初级";

const vocabularySources = [
  {
    file: "Japanese_Note/新版标准日本语初级词汇表_上册.md",
    book: "初级上"
  },
  {
    file: "Japanese_Note/新版标准日本语初级词汇表_下册.md",
    book: "初级下"
  }
];

const grammarSources = [
  {
    file: "Japanese_Note/新版标准日本语初级语法总结_上册.md",
    book: "初级上"
  },
  {
    file: "Japanese_Note/新版标准日本语初级语法总结_下册.md",
    book: "初级下"
  }
];

const partOfSpeechLabels = new Map([
  ["名", "名词"],
  ["代", "代词"],
  ["疑", "疑问词"],
  ["副", "副词"],
  ["叹", "叹词"],
  ["专", "专有名词"],
  ["连体", "连体词"],
  ["接续", "接续词"],
  ["助", "助词"],
  ["形1", "一类形容词"],
  ["形2", "二类形容词"],
  ["动1", "一类动词"],
  ["动2", "二类动词"],
  ["动3", "三类动词"],
  ["動1", "一类动词"],
  ["動2", "二类动词"],
  ["動3", "三类动词"]
]);

const cleanInline = (value) =>
  value
    .replace(/<!--more-->/g, "")
    .replace(/&emsp;/g, "")
    .replace(/`/g, "")
    .replace(/\s+/g, " ")
    .trim();

const cleanSpacing = (value) =>
  value
    .replace(/<!--more-->/g, "")
    .replace(/&emsp;/g, "")
    .replace(/\s+/g, " ")
    .trim();

const stripParentheticalAscii = (value) =>
  value.replace(/[（(][A-Za-z0-9 .,+~/-]+[）)]/g, "").trim();

const hasJapaneseText = (value) =>
  /[\u3040-\u30ff\u3400-\u9fff々〆ヶー]/.test(value);

const normalizePartOfSpeech = (value) => {
  const cleaned = cleanInline(value);
  return partOfSpeechLabels.get(cleaned) ?? cleaned;
};

const getLevelForLesson = (lesson) => (lesson <= 24 ? "N5" : "N4");

const getLessonMeta = (lesson, book) => ({
  level: getLevelForLesson(lesson),
  source: SOURCE,
  textbookBook: book,
  textbookLesson: lesson,
  unitId: `unit-sbj2-shokyu-${lesson}`,
  isCore: true,
  tags: [`第${lesson}课`]
});

const splitLessons = (file) => {
  const fullPath = path.join(repoRoot, file);
  const lines = fs.readFileSync(fullPath, "utf8").split(/\r?\n/);
  const lessons = new Map();
  let currentLesson;

  for (const line of lines) {
    const heading = line.match(/^### 第(\d+)课/);

    if (heading) {
      currentLesson = Number(heading[1]);
      lessons.set(currentLesson, []);
      continue;
    }

    if (currentLesson) {
      lessons.get(currentLesson).push(line);
    }
  }

  return lessons;
};

const parseTermCell = (cell) => {
  const cellWithoutParentheticals = cell.replace(/[（(][^()（）]*[）)]/g, "");
  const backtickTerms = [...cellWithoutParentheticals.matchAll(/`([^`]+)`/g)]
    .map((match) => cleanInline(match[1]))
    .filter(Boolean);
  const parentheticalTerms = [
    ...cell.matchAll(/[（(]([^()（）]+)[）)]/g)
  ]
    .map((match) => cleanInline(match[1]))
    .filter((term) => term && hasJapaneseText(term));
  const firstTerm = backtickTerms[0] ?? cleanInline(cell);
  const parentheticalWord = parentheticalTerms[0];
  const shouldUseParenthetical =
    parentheticalWord && (!parentheticalWord.startsWith("~") || !/[\u30a0-\u30ff]/.test(firstTerm));
  const word = shouldUseParenthetical
    ? stripParentheticalAscii(parentheticalWord)
    : stripParentheticalAscii(firstTerm);
  const kana = backtickTerms.length > 0 ? backtickTerms.join(" / ") : word;

  return {
    word: word || kana,
    kana: kana || word
  };
};

const parseVocabularyEntry = (termCell, partOfSpeechCell, meaningCell) => {
  if (!termCell.includes("`")) {
    return undefined;
  }

  const partOfSpeech = normalizePartOfSpeech(partOfSpeechCell);
  const meaning = cleanInline(meaningCell);
  const { word, kana } = parseTermCell(termCell);

  if (!word || !kana || !partOfSpeech || !meaning || partOfSpeech === "词性") {
    return undefined;
  }

  return {
    word,
    kana,
    meaning,
    partOfSpeech
  };
};

const parseVocabularyRows = (lines, lesson, book) => {
  const entries = [];

  for (const line of lines) {
    if (!line.includes("|") || !line.includes("`")) {
      continue;
    }

    const cells = line.split("|").map((cell) => cell.trim());

    if (
      cells.length < 6 ||
      cells[0].includes("单词") ||
      cells[0].startsWith("---")
    ) {
      continue;
    }

    const left = parseVocabularyEntry(cells[0], cells[1], cells[2]);
    const right = parseVocabularyEntry(cells[3], cells[4], cells[5]);

    if (left) {
      entries.push(left);
    }

    if (right) {
      entries.push(right);
    }
  }

  return entries.map((entry, index) => {
    const id = `vocab-sbj2-${String(lesson).padStart(2, "0")}-note-${String(
      index + 1
    ).padStart(3, "0")}`;

    return {
      id,
      ...entry,
      example: `「${entry.word}」を覚えます。`,
      exampleMeaning: `记住“${entry.meaning}”。`,
      ...getLessonMeta(lesson, book)
    };
  });
};

const parseGrammarBlocks = (lines) => {
  const blocks = [];
  let currentBlock;

  for (const line of lines) {
    const heading = line.match(/^&emsp;(?:&emsp;)*\s*(\d+)\.\s+(.+)$/);

    if (heading) {
      if (currentBlock) {
        blocks.push(currentBlock);
      }

      currentBlock = {
        heading: heading[2],
        lines: []
      };
      continue;
    }

    if (currentBlock) {
      currentBlock.lines.push(line);
    }
  }

  if (currentBlock) {
    blocks.push(currentBlock);
  }

  return blocks;
};

const splitHeading = (heading) => {
  const cleanedHeading = heading.replace(/<!--more-->/g, "");
  const separatorIndex = cleanedHeading.search(/[：:]/);
  const rawTitle =
    separatorIndex >= 0
      ? cleanedHeading.slice(0, separatorIndex)
      : cleanedHeading;
  const rawExplanation =
    separatorIndex >= 0 ? cleanedHeading.slice(separatorIndex + 1) : "";
  const codeTerms = [...rawTitle.matchAll(/`([^`]+)`/g)]
    .map((match) => cleanInline(match[1]))
    .filter(Boolean);
  const title = cleanInline(rawTitle);
  const structure = codeTerms.length > 0 ? codeTerms.join(" / ") : title;

  return {
    title,
    structure,
    rawExplanation: cleanSpacing(rawExplanation)
  };
};

const extractMeaning = (rawExplanation, structure) => {
  const patterns = [
    /相当于汉语(?:的)?[“"`]?([^`”。；，,.]+)[”"`]?/,
    /汉语(?:译为|意思是)[“"`]?([^`”。；，,.]+)[”"`]?/,
    /意思是[“"`]?([^`”。；，,.]+)[”"`]?/,
    /表示[“"`]?([^`”。；，,.]+)[”"`]?/
  ];

  for (const pattern of patterns) {
    const match = rawExplanation.match(pattern);

    if (match?.[1]) {
      return cleanInline(match[1]);
    }
  }

  return `掌握「${structure}」的用法`;
};

const buildExplanation = (structure, meaning) => {
  if (meaning.startsWith("掌握")) {
    return `本课需要掌握「${structure}」的接续、意义和使用场景。`;
  }

  return `表示「${meaning}」。学习时注意「${structure}」的接续、助词和句末形式。`;
};

const parseExamples = (lines, structure, meaning) => {
  const examples = [];

  for (const line of lines) {
    for (const match of line.matchAll(/`([^`]+)`[（(]([^()（）]+)[）)]/g)) {
      const japanese = cleanInline(match[1]);
      const chinese = cleanInline(match[2]);

      if (
        japanese &&
        chinese &&
        hasJapaneseText(japanese) &&
        japanese.length <= 80 &&
        chinese.length <= 100
      ) {
        examples.push({ japanese, chinese });
      }
    }
  }

  if (examples.length === 0) {
    return [
      {
        japanese: structure,
        chinese: meaning.startsWith("掌握") ? "本课语法点。" : meaning
      }
    ];
  }

  return examples.slice(0, 2);
};

const parseGrammarRows = (lines, lesson, book) =>
  parseGrammarBlocks(lines).map((block, index) => {
    const { title, structure, rawExplanation } = splitHeading(block.heading);
    const meaning = extractMeaning(rawExplanation, structure);
    const { tags, ...meta } = getLessonMeta(lesson, book);
    const id = `grammar-sbj2-${String(lesson).padStart(2, "0")}-note-${String(
      index + 1
    ).padStart(3, "0")}`;

    return {
      id,
      title,
      ...meta,
      category: `教材第${lesson}课`,
      structure,
      meaning,
      explanation: buildExplanation(structure, meaning),
      examples: parseExamples(block.lines, structure, meaning)
    };
  });

const buildVocabulary = () =>
  vocabularySources.flatMap(({ file, book }) => {
    const lessons = splitLessons(file);
    return [...lessons.entries()].flatMap(([lesson, lines]) =>
      parseVocabularyRows(lines, lesson, book)
    );
  });

const buildGrammar = () =>
  grammarSources.flatMap(({ file, book }) => {
    const lessons = splitLessons(file);
    return [...lessons.entries()].flatMap(([lesson, lines]) =>
      parseGrammarRows(lines, lesson, book)
    );
  });

const writeModule = ({ outputPath, importType, exportName, items }) => {
  const serializedItems = items
    .map((item) =>
      `${JSON.stringify(item, null, 2)
        .split("\n")
        .map((line) => `  ${line}`)
        .join("\n")} as ${importType}`
    )
    .join(",\n");
  const content = `import type { ${importType} } from "../types/${
    importType === "VocabularyItem" ? "vocabulary" : "learning"
  }";

export const ${exportName}: ${importType}[] = [
${serializedItems}
];
`;

  fs.writeFileSync(path.join(repoRoot, outputPath), content);
};

const vocabulary = buildVocabulary();
const grammar = buildGrammar();

writeModule({
  outputPath: "src/data/textbookElementaryVocabulary.ts",
  importType: "VocabularyItem",
  exportName: "textbookElementaryVocabulary",
  items: vocabulary
});

writeModule({
  outputPath: "src/data/textbookElementaryGrammar.ts",
  importType: "GrammarItem",
  exportName: "textbookElementaryGrammar",
  items: grammar
});

console.log(
  `Generated ${vocabulary.length} vocabulary items and ${grammar.length} grammar items.`
);
