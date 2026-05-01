import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_current_user, require_admin
from app.core.database import get_db
from app.models.user import User
from app.schemas.roadmap import (
    RoadmapItemCreate,
    RoadmapItemUpdate,
    RoadmapItemResponse,
    RoadmapBoardResponse,
)
from app.services import roadmap_service

router = APIRouter()


@router.get("/roadmap", response_model=RoadmapBoardResponse, tags=["Roadmap"])
async def get_roadmap(db: AsyncSession = Depends(get_db)):
    return await roadmap_service.get_roadmap_board(db)


@router.get(
    "/admin/roadmap/{item_id}",
    response_model=RoadmapItemResponse,
    tags=["Roadmap"],
    dependencies=[Depends(require_admin)],
)
async def get_roadmap_item(item_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    item = await roadmap_service.get_roadmap_item(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Roadmap item not found")
    return item


@router.post(
    "/admin/roadmap",
    response_model=RoadmapItemResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Roadmap"],
    dependencies=[Depends(require_admin)],
)
async def create_roadmap_item(
    data: RoadmapItemCreate, db: AsyncSession = Depends(get_db)
):
    try:
        item = await roadmap_service.create_roadmap_item(db, data)
        return item
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.patch(
    "/admin/roadmap/{item_id}",
    response_model=RoadmapItemResponse,
    tags=["Roadmap"],
    dependencies=[Depends(require_admin)],
)
async def update_roadmap_item(
    item_id: uuid.UUID,
    data: RoadmapItemUpdate,
    db: AsyncSession = Depends(get_db),
):
    try:
        item = await roadmap_service.update_roadmap_item(db, item_id, data)
        if not item:
            raise HTTPException(status_code=404, detail="Roadmap item not found")
        return item
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete(
    "/admin/roadmap/{item_id}",
    status_code=status.HTTP_200_OK,
    tags=["Roadmap"],
    dependencies=[Depends(require_admin)],
)
async def delete_roadmap_item(item_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    deleted = await roadmap_service.delete_roadmap_item(db, item_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Roadmap item not found")
    return {"deleted": True}