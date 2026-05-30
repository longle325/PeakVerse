"""
Async SQLAlchemy engine and session factory for PostgreSQL.
"""

import ssl as _ssl
from urllib.parse import parse_qs, urlencode, urlparse, urlunparse

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy import text
from sqlalchemy.orm import DeclarativeBase

from core.config import settings


def _prepare_url(raw_url: str) -> tuple[str, dict]:
    """
    Strip ``sslmode`` from the query string (asyncpg doesn't accept it)
    and return (clean_url, connect_args).

    If sslmode was ``require`` / ``verify-ca`` / ``verify-full``, pass an
    ``ssl=True`` via connect_args so asyncpg still uses TLS.
    """
    parsed = urlparse(raw_url)
    params = parse_qs(parsed.query)
    sslmode = params.pop("sslmode", [None])[0]

    # Rebuild URL without sslmode
    clean_query = urlencode({k: v[0] for k, v in params.items()})
    clean_url = urlunparse(parsed._replace(query=clean_query))

    connect_args: dict = {}
    if sslmode and sslmode != "disable":
        # Create a permissive SSL context (like sslmode=require)
        ctx = _ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = _ssl.CERT_NONE
        connect_args["ssl"] = ctx

    return clean_url, connect_args


_url, _connect_args = _prepare_url(settings.DATABASE_URL)

engine = create_async_engine(
    _url,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    connect_args=_connect_args,
)

async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """Declarative base for all ORM models."""

    pass


async def ensure_vector_extension() -> None:
    """Enable pgvector before creating tables that use vector columns."""
    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
