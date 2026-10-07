"""Create current CareerBridge schema and bring forward legacy SQLite files."""

from alembic import op
from sqlalchemy import inspect

from backend.app.database.session import Base
from backend.app.models import entities  # noqa: F401

revision = "0001_backend_baseline"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    # create_all creates every new table on empty installations and is a no-op
    # for existing tables, which lets the following additive upgrades preserve
    # the project's pre-Alembic SQLite database.
    Base.metadata.create_all(bind=bind)
    inspector = inspect(bind)
    additions = {
        "users": [("google_subject", "VARCHAR(255)")],
        "roadmap_items": [("completed_goals", "JSON NOT NULL DEFAULT '[]'")],
        "opportunities": [
            ("source", "VARCHAR(255) NOT NULL DEFAULT 'curated'"),
            ("external_id", "VARCHAR(255)"),
            ("fetched_at", "DATETIME"),
        ],
    }
    for table, columns in additions.items():
        if table not in inspector.get_table_names():
            continue
        existing = {column["name"] for column in inspector.get_columns(table)}
        for name, type_sql in columns:
            if name not in existing:
                op.execute(f"ALTER TABLE {table} ADD COLUMN {name} {type_sql}")
    inspector = inspect(bind)
    if "users" in inspector.get_table_names() and "ix_users_google_subject" not in {i["name"] for i in inspector.get_indexes("users")}:
        op.create_index("ix_users_google_subject", "users", ["google_subject"], unique=True)


def downgrade():
    # The baseline includes legacy data and is intentionally irreversible.
    pass
