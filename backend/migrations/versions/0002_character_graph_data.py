"""Add character relationship and event tables

Revision ID: 0002_character_graph_data
Revises: 0001_initial_schema
Create Date: 2026-05-08
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0002_character_graph_data"
down_revision: Union[str, None] = "0001_initial_schema"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "character_relationships",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("character_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("related_character_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("related_name", sa.String(length=100), nullable=False),
        sa.Column("relationship_type", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("evidence", sa.Text()),
        sa.Column("source_path", sa.Text()),
        sa.ForeignKeyConstraint(["character_id"], ["characters.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["related_character_id"], ["characters.id"], ondelete="SET NULL"
        ),
    )
    op.create_index(
        op.f("ix_character_relationships_character_id"),
        "character_relationships",
        ["character_id"],
    )
    op.create_index(
        op.f("ix_character_relationships_related_character_id"),
        "character_relationships",
        ["related_character_id"],
    )

    op.create_table(
        "character_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("character_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("sequence_number", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("source_path", sa.Text()),
        sa.ForeignKeyConstraint(["character_id"], ["characters.id"], ondelete="CASCADE"),
        sa.UniqueConstraint(
            "character_id",
            "sequence_number",
            name="uq_character_event_sequence",
        ),
    )
    op.create_index(op.f("ix_character_events_character_id"), "character_events", ["character_id"])


def downgrade() -> None:
    op.drop_table("character_events")
    op.drop_table("character_relationships")
