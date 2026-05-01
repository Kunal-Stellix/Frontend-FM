"""add_roadmap_tables

Revision ID: e37e2d8914a0
Revises: 3b5c2d4e1f6a
Create Date: 2026-05-01

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


# revision identifiers, used by Alembic.
revision: str = 'e37e2d8914a0'
down_revision: Union[str, None] = 'e46a62c44e3a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create roadmap_items table
    op.create_table(
        'roadmap_items',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.Enum('planned', 'in_progress', 'shipped', name='roadmapstatus'), nullable=False, server_default='planned'),
        sa.Column('sort_order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('ix_roadmap_items_status', 'roadmap_items', ['status'])

    # Create roadmap_idea_links junction table
    op.create_table(
        'roadmap_idea_links',
        sa.Column('roadmap_item_id', UUID(as_uuid=True), sa.ForeignKey('roadmap_items.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('idea_id', UUID(as_uuid=True), sa.ForeignKey('ideas.id', ondelete='CASCADE'), primary_key=True),
        sa.UniqueConstraint('roadmap_item_id', 'idea_id', name='uq_roadmap_idea_link'),
    )


def downgrade() -> None:
    op.drop_table('roadmap_idea_links')
    op.drop_index('ix_roadmap_items_status', 'roadmap_items')
    op.drop_table('roadmap_items')
    op.execute('DROP TYPE roadmapstatus')