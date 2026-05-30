"""
Codex Knowledge Agent  --  replaces the GraphRAG + Vector Store pipeline.

Instead of Neo4j graph queries with a pgvector fallback, this service uses
the OpenAI Codex SDK to search through literary knowledge files stored under
`knowledge_base/characters/`.

Architecture
------------
                                    ┌──────────────────────┐
  user query ──►  CodexKnowledgeAgent  ──► Codex model reads   │
                  (this module)          │  knowledge_base/*    │
                                    └──────────────────────┘
                                              │
                                    retrieved literary context
                                              │
                                              ▼
                                    ChatService builds prompt
                                    and streams LLM response

The knowledge base is a set of markdown / text files organised per character.
Codex searches and reads these files to find relevant quotes, events,
relationships, and historical context.

Usage
-----
    from services.codex_agent import CodexKnowledgeAgent

    agent = CodexKnowledgeAgent(
        api_key="sk-...",
        knowledge_dir="./knowledge_base",
    )
    context = await agent.search_context("Chí Phèo", "Tại sao anh ghét Bá Kiến?")
"""

from __future__ import annotations

import logging
from typing import Optional

from openai import AsyncOpenAI

from core.config import settings

logger = logging.getLogger(__name__)


class CodexKnowledgeAgent:
    """
    Searches the literary knowledge base using OpenAI Codex.

    The Codex tool operates in *workspace-read* mode so it can browse
    the knowledge files but never modify them.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        knowledge_dir: Optional[str] = None,
        model: Optional[str] = None,
    ):
        self.client = AsyncOpenAI(api_key=api_key or settings.OPENAI_API_KEY)
        self.knowledge_dir = knowledge_dir or settings.KNOWLEDGE_BASE_DIR
        self.model = model or settings.CODEX_MODEL

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    async def search_context(
        self,
        character_name: str,
        user_query: str,
    ) -> str:
        """
        Search the knowledge base for literary context relevant to the
        user's question about *character_name*.

        Returns a plain-text block of retrieved excerpts that can be
        injected into the character chat prompt.
        """
        search_instruction = (
            f"You are a literary research assistant specialising in "
            f"Vietnamese literature. Search the knowledge base for "
            f'information about the character "{character_name}". '
            f"Return the most relevant quotes, events, character "
            f"relationships, personality details, and historical context. "
            f"Output only the retrieved excerpts — no commentary."
        )

        try:
            response = await self.client.responses.create(
                model=self.model,
                instructions=search_instruction,
                input=user_query,
                tools=[
                    {
                        "type": "codex_search",
                        "codex_search": {
                            "sandbox_mode": "workspace-read",
                            "working_directory": self.knowledge_dir,
                        },
                    }
                ],
            )
            return self._extract_text(response)

        except Exception:
            logger.exception("Codex search failed for %s", character_name)
            return ""

    # ------------------------------------------------------------------
    # Internals
    # ------------------------------------------------------------------
    @staticmethod
    def _extract_text(response) -> str:
        """Pull the final text out of a Responses API result."""
        # The Responses API exposes `output_text` as a convenience
        # attribute that concatenates all message text in the output.
        if hasattr(response, "output_text") and response.output_text:
            return response.output_text

        # Fallback: iterate output items manually
        parts: list[str] = []
        for item in getattr(response, "output", []):
            if hasattr(item, "text"):
                parts.append(item.text)
            elif hasattr(item, "content"):
                for block in item.content:
                    if hasattr(block, "text"):
                        parts.append(block.text)
        return "\n".join(parts)


# ---------------------------------------------------------------------------
# Module-level singleton (lazy-initialised via deps.py)
# ---------------------------------------------------------------------------
_agent: Optional[CodexKnowledgeAgent] = None


def get_codex_agent() -> CodexKnowledgeAgent:
    global _agent
    if _agent is None:
        _agent = CodexKnowledgeAgent()
    return _agent
