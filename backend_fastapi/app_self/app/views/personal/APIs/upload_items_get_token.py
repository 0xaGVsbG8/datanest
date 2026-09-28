from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException, Request
from app_dependencies import Request, __STORAGE_VAULT_PATH

router = APIRouter()
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
from modules import read_cfg_json, manage_redis





class userdata(BaseModel):
    path_token: str
    packsize: int | float
    filter_by: Literal['off','shared']



# upload_token_data_ls = []
# data_lock = asyncio.Lock()


# async def dump_token_data(token, delay: int = 600):
#     await asyncio.sleep(delay)
#     async with data_lock:
#         upload_token_data_ls_temp  = upload_token_data_ls.copy()
#         for i,record in enumerate(upload_token_data_ls_temp):
#             if record['token'] == token:
#                 upload_token_data_ls.pop(i)
#                 break





@router.post('/sec/gen-upload-token/')
async def view(request: Request, userdata: userdata, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):


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
        max_upload_size = await read_cfg_json.get_max_upload_size()
        max_storage_per_acc = await read_cfg_json.get_max_storage_per_acc()
        print(userdata.packsize, max_upload_size,'wxss')
        if not userdata.packsize > max_upload_size:
            if get_folder_size(path) + userdata.packsize < max_storage_per_acc:

                print('Uploader accepted!')
                token = str(uuid.uuid4())
                token_data = {
                    "token": token,
                    "owner": OWNER,
                    "path": path,
                    "parent_token": userdata.path_token,
                }
                manage_redis.dump_upload_token_data(token_data)
                # background_tasks.add_task(manage_redis.dump_token_data, token_data)
                # upload_token_data_ls.append(token_data)
                # async with data_lock:
                #     background_tasks.add_task(dump_token_data, token)
                background_tasks.add_task(manage_redis.drop_upload_token_data,token)

                
                return {"token" : token}
        else:
            msg = f'This file is larger than allowed max upload size\nYou file size: {userdata.packsize / (1024*1024)}MBs\nUpload size limit: {max_upload_size}'
            print(msg)
            return {'upload_refused': True, 'err_msg': msg}
    
        print('insufficient space on users disk!')
        # return {'result':'insufficient_space'}




    
