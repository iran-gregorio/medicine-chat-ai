"""add auth tables and extend users

Revision ID: 9a7e3ec2ff16
Revises: 
Create Date: 2026-05-12 01:44:00.000000

Changes:
- Add full_name, phone, is_active, updated_at columns to users table
- Create user_refresh_tokens table
- Create password_reset_tokens table
"""
from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "9a7e3ec2ff16"
down_revision: Union[str, None] = "be77f4db28e4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── 1. Extend the existing 'users' table ──────────────────────────────────
    # Add columns as nullable first (safe for existing rows, if any)
    op.add_column(
        "users",
        sa.Column("full_name", sa.String(255), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column(
            "phone",
            sa.String(20),
            nullable=True,
        ),
    )
    op.add_column(
        "users",
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
    )
    op.add_column(
        "users",
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )
    # Unique index on phone
    op.create_index("ix_users_phone", "users", ["phone"], unique=True)

    # ── 2. Create 'user_refresh_tokens' ───────────────────────────────────────
    op.create_table(
        "user_refresh_tokens",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("token", sa.Text(), nullable=False, unique=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("is_revoked", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )
    op.create_index(
        "ix_user_refresh_tokens_user_id", "user_refresh_tokens", ["user_id"]
    )

    # ── 3. Create 'password_reset_tokens' ─────────────────────────────────────
    op.create_table(
        "password_reset_tokens",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("token", sa.String(64), nullable=False, unique=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )
    op.create_index(
        "ix_password_reset_tokens_user_id", "password_reset_tokens", ["user_id"]
    )
    op.create_index(
        "ix_password_reset_tokens_token", "password_reset_tokens", ["token"], unique=True
    )


def downgrade() -> None:
    # ── Reverse in opposite order ─────────────────────────────────────────────
    op.drop_index("ix_password_reset_tokens_token", table_name="password_reset_tokens")
    op.drop_index("ix_password_reset_tokens_user_id", table_name="password_reset_tokens")
    op.drop_table("password_reset_tokens")

    op.drop_index("ix_user_refresh_tokens_user_id", table_name="user_refresh_tokens")
    op.drop_table("user_refresh_tokens")

    op.drop_index("ix_users_phone", table_name="users")
    op.drop_column("users", "updated_at")
    op.drop_column("users", "is_active")
    op.drop_column("users", "phone")
    op.drop_column("users", "full_name")
