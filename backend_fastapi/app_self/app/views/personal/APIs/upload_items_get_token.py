from app_independencies import router,Request, __STORAGE_VAULT_PATH
from sqlalchemy.orm import Session
from fastapi import Depends, BackgroundTasks, HTTPException
from pydantic import BaseModel
from db_conn import get_db
from views.models import ITEMINFO, shared_items
import uuid
from typing import Literal
import asyncio
import os
from sqlalchemy import and_
from modules.format_size import get_folder_size
from modules import read_cfg_json





class userdata(BaseModel):
    path_token: str
    packsize: int | float
    filter_by: Literal['off','shared']



upload_token_data_ls = []
data_lock = asyncio.Lock()


async def dump_token_data(token, delay: int = 10):
    await asyncio.sleep(delay)
    async with data_lock:
        upload_token_data_ls_temp  = upload_token_data_ls.copy()
        for i,record in enumerate(upload_token_data_ls_temp):
            if record['token'] == token:
                upload_token_data_ls.pop(i)
                break





@router.post('/sec/gen-upload-token/')
async def view(request: Request, userdata: userdata, background: BackgroundTasks, db: Session = Depends(get_db)):


    user = request.state.user
    path = False
    OWNER = None

    if userdata.filter_by == 'off':
        if userdata.path_token == 'main':
            path = os.path.join(__STORAGE_VAULT_PATH, user)
            OWNER = user
        else:
            iteminfo = db.query(ITEMINFO).filter(and_(ITEMINFO.url_token == userdata.path_token,ITEMINFO.owner==user)).first()
            sharedinfo = None
            if not iteminfo:
                sharedinfo = db.query(shared_items).filter(shared_items.local_token == userdata.path_token).first()
                if sharedinfo:
                    if sharedinfo.overall_access == 'restricted' and user not in sharedinfo.allowed_by:
                        sharedinfo = None
                    if sharedinfo.access_type == 'browse-only':
                        sharedinfo = None
                    
            result = iteminfo or sharedinfo
            if result:
                path = os.path.join(__STORAGE_VAULT_PATH, result.path)
                OWNER = result.owner

    else:
        if userdata.path_token != 'main':
            result = db.query(shared_items).filter(shared_items.local_token==userdata.path_token).first()
            if result.access_type == 'editing':
                if result.overall_access == 'restricted':
                    if user not in result.allowed_by:
                        return False
                
                path = os.path.join(__STORAGE_VAULT_PATH, result.path)
                OWNER = result.owner

            else:
                raise HTTPException(status_code=403, detail="Access denied")





    if path:
        if not userdata.packsize > await read_cfg_json.get_max_upload_size():
            if get_folder_size(path) + userdata.packsize < await read_cfg_json.get_max_storage_per_acc():

                print('Uploader accepted!')
                token = str(uuid.uuid4())
                token_data = {
                    "token": token,
                    "owner": OWNER,
                    "path": path,
                    "parent_token": userdata.path_token,
                }
                upload_token_data_ls.append(token_data)
                async with data_lock:
                    background.add_task(dump_token_data, token)

                
                return {"token" : token}
    
        print('insufficient space on users disk!')
        return {'result':'insufficient_space'}




    