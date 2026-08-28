from fastapi import APIRouter, Depends, BackgroundTasks, Request
from app_independencies import Request, __STORAGE_VAULT_PATH, PREFIX, ZIP_ARCS_PATH

router = APIRouter()
from sqlalchemy.orm import Session
from fastapi import Depends, BackgroundTasks
from pydantic import BaseModel, Field
from db_conn import get_db
from views.models import ITEMINFO, shared_items
from typing import Literal
import os
from sqlalchemy import and_
from overseer import assign_path_token
from modules import find_new_item_path
from .edit_share_info import recurent_update


class userdata(BaseModel):
    token: str
    dirname: str = Field(..., min_length=1)
    filter_by: Literal['shared','off']


class RESPONSE(BaseModel):
    url: bool | str


@router.post('/sec/mkdir/', response_model = RESPONSE)
async def view(request: Request, userdata: userdata, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):

    user = request.state.user
    token = False
    print(f'User is asking to create a dir --> {userdata.dirname} in --> {userdata.token}')
    if user:
        
        if userdata.token == 'main' and userdata.filter_by == 'shared':
            return {'url':False}
        
        if userdata.token == 'main':
            dirpath = os.path.join(__STORAGE_VAULT_PATH, user, userdata.dirname)
            if os.path.exists(dirpath):
                dirpath = find_new_item_path.get(dirpath)
            os.makedirs(dirpath)
            token = assign_path_token(dirpath, user)
    
        else:
            iteminfo_query = db.query(ITEMINFO).filter(and_(ITEMINFO.url_token == userdata.token, ITEMINFO.owner == user)).first()
            sharedinfo_query = None
            if not iteminfo_query:
                sharedinfo_query = db.query(shared_items).filter(shared_items.local_token == userdata.token).first()

            ignore_sharedinfo_query = False

            if sharedinfo_query:
                if sharedinfo_query.access_type == 'browse-only':
                    ignore_sharedinfo_query = True
                else:
                    ignore_sharedinfo_query = False

                if not ignore_sharedinfo_query:
                    if sharedinfo_query.overall_access == 'restricted' and user in sharedinfo_query.allowed_by:
                        ignore_sharedinfo_query = False
                    else:
                        ignore_sharedinfo_query = True

            if ignore_sharedinfo_query:
                sharedinfo_query = None

                


            result = iteminfo_query or sharedinfo_query
            

            if result:
                dirpath = os .path.join(__STORAGE_VAULT_PATH, result.path, userdata.dirname)
                if os.path.exists(dirpath):
                    dirpath = find_new_item_path.get(dirpath)
                    
                os.makedirs(dirpath)
                token = assign_path_token(dirpath, result.owner)

                recurent_update(db, result.path, False)


        return {'url': token}
    

    return {'url': False}







