
from app_dependencies import app, Request, __STORAGE_VAULT_PATH, PREFIX
from fastapi.responses import Response, JSONResponse
from db_conn import get_db
from views.models import ITEMINFO, shared_items
from starlette.staticfiles import StaticFiles
from modules import get_user
from starlette.middleware.base import BaseHTTPMiddleware
from app_dependencies import TEST_ACC_FOR_DEV_PURPOSES, ALLOW_TEST_ACC_FOR_DEV_PURPOSES
from sqlalchemy import and_, or_
from urllib.parse import quote



STORAGE_PREFIX = '/global_storage/'
INTERNAL_STORAGE = '/internal_storage/'


app.mount(PREFIX + STORAGE_PREFIX,StaticFiles(directory=__STORAGE_VAULT_PATH),name='global_storage')


async def serve_storage(request: Request, call_next, resrc_path: str):
    # Behind nginx: auth only here, nginx sendfile streams the bytes.
    if request.headers.get('x-real-ip'):
        return Response(
            status_code=200,
            headers={'X-Accel-Redirect': INTERNAL_STORAGE + quote(resrc_path, safe='/')},
        )
    return await call_next(request)


#using db to determinate if user has access to asked resources
class protect_resources_mw(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        URL = request.url.path
        if STORAGE_PREFIX in URL:
            try:
                db = next(get_db())
                if not request.cookies.get('test_acc'):
                    user = get_user.get(request, db)
                else:
                    if not ALLOW_TEST_ACC_FOR_DEV_PURPOSES:
                        return JSONResponse({'access': 'denied'})
                    user = TEST_ACC_FOR_DEV_PURPOSES

                if not user:
                    return JSONResponse({'access':'denied'}, status_code=403)

                resrc_path = URL.split(STORAGE_PREFIX)[1].replace('\\','/')
                print(f'Requested resource --> {resrc_path} by --> {user}')
                iteminfo = db.query(ITEMINFO).filter(and_(ITEMINFO.path == resrc_path,ITEMINFO.owner==user)).first()
                if iteminfo:
                    return await serve_storage(request, call_next, resrc_path)
                
                sharedinfo = db.query(shared_items).filter(shared_items.path == resrc_path).first()

                if sharedinfo:
                    if sharedinfo.overall_access == 'restricted':
                        if sharedinfo.owner == user or user in sharedinfo.allowed_by:
                            return await serve_storage(request, call_next, resrc_path)
                        else:
                            pass
                    if sharedinfo.overall_access == 'anyone':
                        return await serve_storage(request, call_next, resrc_path)
                    
                    
                print('user dont have access to those')
                return JSONResponse({'access':'denied'}, status_code=403)


            finally:
                db.close()

        return await call_next(request)
        
    
app.add_middleware(protect_resources_mw)
