from typing import Sequence, Union
from alembic import op


revision: str = 'e46a62c44e3a'
down_revision: Union[str, None] = '8233d1fc10e5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        CREATE OR REPLACE FUNCTION sync_idea_comment_count(p_idea_id UUID)
        RETURNS VOID AS $$
        BEGIN
            IF p_idea_id IS NOT NULL THEN
                UPDATE ideas
                SET comment_count = (
                    SELECT COUNT(*)
                    FROM comments
                    WHERE comments.idea_id = p_idea_id
                )
                WHERE ideas.id = p_idea_id;
            END IF;
        END;
        $$ LANGUAGE plpgsql;
    """)

    op.execute("""
        CREATE OR REPLACE FUNCTION handle_comment_count_change()
        RETURNS TRIGGER AS $$
        BEGIN
            IF TG_OP = 'INSERT' THEN
                PERFORM sync_idea_comment_count(NEW.idea_id);
                RETURN NEW;
            ELSIF TG_OP = 'DELETE' THEN
                PERFORM sync_idea_comment_count(OLD.idea_id);
                RETURN OLD;
            ELSIF TG_OP = 'UPDATE' THEN
                PERFORM sync_idea_comment_count(OLD.idea_id);
                PERFORM sync_idea_comment_count(NEW.idea_id);
                RETURN NEW;
            END IF;
            RETURN NULL;
        END;
        $$ LANGUAGE plpgsql;
    """)

    op.execute("""
        DROP TRIGGER IF EXISTS comments_sync_idea_comment_count ON comments;
    """)

    op.execute("""
        CREATE TRIGGER comments_sync_idea_comment_count
        AFTER INSERT OR UPDATE OR DELETE ON comments
        FOR EACH ROW
        EXECUTE FUNCTION handle_comment_count_change();
    """)


def downgrade() -> None:
    op.execute("""
        DROP TRIGGER IF EXISTS comments_sync_idea_comment_count ON comments;
    """)

    op.execute("""
        DROP FUNCTION IF EXISTS handle_comment_count_change();
    """)

    op.execute("""
        DROP FUNCTION IF EXISTS sync_idea_comment_count(UUID);
    """)