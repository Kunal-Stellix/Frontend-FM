"""add_changelog_tables

Revision ID: a1b2c3d4e5f6
Revises: e37e2d8914a0
Create Date: 2026-05-01

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = 'e37e2d8914a0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'changelog_entries',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('body', sa.Text(), nullable=True),
        sa.Column('type', sa.Enum('new_feature', 'improvement', 'bug_fix', name='changelogtype'), nullable=False),
        sa.Column('linked_idea_id', UUID(as_uuid=True), sa.ForeignKey('ideas.id', ondelete='SET NULL'), nullable=True),
        sa.Column('created_by', UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('published_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('ix_changelog_type', 'changelog_entries', ['type'])
    op.create_index('ix_changelog_published_at', 'changelog_entries', ['published_at'])

    op.create_table(
        'changelog_subscribers',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('email', sa.String(255), unique=True, nullable=False),
        sa.Column('unsubscribe_token', sa.String(64), unique=True, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )


def downgrade() -> None:
    op.drop_table('changelog_subscribers')
    op.drop_index('ix_changelog_published_at', 'changelog_entries')
    op.drop_index('ix_changelog_type', 'changelog_entries')
    op.drop_table('changelog_entries')
    op.execute('DROP TYPE changelogtype')