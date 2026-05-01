import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_current_user, require_admin
from app.core.database import get_db
from app.models.user import User
from app.schemas.settings import PortalSettingsResponse, PortalSettingsUpdate
from app.services import settings_service

router = APIRouter()


@router.get(
    "/admin/settings",
    response_model=PortalSettingsResponse,
    tags=["Settings"],
    dependencies=[Depends(require_admin)],
)
async def get_settings(
    db: AsyncSession = Depends(get_db),
):
    return await settings_service.get_settings(db)


@router.patch(
    "/admin/settings",
    response_model=PortalSettingsResponse,
    tags=["Settings"],
    dependencies=[Depends(require_admin)],
)
async def update_settings(
    data: PortalSettingsUpdate,
    db: AsyncSession = Depends(get_db),
):
    return await settings_service.update_settings(db, data)