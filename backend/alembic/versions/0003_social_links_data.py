"""Add github_data and linkedin_data to profiles

Revision ID: 0003_social_links_data
Revises: 0002_nullable_password_hash
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

revision = "0003_social_links_data"
down_revision = "0002_nullable_password_hash"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    inspector = inspect(bind)
    if "profiles" not in inspector.get_table_names():
        return
    existing_cols = {c["name"] for c in inspector.get_columns("profiles")}
    with op.batch_alter_table("profiles") as batch:
        if "github_data" not in existing_cols:
            batch.add_column(sa.Column("github_data", sa.JSON(), nullable=True))
        if "linkedin_data" not in existing_cols:
            batch.add_column(sa.Column("linkedin_data", sa.JSON(), nullable=True))


def downgrade():
    pass
