"""catalog: categorías, ejes y parámetros v1 (RF-CAT-001, 002, 004)

Datos de referencia (no de demo): el sistema los necesita aunque SEED_DEMO=false.

Revision ID: catalog_0003
Revises: iam_0002
Create Date: 2026-10-16
"""

import uuid
from collections.abc import Sequence
from datetime import datetime
from zoneinfo import ZoneInfo

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "catalog_0003"
down_revision: str | None = "iam_0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

_NS = uuid.UUID("5e3d1c7a-0b5f-4c1e-9a52-5311e0000001")
VALID_FROM = datetime(2026, 10, 1, tzinfo=ZoneInfo("America/Bogota"))

# C-08: 5 categorías de SPEC-BASE §5.1; en el piloto solo Fruver está ACTIVA.
CATEGORIES = [
    ("fruver", "Fruver", "ACTIVA", "fruver"),
    ("lacteos", "Lácteos", "PROXIMAMENTE", "lacteos"),
    ("carnes", "Carnes", "PROXIMAMENTE", "carnes"),
    ("pescados_mariscos", "Pescados y Mariscos", "PROXIMAMENTE", "pescados"),
    ("insumos_servicios", "Insumos y Servicios", "PROXIMAMENTE", "insumos"),
]

# RF-CAT-002, DOC-FRUVER §2: ejes Fruver en este orden.
FRUVER_AXES = [
    ("bpa", "Buenas Prácticas Agrícolas", "Buenas prácticas"),
    ("residuos", "Manejo de residuos", "Residuos"),
    ("carbono", "Huella de carbono", "Huella de carbono"),
    ("infantil", "Prevención del trabajo infantil", "Trabajo infantil"),
    ("ddhh", "Derechos humanos y SST", "Derechos humanos"),
]

# Supuestos S-xx (conflictos-y-supuestos.md) como parámetros versión 1.
# Decimales como texto para no perder precisión en JSON.
PARAMETERS: dict[str, dict[str, object]] = {
    "assessment.answers": {  # S-01
        "values": {"si": "1", "aveces": "0.5", "no": "0"},
        "excluded": ["na", "pnr"],
    },
    "assessment.levels": {"desarrollo_from": "40", "avanzado_from": "75"},  # S-03
    "assessment.form_limits": {"micro": 8, "pequena": 15, "mediana": 15, "grande": 25},  # SOT §3.1
    "assessment.late_submission": {"grace_days": 15},  # S-17
    "scoring.weights": {
        "p1": "0.50",
        "p2": "0.30",
        "p3": "0.20",
        "renormalize": True,
    },  # SOT §1.2, S-07
    "scoring.p1": {"axis_aggregation": "mean_equal_weights"},  # S-04
    "scoring.p2_formula": {  # S-05
        "weights": {
            "quality": "0.40",
            "volume": "0.25",
            "punctuality": "0.20",
            "withholding": "0.15",
        },
        "rejection_full_score_max": "5",
        "rejection_zero_score_min": "16",
        "punctuality_window_min": 60,
    },
    "scoring.p3_formula": {  # S-06
        "weights": {"frequency": "0.40", "learning": "0.35", "consistency": "0.25"},
    },
    "scoring.funnel": {  # S-08, C-10, SOT §1.1
        "e4_erp_recent_days": 14,
        "regression_days": 30,
        "e5_min_score": "80",
    },
    "improvement.plan": {"goals": 3},  # S-09, SOT §1.1
    "erp.edit_window_days": {"days": 7},  # S-10
    "erp.credible_range": {"percentile": 99, "min_records": 20},  # S-11
    "catalog.unit_conversions": {"arroba": "12.5", "bulto": "50"},  # S-12
    "iam.session": {"refresh_days": 30},  # S-13
    "recognition.thresholds": {"carita_weeks": 4, "flor_weeks": 12},  # S-14
    "learning.clip_completion": {"min_ratio": "0.90"},  # S-15
    "traceability.label": {"format": "SML-{CAT}-{PROV}-{AAAAMMDD}-{SEQ}-{DV}"},  # S-16
    "impact.emission_factors": {  # C-12, DOC-FRUVER
        "n_synthetic_kgco2e_per_kg": "2.45",
        "diesel_kgco2e_per_gal": "10.21",
        "gasoline_kgco2e_per_gal": "8.89",
        "grid_kgco2e_per_kwh": "0.164",
    },
}


def upgrade() -> None:
    categories = op.create_table(
        "categories",
        sa.Column("code", sa.Text(), primary_key=True),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("status", sa.Text(), nullable=False),
        sa.Column("icon", sa.Text(), nullable=False),
        sa.Column("position", sa.SmallInteger(), nullable=False),
        sa.CheckConstraint("status IN ('ACTIVA','PROXIMAMENTE')", name="status_valid"),
        schema="catalog",
    )
    axes = op.create_table(
        "axes",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "category_code", sa.Text(), sa.ForeignKey("catalog.categories.code"), nullable=False
        ),
        sa.Column("code", sa.Text(), nullable=False),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("short_name", sa.Text(), nullable=False),
        sa.Column("icon", sa.Text(), nullable=False),
        sa.Column("position", sa.SmallInteger(), nullable=False),
        sa.UniqueConstraint("category_code", "code", name="uq_axes_category_code"),
        schema="catalog",
    )
    params = op.create_table(
        "parameter_sets",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("key", sa.Text(), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("value", postgresql.JSONB(), nullable=False),
        sa.Column("valid_from", sa.DateTime(timezone=True), nullable=False),
        sa.Column("published_by", postgresql.UUID(as_uuid=True)),
        sa.Column(
            "published_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.UniqueConstraint("key", "version", name="uq_parameter_sets_key_version"),
        schema="catalog",
    )
    op.create_index(
        "ix_parameter_sets_key_valid_from",
        "parameter_sets",
        ["key", sa.text("valid_from DESC")],
        schema="catalog",
    )

    op.bulk_insert(
        categories,
        [
            {"code": c, "name": n, "status": s, "icon": i, "position": pos}
            for pos, (c, n, s, i) in enumerate(CATEGORIES, start=1)
        ],
    )
    op.bulk_insert(
        axes,
        [
            {
                "id": uuid.uuid5(_NS, f"axis:fruver:{code}"),
                "category_code": "fruver",
                "code": code,
                "name": name,
                "short_name": short,
                "icon": code,
                "position": pos,
            }
            for pos, (code, name, short) in enumerate(FRUVER_AXES, start=1)
        ],
    )
    op.bulk_insert(
        params,
        [
            {
                "id": uuid.uuid5(_NS, f"parameters:{key}:1"),
                "key": key,
                "version": 1,
                "value": value,
                "valid_from": VALID_FROM,
            }
            for key, value in PARAMETERS.items()
        ],
    )


def downgrade() -> None:
    op.drop_table("parameter_sets", schema="catalog")
    op.drop_table("axes", schema="catalog")
    op.drop_table("categories", schema="catalog")
