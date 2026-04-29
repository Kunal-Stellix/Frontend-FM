"""Add trigger for ideas.updated_at automatic updates

Revision ID: 3b5c2d4e1f6a
Revises: fd842856cc1f
Create Date: 2026-04-29 02:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = '3b5c2d4e1f6a'
down_revision: Union[str, None] = 'fd842856cc1f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Step 1: Create function to automatically update updated_at timestamp
    op.execute("""
        CREATE OR REPLACE FUNCTION update_ideas_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """)
    
    # Step 2: Drop existing trigger if it exists (separate call for asyncpg compatibility)
    op.execute("DROP TRIGGER IF EXISTS ideas_update_updated_at ON ideas;")
    
    # Step 3: Create trigger that fires before UPDATE on ideas table (separate call)
    op.execute("""
        CREATE TRIGGER ideas_update_updated_at
        BEFORE UPDATE ON ideas
        FOR EACH ROW
        EXECUTE FUNCTION update_ideas_updated_at();
    """)


def downgrade() -> None:
    # Remove trigger and function
    op.execute("DROP TRIGGER IF EXISTS ideas_update_updated_at ON ideas;")
    op.execute("DROP FUNCTION IF EXISTS update_ideas_updated_at();")
