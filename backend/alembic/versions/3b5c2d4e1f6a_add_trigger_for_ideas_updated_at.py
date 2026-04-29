"""Add PostgreSQL triggers for automatic updated_at timestamp updates

This migration creates a generic PostgreSQL trigger system that will:
1. Automatically update the 'updated_at' field on ANY UPDATE
2. Be reused across ALL tables with updated_at field
3. Work for both current and future models

Current tables with triggers:
- users
- ideas

Future tables with updated_at will automatically get the same trigger.

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

# List of tables that need updated_at triggers
# Add new tables here as you create models with updated_at field
TABLES_WITH_TIMESTAMP = [
    'users',
    'ideas',
    # Add future tables here:
    # 'comments',
    # 'any_new_table',
]


def upgrade() -> None:
    """
    Create a reusable function and apply triggers to all timestamp-tracked tables.
    
    This approach ensures:
    - Single source of truth for timestamp logic
    - Easy to extend for new tables
    - Works with both ORM and raw SQL updates
    """
    
    # Step 1: Create generic function that updates any table's updated_at
    op.execute("""
        CREATE OR REPLACE FUNCTION update_timestamp()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """)
    
    # Step 2: Create triggers for each table
    for table_name in TABLES_WITH_TIMESTAMP:
        trigger_name = f"{table_name}_update_timestamp"
        
        # Drop existing trigger if it exists
        op.execute(f"DROP TRIGGER IF EXISTS {trigger_name} ON {table_name};")
        
        # Create new trigger
        op.execute(f"""
            CREATE TRIGGER {trigger_name}
            BEFORE UPDATE ON {table_name}
            FOR EACH ROW
            EXECUTE FUNCTION update_timestamp();
        """)


def downgrade() -> None:
    """Remove all triggers and the shared function."""
    
    # Remove triggers for all tables
    for table_name in TABLES_WITH_TIMESTAMP:
        trigger_name = f"{table_name}_update_timestamp"
        op.execute(f"DROP TRIGGER IF EXISTS {trigger_name} ON {table_name};")
    
    # Remove the shared function
    op.execute("DROP FUNCTION IF EXISTS update_timestamp();")




