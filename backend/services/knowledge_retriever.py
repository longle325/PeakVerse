from __future__ import annotations

import json
import logging
import re
from pathlib import Path
from typing import Any, Optional

from openai import AsyncOpenAI
from sqlalchemy import text

from core.config import settings
from core.database import async_session_factory

logger = logging.getLogger(__name__)


TOKEN_RE = re.compile(r"\w+", re.UNICODE)


class KnowledgeRetriever:
    """Local character-scoped retriever over the generated JSONL chunk index."""

    def __init__(
        self,
        index_path: Optional[Path] = None,
        top_k: Optional[int] = None,
        openai_client: Optional[AsyncOpenAI] = None,
    ):
        self.index_path = index_path or (
            Path(settings.KNOWLEDGE_BASE_DIR) / "index" / "chunks.jsonl"
        )
        self.top_k = top_k or settings.RAG_TOP_K
        self.client = openai_client or AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self._chunks: Optional[list[dict[str, Any]]] = None

    async def search_context_async(self, character_slug: str, user_query: str) -> str:
        result = await self.search_with_sources_async(character_slug, user_query)
        return result["context"]

    async def search_with_sources_async(
        self, character_slug: str, user_query: str
    ) -> dict[str, Any]:
        try:
            vector_chunks = await self._search_vector_chunks(
                character_slug,
                user_query,
            )
            if vector_chunks:
                return {
                    "context": self._format_context(vector_chunks),
                    "sources": self._format_sources(vector_chunks),
                    "retrieval_mode": "vector",
                }
        except Exception as exc:
            logger.info("Vector retrieval failed; falling back to lexical search: %s", exc)
        lexical_chunks = self._search_lexical_chunks(character_slug, user_query)
        return {
            "context": self._format_context(lexical_chunks),
            "sources": self._format_sources(lexical_chunks),
            "retrieval_mode": "lexical",
        }

    def search_context(self, character_slug: str, user_query: str) -> str:
        return self._format_context(self._search_lexical_chunks(character_slug, user_query))

    def _search_lexical_chunks(
        self,
        character_slug: str,
        user_query: str,
    ) -> list[dict[str, Any]]:
        terms = self._tokenize(user_query)
        if not terms:
            return []

        scored: list[tuple[float, dict[str, Any]]] = []
        for chunk in self._load_chunks():
            if chunk.get("character_slug") != character_slug:
                continue
            score = self._score_chunk(chunk, terms, user_query)
            if score > 0:
                scored.append((score, chunk))

        scored.sort(key=lambda item: item[0], reverse=True)
        return [chunk for _, chunk in scored[: self.top_k]]

    def _load_chunks(self) -> list[dict[str, Any]]:
        if self._chunks is not None:
            return self._chunks
        if not self.index_path.exists():
            self._chunks = []
            return self._chunks

        chunks: list[dict[str, Any]] = []
        with self.index_path.open("r", encoding="utf-8") as file:
            for line in file:
                line = line.strip()
                if line:
                    chunks.append(json.loads(line))
        self._chunks = chunks
        return chunks

    @staticmethod
    def _tokenize(text: str) -> set[str]:
        return {
            token.lower()
            for token in TOKEN_RE.findall(text)
            if len(token) >= 2
        }

    def _score_chunk(
        self, chunk: dict[str, Any], terms: set[str], user_query: str
    ) -> float:
        text = chunk.get("text", "")
        text_lower = text.lower()
        chunk_terms = self._tokenize(text)
        score = float(len(terms & chunk_terms))

        normalized_query = " ".join(user_query.lower().split())
        if normalized_query and normalized_query in " ".join(text_lower.split()):
            score += 5.0

        if score > 0 and chunk.get("doc_type") == "analysis":
            score += 0.25
        return score

    @staticmethod
    def _format_context(chunks: list[dict[str, Any]]) -> str:
        if not chunks:
            return ""
        sections = []
        for chunk in chunks:
            sections.append(
                "\n".join(
                    [
                        f"[Nguồn: {chunk.get('source_path')} | {chunk.get('chunk_id')}]",
                        chunk.get("text", ""),
                    ]
                )
            )
        return "\n\n---\n\n".join(sections)

    @staticmethod
    def _format_sources(chunks: list[dict[str, Any]]) -> list[dict[str, Any]]:
        sources: list[dict[str, Any]] = []
        for chunk in chunks:
            sources.append(
                {
                    "chunk_id": chunk.get("chunk_id"),
                    "document_id": chunk.get("document_id"),
                    "source_path": chunk.get("source_path"),
                    "doc_type": chunk.get("doc_type"),
                    "character_slug": chunk.get("character_slug"),
                    "character_name": chunk.get("character_name"),
                    "work_title": chunk.get("work_title"),
                    "author": chunk.get("author"),
                    "similarity": chunk.get("similarity"),
                }
            )
        return sources

    async def _search_vector_chunks(
        self,
        character_slug: str,
        user_query: str,
    ) -> list[dict[str, Any]]:
        query_embedding = await self._embed_query(user_query)
        query_vector = self._vector_literal(query_embedding)
        stmt = text(
            """
            SELECT
                chunk_id,
                document_id,
                character_slug,
                character_name,
                work_title,
                author,
                doc_type,
                source_path,
                text,
                1 - (embedding <=> CAST(:query_embedding AS vector)) AS similarity
            FROM knowledge_chunks
            WHERE character_slug = :character_slug
              AND embedding_model = :embedding_model
              AND (
                  :min_similarity <= 0
                  OR 1 - (embedding <=> CAST(:query_embedding AS vector)) >= :min_similarity
              )
            ORDER BY embedding <=> CAST(:query_embedding AS vector)
            LIMIT :limit
            """
        )

        async with async_session_factory() as session:
            result = await session.execute(
                stmt,
                {
                    "query_embedding": query_vector,
                    "character_slug": character_slug,
                    "embedding_model": settings.EMBEDDING_MODEL,
                    "min_similarity": settings.RAG_MIN_SIMILARITY,
                    "limit": self.top_k,
                },
            )
            return [dict(row._mapping) for row in result.all()]

    async def diagnostics(self) -> dict[str, Any]:
        lexical_chunks = self._load_chunks()
        diagnostics: dict[str, Any] = {
            "vector_extension_enabled": False,
            "embedding_model": settings.EMBEDDING_MODEL,
            "embedding_dimensions": settings.EMBEDDING_DIMENSIONS,
            "rag_top_k": settings.RAG_TOP_K,
            "rag_min_similarity": settings.RAG_MIN_SIMILARITY,
            "vector_chunk_count": 0,
            "vector_chunks_by_character": {},
            "lexical_index_path": str(self.index_path),
            "lexical_chunk_count": len(lexical_chunks),
            "fallback_available": bool(lexical_chunks),
            "last_error": None,
        }
        try:
            async with async_session_factory() as session:
                extension_result = await session.execute(
                    text("SELECT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector')")
                )
                diagnostics["vector_extension_enabled"] = bool(
                    extension_result.scalar_one()
                )

                count_result = await session.execute(
                    text(
                        """
                        SELECT COUNT(*)
                        FROM knowledge_chunks
                        WHERE embedding_model = :embedding_model
                        """
                    ),
                    {"embedding_model": settings.EMBEDDING_MODEL},
                )
                diagnostics["vector_chunk_count"] = int(count_result.scalar_one())

                by_character_result = await session.execute(
                    text(
                        """
                        SELECT character_slug, COUNT(*) AS chunk_count
                        FROM knowledge_chunks
                        WHERE embedding_model = :embedding_model
                        GROUP BY character_slug
                        ORDER BY character_slug
                        """
                    ),
                    {"embedding_model": settings.EMBEDDING_MODEL},
                )
                diagnostics["vector_chunks_by_character"] = {
                    row.character_slug: int(row.chunk_count)
                    for row in by_character_result.all()
                }
        except Exception as exc:
            diagnostics["last_error"] = str(exc)
        return diagnostics

    async def _embed_query(self, user_query: str) -> list[float]:
        response = await self.client.embeddings.create(
            model=settings.EMBEDDING_MODEL,
            input=user_query,
        )
        return response.data[0].embedding

    @staticmethod
    def _vector_literal(values: list[float]) -> str:
        return "[" + ",".join(str(float(value)) for value in values) + "]"


_retriever: Optional[KnowledgeRetriever] = None


def get_knowledge_retriever() -> KnowledgeRetriever:
    global _retriever
    if _retriever is None:
        _retriever = KnowledgeRetriever()
    return _retriever
