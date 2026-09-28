from app_dependencies import app, Request
from fastapi.responses import JSONResponse
from fastapi import status
from starlette.middleware.base import BaseHTTPMiddleware
from pydantic import BaseModel
import time
from typing import Dict


MAX_REQUESTS_AMOUNT = 40
MAX_REQUESTS_PER = 6  # secs


class client_data_props(BaseModel):
    first_request: float
    requests_amount: int


clients_data: Dict[str, client_data_props] = {}


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
        now = time.time()

        if ip not in clients_data:
            clients_data[ip] = client_data_props(
                first_request=now,
                requests_amount=0,
            )

        client_data = clients_data[ip]

        if now - client_data.first_request > MAX_REQUESTS_PER:
            client_data.first_request = now
            client_data.requests_amount = 0

        client_data.requests_amount += 1

        if client_data.requests_amount > MAX_REQUESTS_AMOUNT:
            return JSONResponse(
                {"detail": "Too many requests"},
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        return await call_next(request)

print('request timeouter added to the pull!')
app.add_middleware(Requests_timeouter)
