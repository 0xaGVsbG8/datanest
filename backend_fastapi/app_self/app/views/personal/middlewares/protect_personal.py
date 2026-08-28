
from app_independencies import app, Request
from fastapi.responses import Response, JSONResponse
from db_conn import get_db
from modules import get_user
from starlette.middleware.base import BaseHTTPMiddleware
from app_independencies import TEST_ACC_FOR_DEV_PURPOSES, ALLOW_TEST_ACC_FOR_DEV_PURPOSES

personal_prefix = '/sec/'



#if user not detected in server cookies return access denied which will cause a client not to be able to access personal APIs and WSs
class protect_personal_views(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        URL = request.url.path
        if personal_prefix in URL:
            db = next(get_db())
            try:
                if not request.cookies.get('test_acc'):
                    user = get_user.get(request, db)
                else:
                    if not ALLOW_TEST_ACC_FOR_DEV_PURPOSES:
                        return JSONResponse({'access': 'denied'})
                    user = TEST_ACC_FOR_DEV_PURPOSES

                if user:
                    request.state.user = user
                    response: Response = await call_next(request)
                    return response
                else:
                    return JSONResponse({'access': 'denied'})
               

            finally:
                db.close()
        
        response: Response = await call_next(request)
        return response
        
    
app.add_middleware(protect_personal_views)