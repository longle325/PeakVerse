from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any

BACKEND_DIR = Path(__file__).resolve().parents[1]
KNOWLEDGE_DIR = BACKEND_DIR / "knowledge_base"
DOCUMENTS_PATH = KNOWLEDGE_DIR / "index" / "documents.jsonl"
CHUNKS_PATH = KNOWLEDGE_DIR / "index" / "chunks.jsonl"


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    return [
        json.loads(line)
        for line in path.read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]


def write_jsonl(path: Path, records: list[dict[str, Any]]) -> None:
    path.write_text(
        "".join(json.dumps(record, ensure_ascii=False) + "\n" for record in records),
        encoding="utf-8",
    )


def split_text(text: str, chunk_size: int, overlap: int) -> list[str]:
    text = re.sub(r"\n{3,}", "\n\n", text.strip())
    chunks: list[str] = []
    start = 0
    while start < len(text):
        limit = min(start + chunk_size, len(text))
        end = limit
        if limit < len(text):
            boundaries = [
                text.rfind("\n\n", start, limit),
                text.rfind(". ", start, limit),
                text.rfind("? ", start, limit),
                text.rfind("! ", start, limit),
            ]
            natural_end = max(boundaries)
            if natural_end > start + chunk_size // 2:
                end = natural_end + 1
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end >= len(text):
            break
        start = max(0, end - overlap)
        while start < len(text) and text[start].isspace():
            start += 1
    return chunks


def build_chunks(slug: str, chunk_size: int, overlap: int) -> list[dict[str, Any]]:
    documents = [
        document for document in read_jsonl(DOCUMENTS_PATH)
        if document["character_slug"] == slug
    ]
    if not documents:
        raise SystemExit(f"No documents found for character slug: {slug}")

    records: list[dict[str, Any]] = []
    for document in documents:
        source_path = KNOWLEDGE_DIR / document["source_path"]
        text = source_path.read_text(encoding="utf-8")
        for index, chunk_text in enumerate(split_text(text, chunk_size, overlap), start=1):
            records.append(
                {
                    "chunk_id": f"{document['document_id']}.chunk_{index:04d}",
                    "document_id": document["document_id"],
                    "character_slug": document["character_slug"],
                    "character_name": document["character_name"],
                    "work_title": document["work_title"],
                    "author": document["author"],
                    "doc_type": document["doc_type"],
                    "source_path": document["source_path"],
                    "source_url": document.get("source_url", ""),
                    "license_status": document["license_status"],
                    "reliability": document["reliability"],
                    "chunk_index": index,
                    "text": chunk_text,
                }
            )
    return records


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build chunks for one character.")
    parser.add_argument("slug")
    parser.add_argument("--chunk-size", type=int, default=1500)
    parser.add_argument("--overlap", type=int, default=150)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    existing = [
        chunk for chunk in read_jsonl(CHUNKS_PATH)
        if chunk["character_slug"] != args.slug
    ]
    new_chunks = build_chunks(args.slug, args.chunk_size, args.overlap)
    write_jsonl(CHUNKS_PATH, existing + new_chunks)
    print(f"Wrote {len(new_chunks)} chunks for {args.slug}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
