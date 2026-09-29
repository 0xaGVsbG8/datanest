from app_dependencies import app, Request
from fastapi.responses import JSONResponse
from fastapi import status
from starlette.middleware.base import BaseHTTPMiddleware
from modules import manage_redis


MAX_REQUESTS_AMOUNT = 40
MAX_REQUESTS_PER = 6  # secs


def client_ip(request: Request) -> str:
    real = request.headers.get('x-real-ip')
    if real:
        return real.strip()
    forwarded = request.headers.get('x-forwarded-for')
    if forwarded:
        return forwarded.split(',')[0].strip()
    return request.client.host if request.client else 'unknown'


class Requests_timeouter(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        ip = client_ip(request)
        try:
            over = manage_redis.rate_limit_exceeded(
                f'http:{ip}', MAX_REQUESTS_AMOUNT, MAX_REQUESTS_PER
            )
        except Exception:
            over = False
        if over:
            return JSONResponse(
                {"detail": "Too many requests"},
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        return await call_next(request)

print('request timeouter added to the pull!')
app.add_middleware(Requests_timeouter)
