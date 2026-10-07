"""Allow NULL users.password_hash (Google-only accounts have no password).

Legacy SQLite databases created before Google sign-in declared the column
NOT NULL, which made first-time Google sign-up fail with an IntegrityError.
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

revision = "0002_nullable_password_hash"
down_revision = "0001_backend_baseline"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    inspector = inspect(bind)
    if "users" not in inspector.get_table_names():
        return
    column = next((c for c in inspector.get_columns("users") if c["name"] == "password_hash"), None)
    if column is None or column["nullable"]:
        return
    # batch mode recreates the table on SQLite, which cannot ALTER COLUMN.
    with op.batch_alter_table("users") as batch:
        batch.alter_column("password_hash", existing_type=sa.String(), nullable=True)


def downgrade():
    pass
