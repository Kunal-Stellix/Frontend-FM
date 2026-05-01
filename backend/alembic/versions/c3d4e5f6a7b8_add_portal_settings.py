"""add_portal_settings_and_more

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-05-01

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, ARRAY


revision: str = 'c3d4e5f6a7b8'
down_revision: Union[str, None] = 'b2c3d4e5f6a7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'portal_settings',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('portal_name', sa.String(255), server_default='Feedback', nullable=False),
        sa.Column('logo_url', sa.Text(), nullable=True),
        sa.Column('brand_color', sa.String(7), server_default='#2980B9', nullable=False),
        sa.Column('custom_domain', sa.String(255), nullable=True),
        sa.Column('domain_verified', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('moderation_on', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )


def downgrade() -> None:
    op.drop_table('portal_settings')