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
from modules import get_user




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
            acc_dir_size = get_folder_size(path)
            # print(acc_dir_size, 'xdd')
            if acc_dir_size + userdata.packsize < max_storage_per_acc:
                
                
                USER_CACHED_UPLOAD_SIZE = manage_redis.get_user_cached_upload_size(user)
                if USER_CACHED_UPLOAD_SIZE + userdata.packsize > max_storage_per_acc:
                    print('uploades in que exceed total avaible space left')
                    msg = f"""
                    Uploades in que exceed total avaible space left on this account,
                    This file: {userdata.packsize / (1024*1024):.2f}MBs,
                    Uploads in que: {USER_CACHED_UPLOAD_SIZE / (1024*1024):.2f}MBs,
                    Your storage left: {((max_storage_per_acc - acc_dir_size)) / (1024*1024):.2f}MBs.
                    """
                    return {'upload_refused': True, 'err_title':'Upload refused','err_msg': msg}
                
                print('Uploader accepted!', USER_CACHED_UPLOAD_SIZE)
                token = str(uuid.uuid4())
                token_data = {
                    "token": token,
                    "owner": OWNER,
                    "path": path,
                    "parent_token": userdata.path_token,
                    "user": user,
                    "packsize": userdata.packsize,
                }
                manage_redis.dump_upload_token_data(token_data)
                # background_tasks.add_task(manage_redis.dump_token_data, token_data)
                # upload_token_data_ls.append(token_data)
                # async with data_lock:
                #     background_tasks.add_task(dump_token_data, token)
                background_tasks.add_task(manage_redis.drop_upload_token_data,token)
                
                manage_redis.store_upload_size(user, userdata.packsize)
                
                return {"token" : token}
            
            else:
                print('too big for storage')
                msg = f"""
                This file is larger than your account storage left, this file size: {userdata.packsize / (1024*1024):.2f}MBs.
                Your storage left: {(max_storage_per_acc - acc_dir_size) / (1024*1024):.2f}MBs.
                """
                return {'upload_refused': True, 'err_title':'Upload refused','err_msg': msg}
                
            
        else:
            msg = f"""
            This file is larger than allowed max upload size.
            You file size: {userdata.packsize / (1024*1024):.2f}MBs.
            Upload size limit: {max_upload_size  / (1024*1024):.2f}MBs.
            """
            # print(msg)
            return {'upload_refused': True, 'err_title':'Upload refused','err_msg': msg}
    
    return {'upload_refused': True, 'err_title':'Upload refused','err_msg': 'You have no access to upload here'}




    
