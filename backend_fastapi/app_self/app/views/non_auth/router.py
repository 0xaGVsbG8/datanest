from fastapi import APIRouter
from app_independencies import PREFIX
from .APIs import login, register, log_out, verify_op, reset_password

router = APIRouter(prefix=PREFIX)

router.include_router(login.router)
router.include_router(register.router)
router.include_router(log_out.router)
router.include_router(verify_op.router)
router.include_router(reset_password.router)

