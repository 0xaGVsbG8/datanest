from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException, Request
from app_independencies import Request, __STORAGE_VAULT_PATH

router = APIRouter()
from sqlalchemy.orm import Session
from fastapi import Depends, BackgroundTasks, HTTPException
from pydantic import BaseModel
from db_conn import get_db
from views.models import ITEMINFO
import uuid
import threading
from typing import List, Literal
import asyncio
import os
from sqlalchemy import and_
from views.models import shared_items






class route_data(BaseModel):
    token: str
    items_ls: list
    filter_by: Literal['off','shared']


class RESPONSE(BaseModel):
    url_token: uuid.uuid4
    
    
USERS_DIR_DOWNLOAD_REQUESTS_DATA:List[RESPONSE] = []
data_lock = asyncio.Lock()
    
    
async def drop_token(token: uuid.uuid4, delay: int = 20):
    await asyncio.sleep(delay)
    async with data_lock:
        for index,record in enumerate(USERS_DIR_DOWNLOAD_REQUESTS_DATA):
            if record['url_token'] == token:
                USERS_DIR_DOWNLOAD_REQUESTS_DATA.pop(index)
                break
            
    
    

@router.post('/sec/gen-zip-dir-token/')
async def view(request: Request, route: route_data, background_tasks: BackgroundTasks, db: Session = Depends(get_db),):
    
    user = request.state.user
    if route.filter_by == 'off':
        if route.token == 'main':
            result = db.query(ITEMINFO).filter(ITEMINFO.path==user).first()
            if not result:
                default_record = ITEMINFO(
                    path = user,
                    owner = user,
                    type = 'dir',
                    url_token = str(uuid.uuid4()),
                    isFavourite = False
                )
                db.add(default_record)
                db.commit()
                result = default_record
        else:
            result = db.query(ITEMINFO).filter(ITEMINFO.url_token==route.token).first()

        mainpath = result.path
        

    if route.filter_by == 'shared':
        token_ls = [item['token'] for item in route.items_ls]
        result = db.query(shared_items).filter(and_(shared_items.local_token.in_(token_ls),shared_items.allowed_by.any(user))).all()
        mainpath =  result[0].path if route.token == 'main' else db.query(shared_items).filter(and_(shared_items.local_token == route.token),shared_items.allowed_by.any(user)).first().path


    if result:
        
        if request.headers.get('multiple') == 'true':
            token_ls = [item['token'] for item in route.items_ls]
            
            if route.filter_by != 'shared':
                result = db.query(ITEMINFO).filter(ITEMINFO.url_token.in_(token_ls)).all()
                
                
            token = uuid.uuid4()
            item_ls = []
            for record in result:
                item_ls.append(record.path)
                    
            
            item_ls = [str(os.path.join(__STORAGE_VAULT_PATH, item)).replace('\\','/') for  item in item_ls]
            temp_item_ls = []
            for item in item_ls:
                if os.path.isdir(item):
                    for root,_,files in os.walk(item):
                        if len(files)==0:
                            temp_item_ls.append(root)
                        for f in files:
                            temp_item_ls.append(os.path.join(root,f))
                else:
                    temp_item_ls.append(item)
                    
            item_ls = list(set(temp_item_ls))
            
            if not item_ls:
                raise HTTPException(status_code=403, detail="Empty item ls")

            
                
            token_data = {
                'url_token': token,
                'client_id': request.cookies['client_id'],
                'multiple': True,
                'items_path':item_ls,
                'path':  mainpath
            }
            

        else:
            token = uuid.uuid4()
            token_data = {
                'url_token': token,
                'client_id': request.cookies['client_id'],
                'multiple': False,
                'items_path':[],
                'path':  result.path
            }

            
        async with data_lock:
            USERS_DIR_DOWNLOAD_REQUESTS_DATA.append(token_data)
            background_tasks.add_task(drop_token,token)
        return {'url_token': token}
    
   
    #item not found case     
    raise HTTPException(status_code=404, detail="Item not found")

