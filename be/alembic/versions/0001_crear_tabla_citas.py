"""crear tabla citas

Revision ID: 0001
Revises:
Create Date: 2026-08-06
"""
from alembic import op
import sqlalchemy as sa

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "citas",
        sa.Column("id_cita", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("id_cliente", sa.Integer(), nullable=False),
        sa.Column("id_tecnico", sa.Integer(), nullable=True),
        sa.Column("nombre_tecnico", sa.String(length=150), nullable=True),
        sa.Column("tipo_servicio", sa.String(length=30), nullable=False),
        sa.Column("fecha", sa.Date(), nullable=False),
        sa.Column("hora", sa.String(length=10), nullable=False),
        sa.Column("direccion", sa.String(length=200), nullable=False),
        sa.Column("descripcion", sa.Text(), nullable=True),
        sa.Column("estado", sa.String(length=20), nullable=False, server_default="Pendiente"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=True),
        sa.ForeignKeyConstraint(["id_cliente"], ["clientes.id_cliente"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id_cita"),
    )
    op.create_index("ix_citas_id_cliente", "citas", ["id_cliente"])


def downgrade() -> None:
    op.drop_index("ix_citas_id_cliente", table_name="citas")
    op.drop_table("citas")
