"""Add capacity_unit to parts table

Revision ID: b7c9d1e2f3a4
Revises: 0486810bc647
Create Date: 2026-10-28 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b7c9d1e2f3a4'
down_revision: Union[str, None] = '0486810bc647'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('parts', sa.Column('capacity_unit', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('parts', 'capacity_unit')
