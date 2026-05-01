"""add_webhooks_table

Revision ID: f4a5b6c7d8e9
Revises: c3d4e5f6a7b8
Create Date: 2026-05-01

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, ARRAY


revision: str = 'f4a5b6c7d8e9'
down_revision: Union[str, None] = 'c3d4e5f6a7b8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'webhooks',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('url', sa.Text(), nullable=False),
        sa.Column('secret', sa.String(64), nullable=False),
        sa.Column('events', ARRAY(sa.Text()), nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('ix_webhooks_is_active', 'webhooks', ['is_active'])


def downgrade() -> None:
    op.drop_index('ix_webhooks_is_active', 'webhooks')
    op.drop_table('webhooks')
