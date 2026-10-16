"""suppliers: tabla suppliers con la ficha de identificación (RF-SUP-001)

Revision ID: suppliers_0005
Revises: iam_0004
Create Date: 2026-10-16
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "suppliers_0005"
down_revision: str | None = "iam_0004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "suppliers",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("owner_user_id", postgresql.UUID(as_uuid=True), nullable=False, unique=True),
        sa.Column("person_type", sa.Text()),
        sa.Column("tax_id", sa.String(15), unique=True),
        sa.Column("tax_dv", sa.String(1)),
        sa.Column("legal_name", sa.Text()),
        sa.Column("legal_rep", sa.Text()),
        sa.Column("department_code", sa.String(2)),
        sa.Column("municipality_code", sa.String(5)),
        sa.Column("vereda", sa.Text()),
        sa.Column("latitude", sa.Numeric(9, 6)),
        sa.Column("longitude", sa.Numeric(9, 6)),
        sa.Column("contact_channel", sa.Text()),
        sa.Column("main_category", sa.Text()),
        sa.Column(
            "secondary_categories",
            postgresql.ARRAY(sa.Text()),
            server_default="{}",
            nullable=False,
        ),
        sa.Column("segment", sa.Text(), server_default="LOCAL", nullable=False),
        sa.Column("profile_completed_at", sa.DateTime(timezone=True)),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.CheckConstraint("person_type IN ('natural','juridica')", name="person_type_valid"),
        sa.CheckConstraint(
            "contact_channel IN ('whatsapp','llamada','correo')", name="contact_channel_valid"
        ),
        sa.CheckConstraint("segment IN ('ESTRATEGICO','LOCAL')", name="segment_valid"),
        sa.CheckConstraint(
            "profile_completed_at IS NULL OR (tax_id IS NOT NULL AND legal_name IS NOT NULL"
            " AND municipality_code IS NOT NULL AND main_category IS NOT NULL)",
            name="complete_profile_has_fields",
        ),
        schema="suppliers",
    )
    for col in ("main_category", "segment", "municipality_code"):
        op.create_index(f"ix_suppliers_{col}", "suppliers", [col], schema="suppliers")


def downgrade() -> None:
    op.drop_table("suppliers", schema="suppliers")
