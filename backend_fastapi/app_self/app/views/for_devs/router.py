from fastapi import APIRouter
from app_dependencies import PREFIX
from . import (
    get_dev_data, update_limit, restart_service, format_disk,
    delete_every_user, add_user, manage_user
)

router = APIRouter(prefix=PREFIX)

router.include_router(get_dev_data.router)
router.include_router(update_limit.router)
router.include_router(restart_service.router)
router.include_router(format_disk.router)
router.include_router(delete_every_user.router)
router.include_router(add_user.router)
router.include_router(manage_user.router)

