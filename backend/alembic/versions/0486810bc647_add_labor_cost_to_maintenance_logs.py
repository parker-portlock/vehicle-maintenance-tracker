"""add_labor_cost_to_maintenance_logs

Revision ID: 0486810bc647
Revises: c4e8b2f6a1d9
Create Date: 2026-10-15 18:19:31.096158

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0486810bc647'
down_revision: Union[str, None] = 'c4e8b2f6a1d9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('maintenance_logs', sa.Column('labor_cost', sa.Numeric(precision=10, scale=2), nullable=True))

def downgrade() -> None:
    op.drop_column('maintenance_logs', 'labor_cost')

