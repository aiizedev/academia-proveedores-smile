"""shared: esquemas por módulo, outbox, auditoría y sync.processed_mutations

Revision ID: 0001
Revises:
Create Date: 2026-10-15
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

SCHEMAS = (
    "shared",
    "iam",
    "privacy",
    "suppliers",
    "catalog",
    "assessment",
    "improvement",
    "erp",
    "traceability",
    "receptions",
    "scoring",
    "recognition",
    "learning",
    "impact",
    "reporting",
    "notifications",
    "sync",
)


def upgrade() -> None:
    for schema in SCHEMAS:
        op.execute(f"CREATE SCHEMA IF NOT EXISTS {schema}")
    op.execute("CREATE EXTENSION IF NOT EXISTS timescaledb")

    op.create_table(
        "outbox",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("event_name", sa.String(120), nullable=False),
        sa.Column("payload", postgresql.JSONB(), nullable=False),
        sa.Column("occurred_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column("processed_at", sa.DateTime(timezone=True)),
        sa.Column("attempts", sa.Integer(), server_default="0", nullable=False),
        sa.Column("last_error", sa.Text()),
        sa.Column("dead", sa.Boolean(), server_default="false", nullable=False),
        schema="shared",
    )
    op.create_index("ix_outbox_event_name", "outbox", ["event_name"], schema="shared")
    op.create_index(
        "ix_outbox_pending",
        "outbox",
        ["created_at"],
        schema="shared",
        postgresql_where=sa.text("processed_at IS NULL AND NOT dead"),
    )

    op.create_table(
        "audit_log",
        sa.Column("id", sa.BigInteger(), sa.Identity(), primary_key=True),
        sa.Column("actor_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("actor_role", sa.String(16), nullable=False),
        sa.Column("action", sa.String(80), nullable=False),
        sa.Column("resource_type", sa.String(60), nullable=False),
        sa.Column("resource_id", sa.String(64)),
        sa.Column("details", postgresql.JSONB()),
        sa.Column("ip", postgresql.INET()),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        schema="shared",
    )
    op.create_index(
        "ix_audit_log_actor_created", "audit_log", ["actor_id", "created_at"], schema="shared"
    )

    op.create_table(
        "processed_mutations",
        sa.Column("mutation_id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("priority", sa.SmallInteger(), nullable=False),
        sa.Column(
            "processed_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column("result", postgresql.JSONB(), nullable=False),
        sa.CheckConstraint("priority IN (1, 2, 3)", name="priority_valid"),
        schema="sync",
    )
    op.create_index(
        "ix_processed_mutations_user",
        "processed_mutations",
        ["user_id", "processed_at"],
        schema="sync",
    )


def downgrade() -> None:
    op.drop_table("processed_mutations", schema="sync")
    op.drop_table("audit_log", schema="shared")
    op.drop_table("outbox", schema="shared")
    for schema in reversed(SCHEMAS):
        if schema != "shared":
            op.execute(f"DROP SCHEMA IF EXISTS {schema} CASCADE")
