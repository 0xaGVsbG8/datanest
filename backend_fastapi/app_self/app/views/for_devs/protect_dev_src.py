
from app_independencies import app, Request
from fastapi.responses import Response, JSONResponse
from db_conn import get_db
from views.models import User
from modules import get_user
from starlette.middleware.base import BaseHTTPMiddleware





#AUTHENTICATE IF USER IS DEV, IF NOT RETURNS ACCESS DENIED MSG
class protect_dev_scr(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        URL = request.url.path
        if 'dev' in URL:
            try:
                db = next(get_db())
                user = get_user.get(request, db)
                isDev = False

                if user:
                    result = db.query(User).filter(User.email==user).first()
                    if result:
                        isDev = result.isDev
                        if isDev:
                            request.state.user = user
                else:
                    return JSONResponse({'access': 'denied'})

            finally:

                db.close()

      
        
        response: Response = await call_next(request)
        return response
        
    
app.add_middleware(protect_dev_scr)