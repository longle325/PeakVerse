"""
Character detail endpoints.

GET /api/v1/characters          – list all characters
GET /api/v1/characters/{id}     – get character detail
"""

from __future__ import annotations

from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from api.deps import get_db
from models.schemas import (
    CharacterCard,
    CharacterDetail,
    CharacterEventsResponse,
    CharacterEventResponse,
    CharacterRelationshipsResponse,
    CharacterRelationshipResponse,
)
from services import db_postgres as db

router = APIRouter(prefix="/characters", tags=["characters"])


@router.get("", response_model=List[CharacterCard])
async def list_characters(
    session: AsyncSession = Depends(get_db),
):
    characters = await db.list_characters(session)
    return [CharacterCard.model_validate(c) for c in characters]


@router.get("/{character_id}", response_model=CharacterDetail)
async def get_character(
    character_id: UUID,
    session: AsyncSession = Depends(get_db),
):
    character = await db.get_character(session, character_id)
    if not character:
        raise HTTPException(status_code=404, detail="Character not found.")
    return CharacterDetail.model_validate(character)


@router.get("/{character_id}/relationships", response_model=CharacterRelationshipsResponse)
async def get_character_relationships(
    character_id: UUID,
    session: AsyncSession = Depends(get_db),
):
    character = await db.get_character(session, character_id)
    if not character:
        raise HTTPException(status_code=404, detail="Character not found.")
    relationships = await db.list_character_relationships(session, character_id)
    return CharacterRelationshipsResponse(
        relationships=[
            CharacterRelationshipResponse.model_validate(relationship)
            for relationship in relationships
        ]
    )


@router.get("/{character_id}/events", response_model=CharacterEventsResponse)
async def get_character_events(
    character_id: UUID,
    session: AsyncSession = Depends(get_db),
):
    character = await db.get_character(session, character_id)
    if not character:
        raise HTTPException(status_code=404, detail="Character not found.")
    events = await db.list_character_events(session, character_id)
    return CharacterEventsResponse(
        events=[CharacterEventResponse.model_validate(event) for event in events]
    )
