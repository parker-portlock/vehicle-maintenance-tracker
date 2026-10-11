"""Add log_parts association table

Revision ID: c4e8b2f6a1d9
Revises: cfce19cb6448
Create Date: 2026-10-11 01:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c4e8b2f6a1d9'
down_revision: Union[str, None] = 'cfce19cb6448'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('log_parts',
    sa.Column('log_id', sa.UUID(), nullable=False),
    sa.Column('part_id', sa.UUID(), nullable=False),
    sa.Column('quantity', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['log_id'], ['maintenance_logs.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['part_id'], ['parts.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('log_id', 'part_id')
    )
    op.drop_column('maintenance_logs', 'parts_used')


def downgrade() -> None:
    op.add_column('maintenance_logs', sa.Column('parts_used', sa.JSONB(), nullable=True))
    op.drop_table('log_parts')