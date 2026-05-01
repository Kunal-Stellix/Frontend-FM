from math import ceil
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.comment import Comment
from app.models.idea import Idea
from app.models.user import User
from app.models.follower import Follower
from app.models.notification import Notification, NotificationType
from app.schemas.comment import CommentCreate, CommentListResponse, CommentResponse
from app.services.notification_service import create_notification
from app.services.webhook_service import dispatch_event


class CommentService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_comments(
        self,
        idea_id: UUID,
        page: int = 1,
        page_size: int = 20,
    ) -> CommentListResponse:
        idea = await self.db.get(Idea, idea_id)
        if not idea:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Idea not found",
            )

        total_stmt = select(func.count(Comment.id)).where(
            Comment.idea_id == idea_id,
            Comment.parent_id.is_(None),
        )
        total = await self.db.scalar(total_stmt)
        total = total or 0

        stmt = (
            select(Comment)
            .where(
                Comment.idea_id == idea_id,
                Comment.parent_id.is_(None),
            )
            .options(
                selectinload(Comment.author),
                selectinload(Comment.replies).selectinload(Comment.author),
            )
            .order_by(Comment.created_at.asc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )

        result = await self.db.execute(stmt)
        comments = result.scalars().unique().all()

        items = [self._serialize_comment(comment) for comment in comments]
        has_next = page * page_size < total

        return CommentListResponse(
            items=items,
            total=total,
            page=page,
            has_next=has_next,
        )

    async def create_comment(
        self,
        idea_id: UUID,
        data: CommentCreate,
        current_user: User,
    ) -> CommentResponse:
        idea = await self.db.get(Idea, idea_id)
        if not idea:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Idea not found",
            )

        parent_comment = None
        if data.parent_id:
            parent_comment = await self.db.get(Comment, data.parent_id)
            if not parent_comment or parent_comment.idea_id != idea_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid parent comment",
                )

        comment = Comment(
            idea_id=idea_id,
            author_id=current_user.id,
            parent_id=data.parent_id,
            body=data.body.strip(),
        )

        self.db.add(comment)
        await self.db.commit()

        # If this is a reply, notify the parent comment author
        if data.parent_id and parent_comment:
            # Don't notify if replying to yourself
            if parent_comment.author_id != current_user.id:
                await create_notification(
                    self.db,
                    user_id=parent_comment.author_id,
                    type=NotificationType.comment_reply,
                    title=f"New reply to your comment",
                    body=f"{current_user.name} replied: {data.body.strip()[:100]}",
                    link=f"/ideas/{idea_id}",
                )

        # Dispatch webhook for new comment
        await dispatch_event(
            self.db,
            event="comment.created",
            payload={
                "comment_id": str(comment.id),
                "idea_id": str(idea_id),
                "author_id": str(current_user.id),
                "body_preview": data.body.strip()[:100],
                "parent_id": str(data.parent_id) if data.parent_id else None,
            },
        )

        stmt = (
            select(Comment)
            .where(Comment.id == comment.id)
            .options(
                selectinload(Comment.author),
                selectinload(Comment.replies).selectinload(Comment.author),
            )
        )
        result = await self.db.execute(stmt)
        created_comment = result.scalar_one()

        return self._serialize_comment(created_comment)

    async def delete_comment(
        self,
        idea_id: UUID,
        comment_id: UUID,
        current_user: User,
    ) -> dict:
        stmt = (
            select(Comment)
            .where(Comment.id == comment_id, Comment.idea_id == idea_id)
            .options(selectinload(Comment.author))
        )
        result = await self.db.execute(stmt)
        comment = result.scalar_one_or_none()

        if not comment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Comment not found",
            )

        is_admin = getattr(current_user.role, "value", current_user.role) == "admin"
        is_author = comment.author_id == current_user.id

        if not (is_admin or is_author):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not allowed to delete this comment",
            )

        await self.db.delete(comment)
        await self.db.commit()

        return {"deleted": True}

    def _serialize_comment(self, comment: Comment) -> CommentResponse:
        replies = sorted(comment.replies or [], key=lambda x: x.created_at)

        return CommentResponse(
            id=comment.id,
            body=comment.body,
            author=comment.author,
            parent_id=comment.parent_id,
            replies=[
                CommentResponse(
                    id=reply.id,
                    body=reply.body,
                    author=reply.author,
                    parent_id=reply.parent_id,
                    replies=[],
                    created_at=reply.created_at,
                    updated_at=reply.updated_at,
                )
                for reply in replies
            ],
            created_at=comment.created_at,
            updated_at=comment.updated_at,
        )