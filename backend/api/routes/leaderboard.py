"""
Leaderboard endpoint.

GET /api/v1/leaderboard
  Returns top users ranked by total_score.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from api.deps import get_db
from models.schemas import LeaderboardEntry, LeaderboardResponse
from services import db_postgres as db

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


@router.get("", response_model=LeaderboardResponse)
async def get_leaderboard(
    limit: int = Query(50, ge=1, le=100),
    session: AsyncSession = Depends(get_db),
):
    rows = await db.get_leaderboard(session, limit=limit)
    entries = [LeaderboardEntry(**row) for row in rows]
    return LeaderboardResponse(entries=entries)
