from app_dependencies import app, Request
from fastapi.responses import Response
from fastapi.websockets import WebSocket
from starlette.responses import Response
from starlette.middleware.base import BaseHTTPMiddleware
import uuid

#Made for authenticate simple operations like zipfiles, ownership etc... nothing vulnerable
class ASSIGN_CLIENT_ID(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        
        if not request.cookies.get('client_id'):
            response.set_cookie(
                key = 'client_id',
                value = str(uuid.uuid4()),
                path='/',
                max_age=60*60*24*365*10,
                httponly = True
            )
            
        return response
    
    
app.add_middleware(ASSIGN_CLIENT_ID)