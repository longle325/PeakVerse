"""
Small read-only admin diagnostics.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends

from api.deps import get_retriever
from models.schemas import RagDiagnosticsResponse
from services.knowledge_retriever import KnowledgeRetriever

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/rag/diagnostics", response_model=RagDiagnosticsResponse)
async def rag_diagnostics(
    retriever: KnowledgeRetriever = Depends(get_retriever),
):
    return RagDiagnosticsResponse.model_validate(await retriever.diagnostics())


@router.get("/debug/config")
async def debug_config():
    """Temporary: check which env vars are loaded. Remove after debugging."""
    from core.config import settings

    key = settings.OPENAI_API_KEY
    return {
        "chat_model": settings.CHAT_MODEL,
        "openai_key_set": bool(key),
        "openai_key_prefix": key[:8] + "..." if key else "(empty)",
        "database_url_set": bool(settings.DATABASE_URL),
        "cors_origins": settings.CORS_ORIGINS,
    }
