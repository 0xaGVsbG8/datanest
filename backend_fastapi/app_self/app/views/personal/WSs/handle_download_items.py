from app_independencies import app, router,Request, __STORAGE_VAULT_PATH, PREFIX, ZIP_ARCS_PATH
from fastapi.responses import Response, JSONResponse
from fastapi.websockets import WebSocket, WebSocketDisconnect
from starlette.responses import Response
from starlette.middleware.base import BaseHTTPMiddleware
import ast
from sqlalchemy.orm import Session
from db_conn import get_db
from views.models import ITEMINFO, zipinfo
from modules import zipper
import uuid
import asyncio
import os, shutil
from starlette.staticfiles import StaticFiles
from sqlalchemy import and_
from views.personal.APIs.download_items_get_token import USERS_DIR_DOWNLOAD_REQUESTS_DATA


zip_url_prefix = '/arc/startl_'

ZIP_STORAGE_URL = PREFIX + zip_url_prefix
app.mount(ZIP_STORAGE_URL,StaticFiles(directory=ZIP_ARCS_PATH),name='zip_storage')

print(f'mounted {ZIP_STORAGE_URL}')


# app.mount(PREFIX + zip_url, StaticFiles(directory=os.path.dirname(zippath)), name=zip_url)


def dump_arc(path, ziptoken):
    if os.path.exists(path):
        try:
            db = next(get_db())
            try:
                os.remove(path)
                shutil.rmtree(os.path.dirname(path))

                result = db.query(zipinfo).filter(zipinfo.zip_token == ziptoken).first()

                if result:
                    db.delete(result)

                db.commit()
                
                return True
            finally:
                db.close()

        except OSError as e:
            return False



async def asyncio_dump_arc(path, ziptoken):
    while True:
        succed = dump_arc(path, ziptoken)
        if succed:
            break
        await asyncio.sleep(10)




@router.websocket('/track-zipping-progress/')
async def view(websocket: WebSocket, ):
    route_token = websocket.query_params.get('access_token')
    LET_IN = False
    zip_token = None
    await asyncio.sleep(0.5)
    if route_token:
        user_data = {}
        route_token = uuid.UUID(route_token)
        for record in USERS_DIR_DOWNLOAD_REQUESTS_DATA:
            if record['url_token'] == route_token:
                PATH = record['path']
                CLIENT_ID = record['client_id']
                user_data = record
                LET_IN = True
                break
        
        if LET_IN:
            
            DONE = False
            
            await websocket.accept()
            db: Session = next(get_db())
            try:
                while True:
                    if not DONE:
                        dirpath = (os.path.join(__STORAGE_VAULT_PATH, PATH)).replace('\\','/')
                        zippath = (os.path.join(ZIP_ARCS_PATH, str(uuid.uuid4()), os.path.basename(PATH)+'.zip')).replace('\\','/')
                        print(f'zipping dir --> {dirpath} to --> {zippath}')
                        if not os.path.exists(os.path.dirname(zippath)):
                            os.makedirs(os.path.dirname(zippath))
                        
                        
                        items = user_data.get('items_path') or None
                        index = 1
                        total_count = len(items) if items else 0
                        
                        
                        async for _, index in zipper.gen_ziparc(dirpath, zippath, items):
                            await websocket.send_json({
                                'progress': _,
                                'index': index,
                                'total_count': total_count
                            })
                            
                            
                        await websocket.send_json({
                            'progress': 100,
                            'index': total_count,
                            'total_count': total_count
                        })

                        
                        zip_token =  os.path.dirname(zippath.split(ZIP_ARCS_PATH+'/')[1])
                        
                        
                        
                        new_zipinfo_record = zipinfo(
                            zip_token = zip_token,
                            user_token = CLIENT_ID,
                        )
                        
                        db.add(new_zipinfo_record)
                        db.commit()
                        
                        
                        ZIP_URL = os.path.normpath(zip_url_prefix+f"/{zippath.replace(ZIP_ARCS_PATH, '')}").replace('\\','/')
                        await websocket.send_json({
                            "zip_url": ZIP_URL,
                            'zip_name': os.path.basename(zippath)
                        })    

                        print('Done!')
                        DONE = True
                            
                        print('Listening for users exit!')
                        await asyncio.sleep(10)
                        asyncio.create_task(asyncio_dump_arc(zippath, zip_token))
                        await websocket.close()
                        break

                
            except (WebSocketDisconnect, RuntimeError):
                asyncio.create_task(asyncio_dump_arc(zippath, zip_token))
                print('user disconected in a prime loop !')
            
    else:
        websocket.close()
            
            
            
            
        
        
        
class ARC_PROTECTOR(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        URL = request.url.path
        if 'arc' in URL:
            try:
                ZIP_TOKEN = URL.split('startl_')[1]
                ZIP_TOKEN = ZIP_TOKEN.split('/')[1].strip()
                CLIENT_ID = request.cookies.get('client_id')

                if ZIP_TOKEN and CLIENT_ID:
                    db: Session = next(get_db())
                    try:
                        result = db.query(zipinfo).filter(zipinfo.zip_token == ZIP_TOKEN).first()
                        if result:
                            if result.user_token == CLIENT_ID:
                                return await call_next(request)
                            else:
                                return JSONResponse(content = {'Access':'denied'}, status_code=403)
                    
                        else:
                            return JSONResponse(content={'Location': "Could not find!"}, status_code=404)
                    
                    finally:
                        db.close()

                else:
                    return JSONResponse(content = {'Access':'denied'}, status_code=403)
                    
            except Exception as e:
                return JSONResponse(content={'query':'invalid',' err --> ': str(e)}, status_code=404)
        
        return await call_next(request)
        
    
app.add_middleware(ARC_PROTECTOR)