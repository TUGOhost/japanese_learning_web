from __future__ import annotations

import argparse
import hashlib
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable


REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_SOURCE_DIR = REPO_ROOT / "content" / "sources" / "japanese-note"
DEFAULT_INTERMEDIATE_DIR = REPO_ROOT / "content" / "intermediate" / "japanese-note"
DEFAULT_GENERATED_DIR = REPO_ROOT / "content" / "generated"
DEFAULT_REPORTS_DIR = REPO_ROOT / "reports"

PART_OF_SPEECH_LABELS = {
    "名": "名词",
    "代": "代词",
    "疑": "疑问词",
    "副": "副词",
    "叹": "叹词",
    "专": "专有名词",
    "连体": "连体词",
    "接续": "接续词",
    "助": "助词",
    "形1": "一类形容词",
    "形2": "二类形容词",
    "动1": "一类动词",
    "动2": "二类动词",
    "动3": "三类动词",
    "動1": "一类动词",
    "動2": "二类动词",
    "動3": "三类动词",
}

TEXTBOOK_LEVEL_SLUGS = {
    "初级": "shokyu",
    "中级": "chukyu",
    "高级": "koukyu",
}

LOWER_BOOK_OFFSETS = {
    "初级": 24,
    "中级": 16,
    "高级": 12,
}

LOWER_BOOK_STARTS = {
    "初级": 25,
    "中级": 17,
    "高级": 13,
}

SUPPLEMENT_HINTS = [
    "はじめまして",
    "どうぞ",
    "おやすみなさい",
    "ありがとうございます",
    "お元気で",
    "お気をつけて",
    "お大事に",
]


@dataclass(frozen=True)
class SourceFileMeta:
    source_file_id: str
    content_kind: str
    textbook_level: str
    textbook_book: str
    textbook_slug: str
    lesson_start: int
    lesson_offset: int


@dataclass(frozen=True)
class LessonSegment:
    source_path: Path
    meta: SourceFileMeta
    lesson: int
    heading: str
    line_start: int
    line_end: int
    raw_markdown: str


