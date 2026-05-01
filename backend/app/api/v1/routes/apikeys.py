import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_current_user, require_admin
from app.core.database import get_db
from app.models.user import User
from app.schemas.apikey import ApiKeyCreate, ApiKeyResponse
from app.services import apikey_service

router = APIRouter()


@router.get(
    "/admin/apikeys",
    response_model=list[ApiKeyResponse],
    tags=["API Keys"],
    dependencies=[Depends(require_admin)],
)
async def list_api_keys(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    keys = await apikey_service.list_api_keys(db, current_user.id)
    return [
        ApiKeyResponse(
            id=k.id,
            name=k.name,
            key_prefix=k.key_prefix,
            plaintext_key=None,
            last_used_at=k.last_used_at,
            created_at=k.created_at,
        )
        for k in keys
    ]


@router.post(
    "/admin/apikeys",
    response_model=ApiKeyResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["API Keys"],
    dependencies=[Depends(require_admin)],
)
async def create_api_key(
    data: ApiKeyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    api_key, plaintext = await apikey_service.create_api_key(
        db, data.name, current_user.id
    )
    return ApiKeyResponse(
        id=api_key.id,
        name=api_key.name,
        key_prefix=api_key.key_prefix,
        plaintext_key=plaintext,
        last_used_at=api_key.last_used_at,
        created_at=api_key.created_at,
    )


@router.delete(
    "/admin/apikeys/{key_id}",
    status_code=status.HTTP_200_OK,
    tags=["API Keys"],
    dependencies=[Depends(require_admin)],
)
async def delete_api_key(
    key_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deleted = await apikey_service.delete_api_key(db, key_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="API key not found")
    return {"deleted": True}