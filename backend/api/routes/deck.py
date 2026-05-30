"""
Discovery deck endpoint.

GET /api/v1/deck?user_id={id}
  Returns 6-10 characters the user hasn't swiped on yet.
"""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from api.deps import get_db
from models.schemas import CharacterCard, DeckResponse
from services import db_postgres as db

router = APIRouter(prefix="/deck", tags=["deck"])


@router.get("", response_model=DeckResponse)
async def get_deck(
    user_id: UUID = Query(..., description="Current user's UUID"),
    session: AsyncSession = Depends(get_db),
):
    user = await db.get_user(session, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    characters = await db.get_unswiped_characters(session, user_id, limit=10)
    cards = [CharacterCard.model_validate(c) for c in characters]
    return DeckResponse(characters=cards)