def stable_hash(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()[:16]


def clean_inline(value: str) -> str:
    return (
        value.replace("<!--more-->", "")
        .replace("&emsp;", "")
        .replace("&nbsp;", " ")
        .replace("\r", "")
        .strip()
    )


def strip_code(value: str) -> str:
    return clean_inline(value).replace("`", "").strip()


def has_japanese_text(value: str) -> bool:
    return bool(re.search(r"[\u3040-\u30ff\u3400-\u9fff々〆ヶー]", value))


def normalize_report_path(path: Path) -> str:
    try:
        return path.resolve().relative_to(REPO_ROOT).as_posix()
    except ValueError:
        return path.as_posix()


def infer_source_file(path: Path) -> SourceFileMeta | None:
    match = re.match(
        r"新版标准日本语(?P<level>初级|中级|高级)(?P<kind>词汇表|语法总结)_(?P<volume>上册|下册)\.md$",
        path.name,
    )

    if not match:
        return None

    level = match.group("level")
    content_kind = "vocabulary" if match.group("kind") == "词汇表" else "grammar"
    volume = match.group("volume")
    suffix = "jou" if volume == "上册" else "ge"
    slug = TEXTBOOK_LEVEL_SLUGS[level]
    textbook_book = f"{level}{'上' if volume == '上册' else '下'}"
    lesson_start = 1 if volume == "上册" else LOWER_BOOK_STARTS[level]
    lesson_offset = 0 if volume == "上册" else LOWER_BOOK_OFFSETS[level]

    return SourceFileMeta(
        source_file_id=f"jnote-{content_kind}-{slug}-{suffix}",
        content_kind=content_kind,
        textbook_level=level,
        textbook_book=textbook_book,
        textbook_slug=slug,
        lesson_start=lesson_start,
        lesson_offset=lesson_offset,
    )


def get_global_lesson(raw_lesson: int, meta: SourceFileMeta) -> int:
    if meta.lesson_offset and raw_lesson < meta.lesson_start:
        return raw_lesson + meta.lesson_offset
    return raw_lesson


def get_unit_id(meta: SourceFileMeta, lesson: int) -> str:
    return f"unit-sbj2-{meta.textbook_slug}-{lesson}"


def get_level(meta: SourceFileMeta, lesson: int) -> str:
    if meta.textbook_level == "初级":
        return "N4" if lesson >= 25 else "N5"
    if meta.textbook_level == "中级":
        return "N3"
    return "N2"


def id_lesson_part(meta: SourceFileMeta, lesson: int) -> str:
    if meta.textbook_slug == "shokyu":
        return f"{lesson:02d}"
    return f"{meta.textbook_slug}-{lesson:02d}"


def create_source(
    segment: LessonSegment,
    raw_text: str,
    line_start: int | None = None,
    line_end: int | None = None,
) -> dict[str, Any]:
    return {
        "sourceRepo": "fukangwei/Japanese_Note",
        "sourceUrl": "https://github.com/fukangwei/Japanese_Note",
        "filePath": normalize_report_path(segment.source_path),
        "sourceFileId": segment.meta.source_file_id,
        "headingPath": [segment.heading],
        "lineStart": line_start if line_start is not None else segment.line_start,
        "lineEnd": line_end if line_end is not None else segment.line_end,
        "hash": stable_hash(raw_text),
        "rawText": raw_text,
    }


LESSON_HEADING_PATTERN = re.compile(r"^(?:(#{1,6})\s*)?第\s*0?(\d+)\s*课(?:\s|$|[：:、.-])")


def create_lesson_segments(source_path: Path, meta: SourceFileMeta) -> list[LessonSegment]:
    markdown = source_path.read_text(encoding="utf-8")
    lines = markdown.splitlines()
    headings: list[tuple[int, int, str]] = []

    for index, line in enumerate(lines):
        match = LESSON_HEADING_PATTERN.match(line.strip())
        if not match:
            continue
        raw_lesson = int(match.group(2))
        lesson = get_global_lesson(raw_lesson, meta)
        headings.append((index, lesson, line.strip().lstrip("#").strip()))

    segments: list[LessonSegment] = []
    for index, (line_index, lesson, heading) in enumerate(headings):
        next_line_index = headings[index + 1][0] if index + 1 < len(headings) else len(lines)
        raw_markdown = "\n".join(lines[line_index:next_line_index])
        segments.append(
            LessonSegment(
                source_path=source_path,
                meta=meta,
                lesson=lesson,
                heading=heading,
                line_start=line_index + 1,
                line_end=next_line_index,
                raw_markdown=raw_markdown,
            )
        )

    return segments


def split_table_cells(line: str) -> list[str]:
    cells = [cell.strip() for cell in line.split("|")]
    if cells and cells[0] == "":
        cells = cells[1:]
    if cells and cells[-1] == "":
        cells = cells[:-1]
    return cells


def is_separator_row(cells: list[str]) -> bool:
    return all(re.fullmatch(r":?-{2,}:?", cell.strip()) for cell in cells)


def clean_parenthetical(value: str) -> str:
    return strip_code(value).replace("（", "").replace("）", "").replace("(", "").replace(")", "").strip()


def parse_term_cell(cell: str) -> tuple[str, str, str, bool]:
    cleaned = clean_inline(cell)
    code_terms = [clean_inline(match.group(1)) for match in re.finditer(r"`([^`]+)`", cleaned)]
    parenthetical_terms = [
        clean_parenthetical(match.group(1))
        for match in re.finditer(r"[（(]([^()（）]+)[）)]", cleaned)
    ]
    primary_code = code_terms[0] if code_terms else ""
    parenthetical_word = next(
        (term for term in parenthetical_terms if has_japanese_text(term) and not term.startswith("~")),
        "",
    )
    raw_without_code = strip_code(cleaned)

    if primary_code and parenthetical_word:
        return parenthetical_word, primary_code, parenthetical_word, False

    if primary_code:
        return primary_code, primary_code, primary_code, False

    return raw_without_code, "", raw_without_code, True


def normalize_part_of_speech(value: str) -> str:
    cleaned = strip_code(value)
    return PART_OF_SPEECH_LABELS.get(cleaned, cleaned)


def parse_vocabulary_group(
    cells: list[str],
    start_index: int,
    segment: LessonSegment,
    item_index: int,
    line: str,
    line_number: int,
) -> dict[str, Any] | None:
    if start_index + 2 >= len(cells):
        return None

    term_cell = cells[start_index]
    part_cell = cells[start_index + 1]
    meaning_cell = cells[start_index + 2]
    if not term_cell or not part_cell or not meaning_cell:
        return None

    word, kana, display, needs_review = parse_term_cell(term_cell)
    part_of_speech = normalize_part_of_speech(part_cell)
    meaning = strip_code(meaning_cell)
    low_confidence: list[str] = []

    if needs_review:
        low_confidence.append("无法可靠拆分 kana 和 word")
    if not part_of_speech or part_of_speech == "词性":
        low_confidence.append("缺少词性")
    if not meaning or meaning == "解释":
        low_confidence.append("缺少释义")

    source = create_source(segment, line.strip(), line_number, line_number)
    item_id = f"vocab-sbj2-{id_lesson_part(segment.meta, segment.lesson)}-{item_index:03d}"
    item_hash = stable_hash(f"{segment.meta.source_file_id}:{segment.lesson}:{line}:{item_index}")

    return {
        "id": item_id,
        "type": "vocabulary",
        "word": word,
        "kana": kana,
        "display": display,
        "meaning": meaning,
        "partOfSpeech": part_of_speech,
        "example": f"「{display}」",
        "exampleMeaning": meaning,
        "level": get_level(segment.meta, segment.lesson),
        "source": source,
        "contentSource": f"标准日本语第二版{segment.meta.textbook_level}",
        "textbookBook": segment.meta.textbook_book,
        "textbookLesson": segment.lesson,
        "unitId": get_unit_id(segment.meta, segment.lesson),
        "isCore": True,
        "tags": [f"第{segment.lesson}课"],
        "publishStatus": "private_only",
        "importStatus": "imported" if not low_confidence else "needs_review",
        "hash": item_hash,
        "importHash": item_hash,
        "sourceText": line.strip(),
        "lowConfidenceReasons": low_confidence,
    }


def parse_expression_cell(
    expression: str,
    meaning: str,
    segment: LessonSegment,
    item_index: int,
    raw_text: str,
    line_number: int,
) -> dict[str, Any] | None:
    expression = strip_code(expression)
    meaning = strip_code(meaning)
    if not expression or not meaning or not has_japanese_text(expression):
        return None

    item_hash = stable_hash(f"{segment.meta.source_file_id}:{segment.lesson}:expression:{raw_text}:{item_index}")
    return {
        "id": f"expression-sbj2-{id_lesson_part(segment.meta, segment.lesson)}-{item_index:03d}",
        "type": "expression",
        "expression": expression,
        "meaning": meaning,
        "level": get_level(segment.meta, segment.lesson),
        "unitId": get_unit_id(segment.meta, segment.lesson),
        "textbookBook": segment.meta.textbook_book,
        "textbookLesson": segment.lesson,
        "category": "短语",
        "source": create_source(segment, raw_text.strip(), line_number, line_number),
        "contentSource": f"标准日本语第二版{segment.meta.textbook_level}",
        "publishStatus": "private_only",
        "importStatus": "imported",
        "hash": item_hash,
        "importHash": item_hash,
        "sourceText": raw_text.strip(),
        "lowConfidenceReasons": [],
    }


def parse_vocabulary_segment(segment: LessonSegment) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    lines = segment.raw_markdown.splitlines()
    vocabulary: list[dict[str, Any]] = []
    expressions: list[dict[str, Any]] = []

    for line_index, line in enumerate(lines):
        absolute_line_number = segment.line_start + line_index

        if "|" in line:
            cells = split_table_cells(line)
            if len(cells) < 2 or is_separator_row(cells):
                continue

            if cells[0] in {"单词", "词汇"}:
                continue

            if cells[0] == "句子":
                continue

            if len(cells) >= 3 and cells[1] in PART_OF_SPEECH_LABELS:
                for start_index in ([0, 3] if len(cells) >= 6 else [0]):
                    item = parse_vocabulary_group(
                        cells,
                        start_index,
                        segment,
                        len(vocabulary) + 1,
                        line,
                        absolute_line_number,
                    )
                    if item:
                        vocabulary.append(item)
                continue

            if len(cells) >= 2:
                starts = [0, 2] if len(cells) >= 4 else [0]
                for start_index in starts:
                    if start_index + 1 >= len(cells):
                        continue
                    item = parse_expression_cell(
                        cells[start_index],
                        cells[start_index + 1],
                        segment,
                        len(expressions) + 1,
                        line,
                        absolute_line_number,
                    )
                    if item:
                        expressions.append(item)

        bullet_match = re.match(r"\s*[-*]\s+`([^`]+)`\s*[：:]\s*(.+)$", line)
        if bullet_match:
            item = parse_expression_cell(
                bullet_match.group(1),
                bullet_match.group(2),
                segment,
                len(expressions) + 1,
                line,
                absolute_line_number,
            )
            if item:
                expressions.append(item)

    return vocabulary, expressions


GRAMMAR_HEADING_PATTERN = re.compile(r"^(?:\s|&emsp;)*(?:\d+[.、]|[（(]\d+[）)])\s*(.+?)[：:]\s*(.*)$")


def parse_grammar_blocks(segment: LessonSegment) -> list[dict[str, Any]]:
    lines = segment.raw_markdown.splitlines()
    blocks: list[dict[str, Any]] = []
    current: dict[str, Any] | None = None

    for line_index, line in enumerate(lines):
        match = GRAMMAR_HEADING_PATTERN.match(line)
        has_structure = bool(match and re.search(r"`[^`]+`", match.group(1)))
        if match and has_structure:
            if current:
                current["lineEnd"] = segment.line_start + line_index - 1
                blocks.append(current)
            current = {
                "rawHeading": line,
                "lineStart": segment.line_start + line_index,
                "lineEnd": segment.line_start + line_index,
                "lines": [],
            }
            continue
        if current:
            current["lines"].append(line)

    if current:
        current["lineEnd"] = segment.line_end
        blocks.append(current)

    return blocks


def split_grammar_heading(raw_heading: str) -> tuple[str, str, str]:
    match = GRAMMAR_HEADING_PATTERN.match(raw_heading)
    raw_title = match.group(1) if match else raw_heading
    explanation = clean_inline(match.group(2) if match else "")
    code_terms = [clean_inline(code_match.group(1)) for code_match in re.finditer(r"`([^`]+)`", raw_title)]
    structure = code_terms[0] if code_terms else strip_code(raw_title)
    title = strip_code(raw_title)
    return title, structure, explanation


def parse_examples(lines: Iterable[str]) -> list[dict[str, str]]:
    examples: list[dict[str, str]] = []
    for line in lines:
        list_match = re.match(r"^\s*(?:[-*]|\d+[.、])\s+(.+)$", line)
        if not list_match:
            continue
        text = list_match.group(1)
        matches = list(re.finditer(r"`([^`]+)`[（(]([^()（）]+)[）)]", text))
        if matches:
            for match in matches:
                japanese = clean_inline(match.group(1))
                chinese = clean_inline(match.group(2))
                if has_japanese_text(japanese):
                    examples.append({"japanese": japanese, "chinese": chinese})
            continue
        colon_match = re.search(r"`([^`]+)`\s*[：:]\s*(.+)$", text)
        if colon_match and has_japanese_text(colon_match.group(1)):
            examples.append(
                {
                    "japanese": clean_inline(colon_match.group(1)),
                    "chinese": strip_code(colon_match.group(2)),
                }
            )
    return examples


def derive_explanation(lines: Iterable[str]) -> str:
    pieces: list[str] = []
    for line in lines:
        cleaned = clean_inline(line)
        if not cleaned or cleaned.startswith("-") or cleaned.startswith("*"):
            continue
        numbered = re.match(r"^\d+[.、]\s+(.+)$", cleaned)
        pieces.append(strip_code(numbered.group(1) if numbered else cleaned))
        if len(pieces) >= 3:
            break
    return " ".join(pieces)[:240].strip()


def extract_meaning(explanation: str, structure: str) -> str:
    patterns = [
        r"相当于汉语(?:的)?`?([^`。；，,.]+)`?",
        r"汉语(?:译为|意思是)`?([^`。；，,.]+)`?",
        r"意思是`?([^`。；，,.]+)`?",
        r"表示`?([^`。；，,.]+)`?",
    ]
    for pattern in patterns:
        match = re.search(pattern, explanation)
        if match:
            return strip_code(match.group(1))
    return f"掌握「{structure}」的用法"


def should_review_as_supplement(title: str, structure: str, explanation: str) -> bool:
    compact = re.sub(r"\s+", "", f"{title}{structure}")
    return (
        any(hint in compact for hint in SUPPLEMENT_HINTS)
        or bool(re.search(r"寒暄|文化|外来语|区别|称呼|接尾词|保重|小心", explanation))
    )


def parse_grammar_segment(segment: LessonSegment) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    grammar_items: list[dict[str, Any]] = []
    sentence_items: list[dict[str, Any]] = []

    for index, block in enumerate(parse_grammar_blocks(segment), start=1):
        title, structure, heading_explanation = split_grammar_heading(block["rawHeading"])
        explanation = heading_explanation or derive_explanation(block["lines"])
        examples = parse_examples(block["lines"])
        low_confidence: list[str] = []

        if not structure:
            low_confidence.append("缺少语法结构")
        if not explanation:
            low_confidence.append("缺少解释")
            explanation = f"掌握「{structure or title}」的用法。"
        if should_review_as_supplement(title, structure, explanation):
            low_confidence.append("疑似寒暄、文化说明或词义辨析")

        source_text = "\n".join([block["rawHeading"], *block["lines"]]).strip()
        item_hash = stable_hash(f"{segment.meta.source_file_id}:{segment.lesson}:{source_text}")
        grammar_id = f"grammar-sbj2-{id_lesson_part(segment.meta, segment.lesson)}-{index:03d}"
        grammar_item = {
            "id": grammar_id,
            "type": "grammar",
            "title": title,
            "structure": structure,
            "meaning": extract_meaning(explanation, structure),
            "explanation": explanation,
            "examples": examples,
            "level": get_level(segment.meta, segment.lesson),
            "source": create_source(segment, source_text, block["lineStart"], block["lineEnd"]),
            "contentSource": f"标准日本语第二版{segment.meta.textbook_level}",
            "textbookBook": segment.meta.textbook_book,
            "textbookLesson": segment.lesson,
            "unitId": get_unit_id(segment.meta, segment.lesson),
            "isCore": not low_confidence,
            "category": "补充说明" if low_confidence else f"教材第{segment.lesson}课",
            "publishStatus": "private_only",
            "importStatus": "imported" if not low_confidence else "needs_review",
            "hash": item_hash,
            "importHash": item_hash,
            "sourceText": source_text,
            "lowConfidenceReasons": low_confidence,
        }
        grammar_items.append(grammar_item)

        for example_index, example in enumerate(examples, start=1):
            raw_text = f"{example['japanese']}({example['chinese']})"
            sentence_hash = stable_hash(f"{grammar_id}:{raw_text}:{example_index}")
            sentence_items.append(
                {
                    "id": f"sentence-candidate-{grammar_id}-{example_index:02d}",
                    "type": "sentence",
                    "japanese": example["japanese"],
                    "chinese": example["chinese"],
                    "level": get_level(segment.meta, segment.lesson),
                    "unitId": get_unit_id(segment.meta, segment.lesson),
                    "textbookBook": segment.meta.textbook_book,
                    "textbookLesson": segment.lesson,
                    "tags": [f"第{segment.lesson}课", "语法例句候选"],
                    "grammarIds": [grammar_id],
                    "note": "从语法例句生成的候选句，默认需要人工复核以避免重复和版权风险。",
                    "source": create_source(segment, raw_text, block["lineStart"], block["lineEnd"]),
                    "contentSource": f"标准日本语第二版{segment.meta.textbook_level}",
                    "publishStatus": "private_only",
                    "importStatus": "needs_review",
                    "hash": sentence_hash,
                    "importHash": sentence_hash,
                    "sourceText": raw_text,
                    "lowConfidenceReasons": ["语法例句候选默认进入复核队列"],
                }
            )

    return grammar_items, sentence_items


def unique_by_id(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    seen: set[str] = set()
    unique: list[dict[str, Any]] = []
    for item in items:
        if item["id"] in seen:
            continue
        seen.add(item["id"])
        unique.append(item)
    return unique


def create_quizzes(vocabulary_items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    by_unit: dict[str, list[dict[str, Any]]] = {}
    for item in vocabulary_items:
        if item.get("importStatus") != "imported":
            continue
        unit_id = item.get("unitId")
        if not unit_id:
            continue
        by_unit.setdefault(unit_id, []).append(item)

    quizzes: list[dict[str, Any]] = []
    for unit_id, items in sorted(by_unit.items()):
        first_item = items[0]
        meanings = []
        for item in items:
            meaning = item.get("meaning")
            if meaning and meaning not in meanings:
                meanings.append(meaning)
        if len(meanings) < 2:
            continue
        lesson = first_item.get("textbookLesson", 0)
        answer = first_item["meaning"]
        options = [answer, *[meaning for meaning in meanings if meaning != answer][:3]]
        quiz_hash = stable_hash(f"{first_item['id']}:quiz:{'|'.join(options)}")
        quizzes.append(
            {
                "id": f"quiz-sbj2-{id_lesson_part_from_item(first_item)}-jnote-001",
                "type": "vocabulary",
                "level": first_item["level"],
                "unitId": unit_id,
                "textbookLesson": lesson,
                "difficulty": "简单",
                "question": f"{first_item.get('display') or first_item['word']} 的中文意思是？",
                "options": options,
                "answer": answer,
                "explanation": f"{first_item.get('display') or first_item['word']}：{answer}",
                "source": first_item["source"],
                "contentSource": first_item.get("contentSource"),
                "publishStatus": first_item.get("publishStatus"),
                "importStatus": "imported",
                "importHash": quiz_hash,
            }
        )
    return quizzes


def id_lesson_part_from_item(item: dict[str, Any]) -> str:
    unit_id = item.get("unitId", "")
    match = re.match(r"unit-sbj2-(\w+)-(\d+)$", unit_id)
    if not match or match.group(1) == "shokyu":
        return f"{int(item.get('textbookLesson', 0)):02d}"
    return f"{match.group(1)}-{int(item.get('textbookLesson', 0)):02d}"


def build_review_items(items: Iterable[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        item
        for item in items
        if item.get("importStatus") != "imported"
        or item.get("publishStatus") == "do_not_publish"
        or item.get("lowConfidenceReasons")
    ]


def parse_japanese_note_sources(source_dir: Path | str) -> dict[str, list[dict[str, Any]]]:
    source_dir = Path(source_dir)
    vocabulary: list[dict[str, Any]] = []
    grammar: list[dict[str, Any]] = []
    sentences: list[dict[str, Any]] = []
    expressions: list[dict[str, Any]] = []

    for source_path in sorted(source_dir.glob("*.md")):
        meta = infer_source_file(source_path)
        if not meta:
            continue

        for segment in create_lesson_segments(source_path, meta):
            if meta.content_kind == "vocabulary":
                parsed_vocabulary, parsed_expressions = parse_vocabulary_segment(segment)
                vocabulary.extend(parsed_vocabulary)
                expressions.extend(parsed_expressions)
            elif meta.content_kind == "grammar":
                parsed_grammar, parsed_sentences = parse_grammar_segment(segment)
                grammar.extend(parsed_grammar)
                sentences.extend(parsed_sentences)

    vocabulary = unique_by_id(vocabulary)
    grammar = unique_by_id(grammar)
    sentences = unique_by_id(sentences)
    expressions = unique_by_id(expressions)
    quizzes = unique_by_id(create_quizzes(vocabulary))
    all_items = [*vocabulary, *grammar, *sentences, *expressions, *quizzes]

    return {
        "vocabulary": vocabulary,
        "grammar": grammar,
        "sentences": sentences,
        "expressions": expressions,
        "quizzes": quizzes,
        "review": build_review_items(all_items),
    }


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def strip_import_fields(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        {key: value for key, value in item.items() if key not in {"type", "hash", "lowConfidenceReasons"}}
        for item in items
    ]


def render_review_queue(review_items: list[dict[str, Any]]) -> str:
    lines = ["# Japanese_Note Review Queue", "", f"待复核条目：{len(review_items)}", ""]
    for item in review_items:
        source = item.get("source", {})
        lines.extend(
            [
                f"## {item.get('id')}",
                "",
                f"- type: {item.get('type')}",
                f"- status: {item.get('importStatus')}",
                f"- publishStatus: {item.get('publishStatus')}",
                f"- lesson: {item.get('textbookLesson', '')}",
                f"- source: {source.get('filePath', '')}:{source.get('lineStart', '')}",
                f"- reasons: {', '.join(item.get('lowConfidenceReasons') or ['needs review'])}",
                "",
                "```",
                item.get("sourceText") or source.get("rawText", ""),
                "```",
                "",
            ]
        )
    return "\n".join(lines) + "\n"


def run_pipeline(
    source_dir: Path | str = DEFAULT_SOURCE_DIR,
    intermediate_dir: Path | str = DEFAULT_INTERMEDIATE_DIR,
    generated_dir: Path | str = DEFAULT_GENERATED_DIR,
    reports_dir: Path | str = DEFAULT_REPORTS_DIR,
) -> dict[str, list[dict[str, Any]]]:
    source_dir = Path(source_dir)
    intermediate_dir = Path(intermediate_dir)
    generated_dir = Path(generated_dir)
    reports_dir = Path(reports_dir)

    parsed = parse_japanese_note_sources(source_dir)
    all_items = [
        *parsed["vocabulary"],
        *parsed["grammar"],
        *parsed["sentences"],
        *parsed["expressions"],
    ]

    write_json(intermediate_dir / "parsed.raw.json", parsed)
    write_json(intermediate_dir / "imported.raw.json", all_items)
    write_json(generated_dir / "vocabulary.json", strip_import_fields(parsed["vocabulary"]))
    write_json(generated_dir / "grammar.json", strip_import_fields(parsed["grammar"]))
    write_json(generated_dir / "sentences.json", strip_import_fields(parsed["sentences"]))
    write_json(generated_dir / "expressions.json", strip_import_fields(parsed["expressions"]))
    write_json(generated_dir / "quizzes.json", strip_import_fields(parsed["quizzes"]))
    (reports_dir).mkdir(parents=True, exist_ok=True)
    (reports_dir / "review-queue.md").write_text(
        render_review_queue(parsed["review"]),
        encoding="utf-8",
    )

    print(
        "Generated JSON content: "
        f"{len(parsed['vocabulary'])} vocabulary, "
        f"{len(parsed['grammar'])} grammar, "
        f"{len(parsed['sentences'])} sentences, "
        f"{len(parsed['expressions'])} expressions, "
        f"{len(parsed['quizzes'])} quizzes, "
        f"{len(parsed['review'])} review items."
    )

    return parsed


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Parse Japanese_Note Markdown into learning JSON.")
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE_DIR)
    parser.add_argument("--intermediate", type=Path, default=DEFAULT_INTERMEDIATE_DIR)
    parser.add_argument("--generated", type=Path, default=DEFAULT_GENERATED_DIR)
    parser.add_argument("--reports", type=Path, default=DEFAULT_REPORTS_DIR)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    run_pipeline(
        source_dir=args.source,
        intermediate_dir=args.intermediate,
        generated_dir=args.generated,
        reports_dir=args.reports,
    )


if __name__ == "__main__":
    main()
