import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.portal_settings import PortalSettings


async def get_settings(db: AsyncSession) -> PortalSettings:
    result = await db.execute(select(PortalSettings))
    settings = result.scalar_one_or_none()

    if not settings:
        settings = PortalSettings()
        db.add(settings)
        await db.flush()
        await db.refresh(settings)

    return settings


async def update_settings(
    db: AsyncSession, data: "PortalSettingsUpdate"
) -> PortalSettings:
    settings = await get_settings(db)

    if data.portal_name is not None:
        settings.portal_name = data.portal_name
    if data.logo_url is not None:
        settings.logo_url = data.logo_url
    if data.brand_color is not None:
        settings.brand_color = data.brand_color
    if data.custom_domain is not None:
        settings.custom_domain = data.custom_domain
    if data.moderation_on is not None:
        settings.moderation_on = data.moderation_on

    await db.flush()
    await db.refresh(settings)
    return settings