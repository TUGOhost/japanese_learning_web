from pathlib import Path
import importlib.util
import sys


MODULE_PATH = Path(__file__).resolve().parents[1] / "parse_japanese_note.py"


def load_parser_module():
    spec = importlib.util.spec_from_file_location("parse_japanese_note", MODULE_PATH)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    sys.modules["parse_japanese_note"] = module
    spec.loader.exec_module(module)
    return module


def write_source(tmp_path: Path, name: str, content: str) -> Path:
    source_dir = tmp_path / "Japanese_Note"
    source_dir.mkdir()
    source_path = source_dir / name
    source_path.write_text(content, encoding="utf-8")
    return source_dir


def test_parses_vocabulary_table_rows_with_source_metadata(tmp_path: Path):
    parser = load_parser_module()
    source_dir = write_source(
        tmp_path,
        "新版标准日本语初级词汇表_上册.md",
        """### 第1课

单词 | 词性 | 解释 | 单词 | 词性 | 解释
---|---|---|---|---|---
`がくせい` (学生) | 名 | 学生 | `せんせい` (先生) | 名 | 老师
""",
    )

    result = parser.parse_japanese_note_sources(source_dir)

    assert [item["word"] for item in result["vocabulary"]] == ["学生", "先生"]
    assert result["vocabulary"][0]["kana"] == "がくせい"
    assert result["vocabulary"][0]["partOfSpeech"] == "名词"
    assert result["vocabulary"][0]["unitId"] == "unit-sbj2-shokyu-1"
    assert result["vocabulary"][0]["textbookBook"] == "初级上"
    assert result["vocabulary"][0]["source"]["lineStart"] == 5


def test_offsets_lower_book_relative_lessons(tmp_path: Path):
    parser = load_parser_module()
    source_dir = write_source(
        tmp_path,
        "新版标准日本语初级词汇表_下册.md",
        """### 第1课

单词 | 词性 | 解释
---|---|---
`かいぎ` (会議) | 名 | 会议
""",
    )

    result = parser.parse_japanese_note_sources(source_dir)

    assert result["vocabulary"][0]["textbookLesson"] == 25
    assert result["vocabulary"][0]["unitId"] == "unit-sbj2-shokyu-25"
    assert result["vocabulary"][0]["textbookBook"] == "初级下"


def test_parses_grammar_blocks_and_review_candidates(tmp_path: Path):
    parser = load_parser_module()
    source_dir = write_source(
        tmp_path,
        "新版标准日本语初级语法总结_上册.md",
        """### 第2课

&emsp;&emsp;1. `これは何ですか`：用于询问这是什么。

- `これは本です`(这是书。)

&emsp;&emsp;2. `どうぞ`：寒暄表达。
""",
    )

    result = parser.parse_japanese_note_sources(source_dir)

    assert result["grammar"][0]["structure"] == "これは何ですか"
    assert result["grammar"][0]["examples"] == [
        {"japanese": "これは本です", "chinese": "这是书。"}
    ]
    assert result["sentences"][0]["grammarIds"] == [result["grammar"][0]["id"]]
    assert result["review"][0]["id"] == result["grammar"][1]["id"]
    assert "疑似寒暄" in result["review"][0]["lowConfidenceReasons"][0]


def test_writes_generated_json_and_review_queue(tmp_path: Path):
    parser = load_parser_module()
    source_dir = write_source(
        tmp_path,
        "新版标准日本语初级词汇表_上册.md",
        """### 第1课

单词 | 词性 | 解释
---|---|---
学生 | 名 | 学生
""",
    )
    intermediate_dir = tmp_path / "intermediate"
    generated_dir = tmp_path / "generated"
    reports_dir = tmp_path / "reports"

    parser.run_pipeline(
        source_dir=source_dir,
        intermediate_dir=intermediate_dir,
        generated_dir=generated_dir,
        reports_dir=reports_dir,
    )

    assert (intermediate_dir / "parsed.raw.json").exists()
    assert (generated_dir / "vocabulary.json").exists()
    assert (generated_dir / "grammar.json").exists()
    assert (generated_dir / "sentences.json").exists()
    assert (generated_dir / "expressions.json").exists()
    assert (generated_dir / "quizzes.json").exists()
    assert "vocab-sbj2-01-001" in (reports_dir / "review-queue.md").read_text(
        encoding="utf-8"
    )
