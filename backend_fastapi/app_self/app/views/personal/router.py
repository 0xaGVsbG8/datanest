from fastapi import APIRouter
from app_independencies import PREFIX
from .APIs import (
    change_favourite_state, rem_dups, delete_account, erase_disk, log_out,
    get_user_info_for_settings, get_items, upload_items_get_token,
    edit_share_info, get_share_info, rem_items, move_item, rename_item,
    mkdir, download_items_get_token
)
from .WSs import handle_download_items, handle_upload_items

router = APIRouter(prefix=PREFIX)

# Include API routers
router.include_router(change_favourite_state.router)
router.include_router(rem_dups.router)
router.include_router(delete_account.router)
router.include_router(erase_disk.router)
router.include_router(log_out.router)
router.include_router(get_user_info_for_settings.router)
router.include_router(get_items.router)
router.include_router(upload_items_get_token.router)
router.include_router(edit_share_info.router)
router.include_router(get_share_info.router)
router.include_router(rem_items.router)
router.include_router(move_item.router)
router.include_router(rename_item.router)
router.include_router(mkdir.router)
router.include_router(download_items_get_token.router)

# Include WebSocket routers
router.include_router(handle_download_items.router)
router.include_router(handle_upload_items.router)

